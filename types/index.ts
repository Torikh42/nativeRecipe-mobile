export interface Recipe {
  id: string;
  created_at: string;
  owner_id: string;
  title: string;
  description: string;
  instructions: string;
  image_url?: string;
}

export interface Ingredient {
  id: string;
  created_at: string;
  recipe_id: string;
  name: string;
  quantity: string;
}
