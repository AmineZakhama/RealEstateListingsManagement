export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token?: string;
  favorites?: string[];
  phone?: string;
  contactEmail?: string;
  facebookLink?: string;
}
