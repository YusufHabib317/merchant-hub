import { Product } from '@/schemas/product';

export interface PublicMerchant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  address: string | null;
  isChatEnabled: boolean;
  products: Product[];
  _count: {
    products: number;
  };
}
