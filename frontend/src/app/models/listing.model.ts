import { Category } from './category.model';
import { User } from './user.model';

export interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  address?: string;
  category: Category | string;
  agent: User | string;
  images: string[];
  features?: {
    bedrooms?: number;
    bathrooms?: number;
    squareFeet?: number;
  };
  createdAt?: string;
}

export interface ListingResponse {
  listings: Listing[];
  page: number;
  pages: number;
  total: number;
}
