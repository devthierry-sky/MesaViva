export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
}

export interface MenuProduct {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  priceCents: number;
  available: boolean;
  imageUrl?: string;
  modelGlbUrl?: string;
  modelAlt?: string;
  illustrativePrice?: boolean;
}

export interface PublicRestaurantMenu {
  slug: string;
  name: string;
  tagline: string;
  categories: MenuCategory[];
  products: MenuProduct[];
}
