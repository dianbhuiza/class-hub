export interface Subject {
  id: string;
  name: string;
  img: string | null;
  createdAt: string;
  updatedAt: string;
  files?: SubjectFile[];
}

export interface SubjectFile {
  id: string;
  subjectId: string;
  title: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSubject {
  subject: Subject;
}

export interface ClassLink {
  id: string;
  classId: string;
  subjectId: string | null;
  subject?: Subject | null;
  title: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassItem {
  id: string;
  title: string | null;
  url: string;
  date: string;
  week: number;
  subjects: ClassSubject[];
  links?: ClassLink[];
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
