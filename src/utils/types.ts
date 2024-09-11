export interface IUser {
  userID: string;
  email: string;
  plan?: string;
}

export interface ICourse {
  idcourses: string;
  title: string;
  createdAt: number;
  idusers: string;
}

export interface INote {
  idnotes?: string;
  title: string;
  content: string;
  idcourses: string;
  isPublic: boolean;
  timestamp: string;
  lecture: string;
  idusers: string;
}

