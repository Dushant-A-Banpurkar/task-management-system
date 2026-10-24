export type UserRole = 'admin' | 'user';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Task {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  assigneeId?: string;
  assignee?: User | null;
  createdBy?: User | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskComment {
  _id?: string;
  message: string;
  createdAt: string;
  user: User;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
