#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { ApiError, ClassHubApi } from './api.mjs';

const api = new ClassHubApi();
const server = new McpServer({ name: 'classhub', version: '1.0.0' });

/* ---------- helpers de respuesta ---------- */

const ok = (data) => ({
  content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
});

const fail = (err) => {
  const message =
    err instanceof ApiError
      ? `${err.status ? `[${err.status}] ` : ''}${err.message}`
      : (err?.message ?? String(err));
  return { content: [{ type: 'text', text: message }], isError: true };
};

const run = async (fn) => {
  try {
    return ok(await fn());
  } catch (err) {
    return fail(err);
  }
};

/* ---------- normalización y resolución de asignaturas ---------- */

const normalize = (value) =>
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const fetchSubjects = () => api.get('/subjects');

const resolveSubjectIds = async (tokens, knownSubjects) => {
  if (!tokens || tokens.length === 0) return [];
  const subjects = knownSubjects ?? (await fetchSubjects());
  const names = subjects.map((s) => s.name).join(', ');
  const ids = [];

  for (const token of tokens) {
    const byId = subjects.find((s) => s.id === token);
    if (byId) {
      ids.push(byId.id);
      continue;
    }

    const needle = normalize(token);
    const exact = subjects.filter((s) => normalize(s.name) === needle);
    const loose = exact.length ? exact : subjects.filter((s) => normalize(s.name).includes(needle));

    if (loose.length === 0) {
      throw new Error(`No encontré la asignatura "${token}". Disponibles: ${names}`);
    }
    if (loose.length > 1) {
      throw new Error(
        `"${token}" es ambiguo y coincide con: ${loose.map((s) => s.name).join(', ')}. ` +
          'Usá el id exacto (lo devuelve list_subjects).',
      );
    }
    ids.push(loose[0].id);
  }

  return ids;
};

/* ---------- resúmenes compactos ---------- */

const subjectSummary = (s) => ({
  id: s.id,
  name: s.name,
  img: s.img ?? null,
  materialsUrl: s.materialsUrl ?? null,
  files: (s.files ?? []).map((f) => ({ id: f.id, title: f.title, url: f.url })),
});

const classSummary = (c) => ({
  id: c.id,
  date: c.date,
  week: c.week,
  title: c.title ?? null,
  url: c.url,
  subjects: (c.subjects ?? []).map((cs) => cs.subject.name),
  links: (c.links ?? []).map((l) => ({ id: l.id, title: l.title, url: l.url })),
});

/* ---------- esquemas reutilizables ---------- */

const dateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Usá el formato YYYY-MM-DD (ej. 2026-09-28)');

const urlField = z.url({ message: 'Debe ser una URL completa, ej. https://drive.google.com/…' });

const linkField = z.object({
  title: z.string().max(120).optional(),
  url: urlField,
});

const classInput = z.object({
  date: dateField.describe('Fecha de la clase (YYYY-MM-DD). La semana se calcula en el servidor.'),
  url: urlField.describe('Enlace de Google Drive de la clase.'),
  title: z.string().optional().describe('Título opcional. Si se omite se muestra la asignatura y la semana.'),
  subjects: z
    .array(z.string())
    .optional()
    .describe('Nombres o ids de las asignaturas de la clase.'),
  links: z.array(linkField).optional().describe('Archivos/enlaces asociados a la clase.'),
});

/* ---------- tools de lectura ---------- */

server.registerTool(
  'list_subjects',
  {
    title: 'Listar asignaturas',
    description:
      'Devuelve todas las asignaturas del catálogo con su id, nombre, carpeta de materiales y archivos adjuntos (con sus ids). Usá los ids para las demás tools.',
    inputSchema: {},
  },
  async () =>
    run(async () => {
      const subjects = await fetchSubjects();
      return { total: subjects.length, subjects: subjects.map(subjectSummary) };
    }),
);

server.registerTool(
  'list_classes',
  {
    title: 'Listar clases',
    description:
      'Devuelve las clases del catálogo, con sus fechas, semana, asignaturas y archivos adjuntos. Permite filtrar por semana y por asignatura (nombre o id).',
    inputSchema: {
      week: z.number().int().positive().optional().describe('Filtrar por número de semana.'),
      subject: z.string().optional().describe('Asignatura (nombre o id) para filtrar.'),
    },
  },
  async ({ week, subject }) =>
    run(async () => {
      let subjectId;
      if (subject) {
        const [id] = await resolveSubjectIds([subject]);
        subjectId = id;
      }
      const params = new URLSearchParams();
      if (week) params.set('week', String(week));
      if (subjectId) params.set('subjectId', subjectId);
      const qs = params.toString();
      const classes = await api.get(`/classes${qs ? `?${qs}` : ''}`);
      return { total: classes.length, classes: classes.map(classSummary) };
    }),
);

server.registerTool(
  'find_subject',
  {
    title: 'Buscar asignatura',
    description:
      'Busca una asignatura por nombre (ignora mayúsculas y acentos). Devuelve las coincidencias con su id.',
    inputSchema: {
      name: z.string().min(1).describe('Nombre o parte del nombre de la asignatura.'),
    },
  },
  async ({ name }) =>
    run(async () => {
      const subjects = await fetchSubjects();
      const needle = normalize(name);
      const matches = subjects.filter((s) => normalize(s.name).includes(needle));
      return { total: matches.length, matches: matches.map(subjectSummary) };
    }),
);

/* ---------- tools de alta y edición ---------- */

server.registerTool(
  'create_subject',
  {
    title: 'Crear asignatura',
    description: 'Crea una asignatura nueva en el catálogo, opcionalmente con archivos adjuntos.',
    inputSchema: {
      name: z.string().min(1).describe('Nombre de la asignatura (ej. "Física").'),
      img: urlField.optional().describe('URL de la imagen de portada.'),
      materialsUrl: urlField.optional().describe('URL de la carpeta de materiales en Drive.'),
      files: z
        .array(linkField)
        .optional()
        .describe('Archivos iniciales: [{ title?, url }].'),
    },
  },
  async ({ name, img, materialsUrl, files }) =>
    run(async () => {
      const body = { name };
      if (img) body.img = img;
      if (materialsUrl) body.materialsUrl = materialsUrl;
      if (files?.length) body.files = files;
      const created = await api.post('/subjects', body);
      return { created: subjectSummary(created) };
    }),
);

server.registerTool(
  'update_subject',
  {
    title: 'Editar asignatura',
    description:
      'Edita una asignatura existente. Solo se envían los campos indicados; enviá null para vaciar img o materialsUrl.',
    inputSchema: {
      id: z.string().min(1).describe('Id de la asignatura.'),
      name: z.string().min(1).optional().describe('Nuevo nombre.'),
      img: urlField.nullable().optional().describe('Nueva imagen de portada (null para vaciar).'),
      materialsUrl: urlField
        .nullable()
        .optional()
        .describe('Nueva carpeta de materiales (null para vaciar).'),
    },
  },
  async ({ id, name, img, materialsUrl }) =>
    run(async () => {
      const body = {};
      if (name !== undefined) body.name = name;
      if (img !== undefined) body.img = img;
      if (materialsUrl !== undefined) body.materialsUrl = materialsUrl;
      const updated = await api.patch(`/subjects/${id}`, body);
      return { updated: subjectSummary(updated) };
    }),
);

server.registerTool(
  'create_class',
  {
    title: 'Crear clase',
    description:
      'Crea una clase con su fecha, enlace de Drive, asignaturas (por nombre o id) y archivos adjuntos. La semana se calcula automáticamente en el servidor.',
    inputSchema: classInput.shape,
  },
  async ({ date, url, title, subjects, links }) =>
    run(async () => {
      const subjectIds = await resolveSubjectIds(subjects ?? []);
      const body = { date, url, subjectIds };
      if (title) body.title = title;
      if (links?.length) body.links = links;
      const created = await api.post('/classes', body);
      return { created: classSummary(created) };
    }),
);

server.registerTool(
  'update_class',
  {
    title: 'Editar clase',
    description:
      'Edita una clase existente: fecha, enlace, título o asignaturas. Para agregar o modificar archivos usá add_class_link / update_class_link.',
    inputSchema: {
      id: z.string().min(1).describe('Id de la clase.'),
      date: dateField.optional(),
      url: urlField.optional(),
      title: z.string().optional().describe('Título (vacío para volver al automático).'),
      subjects: z.array(z.string()).optional().describe('Asignaturas (nombre o id). Reemplaza la lista completa.'),
    },
  },
  async ({ id, date, url, title, subjects }) =>
    run(async () => {
      const body = {};
      if (date !== undefined) body.date = date;
      if (url !== undefined) body.url = url;
      if (title !== undefined) body.title = title;
      if (subjects !== undefined) body.subjectIds = await resolveSubjectIds(subjects);
      const updated = await api.patch(`/classes/${id}`, body);
      return { updated: classSummary(updated) };
    }),
);

server.registerTool(
  'create_classes_batch',
  {
    title: 'Crear varias clases',
    description:
      'Crea de una sola vez varias clases (p. ej. una semana completa). Un error en una entrada no detiene el resto: se devuelve el resultado de cada una.',
    inputSchema: {
      classes: z
        .array(classInput)
        .min(1)
        .max(40)
        .describe('Lista de clases a crear. Máximo 40 por llamada.'),
    },
  },
  async ({ classes }) =>
    run(async () => {
      const subjects = await fetchSubjects();
      const results = [];
      let created = 0;

      for (const [index, item] of classes.entries()) {
        const entry = { index, date: item.date, url: item.url };
        try {
          const subjectIds = await resolveSubjectIds(item.subjects ?? [], subjects);
          const body = { date: item.date, url: item.url, subjectIds };
          if (item.title) body.title = item.title;
          if (item.links?.length) body.links = item.links;
          const saved = await api.post('/classes', body);
          entry.ok = true;
          entry.id = saved.id;
          entry.week = saved.week;
          created += 1;
        } catch (err) {
          entry.ok = false;
          entry.error =
            err instanceof ApiError
              ? `${err.status ? `[${err.status}] ` : ''}${err.message}`
              : (err?.message ?? String(err));
        }
        results.push(entry);
      }

      return { total: classes.length, created, failed: classes.length - created, results };
    }),
);

server.registerTool(
  'add_class_link',
  {
    title: 'Agregar archivo a una clase',
    description: 'Agrega un archivo o enlace (URL de Drive) a una clase existente.',
    inputSchema: {
      classId: z.string().min(1).describe('Id de la clase.'),
      url: urlField.describe('URL del archivo en Drive.'),
      title: z.string().max(120).optional().describe('Título opcional (si se omite se usa el dominio).'),
    },
  },
  async ({ classId, url, title }) =>
    run(async () => {
      const body = { url };
      if (title) body.title = title;
      const link = await api.post(`/classes/${classId}/links`, body);
      return { added: link };
    }),
);

server.registerTool(
  'update_class_link',
  {
    title: 'Editar archivo de una clase',
    description: 'Modifica el título o la URL de un archivo ya adjunto a una clase.',
    inputSchema: {
      classId: z.string().min(1).describe('Id de la clase.'),
      linkId: z.string().min(1).describe('Id del archivo (lo devuelve list_classes).'),
      url: urlField.optional(),
      title: z.string().max(120).optional(),
    },
  },
  async ({ classId, linkId, url, title }) =>
    run(async () => {
      const body = {};
      if (url !== undefined) body.url = url;
      if (title !== undefined) body.title = title;
      const link = await api.patch(`/classes/${classId}/links/${linkId}`, body);
      return { updated: link };
    }),
);

server.registerTool(
  'add_subject_file',
  {
    title: 'Agregar archivo a una asignatura',
    description: 'Agrega un archivo o enlace (URL de Drive) a una asignatura existente.',
    inputSchema: {
      subjectId: z.string().min(1).describe('Id de la asignatura.'),
      url: urlField.describe('URL del archivo en Drive.'),
      title: z.string().max(120).optional().describe('Título opcional (si se omite se usa el dominio).'),
    },
  },
  async ({ subjectId, url, title }) =>
    run(async () => {
      const body = { url };
      if (title) body.title = title;
      const file = await api.post(`/subjects/${subjectId}/files`, body);
      return { added: file };
    }),
);

server.registerTool(
  'update_subject_file',
  {
    title: 'Editar archivo de una asignatura',
    description: 'Modifica el título o la URL de un archivo ya adjunto a una asignatura.',
    inputSchema: {
      subjectId: z.string().min(1).describe('Id de la asignatura.'),
      fileId: z.string().min(1).describe('Id del archivo (lo devuelve list_subjects).'),
      url: urlField.optional(),
      title: z.string().max(120).optional(),
    },
  },
  async ({ subjectId, fileId, url, title }) =>
    run(async () => {
      const body = {};
      if (url !== undefined) body.url = url;
      if (title !== undefined) body.title = title;
      const file = await api.patch(`/subjects/${subjectId}/files/${fileId}`, body);
      return { updated: file };
    }),
);

/* ---------- arranque ---------- */

process.on('uncaughtException', (err) => {
  console.error('classhub MCP uncaught:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('classhub MCP unhandled:', err);
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`classhub MCP listo → ${api.baseUrl}`);
