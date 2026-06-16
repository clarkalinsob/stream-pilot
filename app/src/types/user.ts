export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type AuthResponse = {
  user: User;
};

export type MeResponse = {
  user: User;
};

export type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};
