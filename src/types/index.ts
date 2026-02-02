export interface UserData {
  email: string;
  role: 'editor' | 'viewer';
}

export interface Diagram {
  id: string;
  name: string;
  createdAt: Date;
  createdBy: string;
  sharedWith: SharedUser[];
  nodes: unknown[];
  edges: unknown[];
}

export interface SharedUser {
  email: string;
  access: 'view' | 'edit';
}

export interface Theme {
  mode: 'light' | 'dark';
}
