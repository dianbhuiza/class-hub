import { fileURLToPath } from 'node:url';

const DEFAULT_BASE = 'https://class-hub-back.onrender.com/api';

// Las credenciales viven en apps/mcp/.env (ignorado por git) y no en el repositorio.
if (!process.env.CLASSHUB_EMAIL || !process.env.CLASSHUB_PASSWORD) {
  try {
    process.loadEnvFile(fileURLToPath(new URL('./.env', import.meta.url)));
  } catch {
    // sin .env local: se usan las variables de entorno del proceso
  }
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const TRANSIENT_STATUSES = new Set([502, 503, 504]);

export class ClassHubApi {
  #baseUrl;
  #email;
  #password;
  #timeoutMs;
  #token = null;

  constructor({ baseUrl, email, password, timeoutMs } = {}) {
    this.#baseUrl = (baseUrl ?? process.env.CLASSHUB_API_URL ?? DEFAULT_BASE).replace(
      /\/+$/,
      '',
    );
    this.#email = email ?? process.env.CLASSHUB_EMAIL ?? '';
    this.#password = password ?? process.env.CLASSHUB_PASSWORD ?? '';
    this.#timeoutMs = Number(timeoutMs ?? process.env.CLASSHUB_TIMEOUT_MS ?? 60000);
  }

  get baseUrl() {
    return this.#baseUrl;
  }

  get hasCredentials() {
    return Boolean(this.#email && this.#password);
  }

  async login() {
    if (!this.hasCredentials) {
      throw new ApiError(
        0,
        'Faltan credenciales: definí CLASSHUB_EMAIL y CLASSHUB_PASSWORD en la configuración del MCP.',
      );
    }
    const data = await this.#fetchJson(`${this.#baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.#email, password: this.#password }),
    });
    const token = data?.access_token;
    if (!token) throw new ApiError(0, 'El login no devolvió access_token.');
    this.#token = token;
    return token;
  }

  async request(path, { method = 'GET', body, retried401 = false } = {}) {
    if (!this.#token) await this.login();

    const headers = { Authorization: `Bearer ${this.#token}` };
    const payload = body === undefined ? undefined : JSON.stringify(body);
    if (payload !== undefined) headers['Content-Type'] = 'application/json';

    const res = await this.#fetch(`${this.#baseUrl}${path}`, {
      method,
      headers,
      body: payload,
    });

    if (res.status === 401 && !retried401) {
      this.#token = null;
      await this.login();
      return this.request(path, { method, body, retried401: true });
    }

    return this.#parse(res);
  }

  get(path) {
    return this.request(path);
  }

  post(path, body) {
    return this.request(path, { method: 'POST', body });
  }

  patch(path, body) {
    return this.request(path, { method: 'PATCH', body });
  }

  async #fetchJson(url, options) {
    const res = await this.#fetch(url, options);
    return this.#parse(res);
  }

  async #parse(res) {
    if (res.status === 204) return null;

    const raw = await res.text();
    let data = null;
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }
    }

    if (!res.ok) {
      const message =
        typeof data === 'string'
          ? data
          : Array.isArray(data?.message)
            ? data.message.join(' | ')
            : (data?.message ?? res.statusText ?? 'Error de la API');
      throw new ApiError(res.status, message);
    }

    return data;
  }

  async #fetch(url, options, attempt = 0) {
    let res;
    try {
      res = await fetch(url, { ...options, signal: AbortSignal.timeout(this.#timeoutMs) });
    } catch (err) {
      if (attempt < 2) {
        await sleep(3000 * (attempt + 1));
        return this.#fetch(url, options, attempt + 1);
      }
      throw new ApiError(
        0,
        `Sin respuesta de ${this.#baseUrl} (${err?.name ?? 'error'}: ${err?.message ?? err}). ` +
          'Si es la primera llamada, Render puede estar levantando el servicio (cold start).',
      );
    }

    if (TRANSIENT_STATUSES.has(res.status) && attempt < 3) {
      await sleep(4000 * (attempt + 1));
      return this.#fetch(url, options, attempt + 1);
    }

    return res;
  }
}
