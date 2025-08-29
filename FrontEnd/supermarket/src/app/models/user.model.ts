export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  role: string;
  is_active: boolean;  // add this property
}
