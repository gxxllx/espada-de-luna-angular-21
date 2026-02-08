export interface Product {
  id: number;
  product_name: string;
  product_description: string;
  price: number;
  category_id: number;
  image_url: string;
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: number;
  product_id: number;
  size_id: number;
  color_id: number;
  stock: number;
  sale_price: number | null;
  sale_start_date: string | null;
  sale_end_date: string | null;
}

export interface ProductDetail {
  product: Product;
  variants: ProductVariant[];
}
