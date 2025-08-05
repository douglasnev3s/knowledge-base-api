export enum UserRole {
  ADMIN = 'Admin',
  EDITOR = 'Editor',
  VIEWER = 'Viewer'
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUserDto {
  name: string;
  email: string;
  role: UserRole;
}

export interface IUpdateUserDto {
  name?: string;
  email?: string;
  role?: UserRole;
}