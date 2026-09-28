export interface Subject {
  id: string;
  name: string;
  img: string | null;
  materialsUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSubject {
  subject: Subject;
}

export interface ClassItem {
  id: string;
  title: string | null;
  url: string;
  date: string;
  week: number;
  subjects: ClassSubject[];
  createdAt: string;
  updatedAt: string;
}

export interface WeekGroup {
  week: number;
  classes: ClassItem[];
}

export interface ClassFileInfo {
  fileId: string | null;
  filename: string | null;
  sizeBytes: number | null;
  contentType: string | null;
  downloadUrl: string | null;
}

export interface LoginResponse {
  user: { id: string; email: string; name: string | null };
  access_token: string;
}
