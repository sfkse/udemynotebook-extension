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
  idnotes: string;
  content: string;
  createdAt: number;
  idlectures: string;
  isPublic: boolean;
  timestamp: string;
  section: string;
}

