export interface Product {
  id: number;
  slug: string;
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
  size_name: string;
  color_id: number;
  color_name: string;
  color_hex: string;
  stock: number;
  sale_price: number | null;
  sale_start_date: string | null;
  sale_end_date: string | null;
}

export interface ProductDetail {
  product: Product;
  variants: ProductVariant[];
}

export interface ProductCreate {
  product_name: string;
  product_description?: string;
  price: number;
  image_url?: string;
  category_id: number;
  volume_cm3?: number;
  weight_g?: number;
}

export interface ProductVariantCreate {
  color_id?: number;
  size_id?: number;
  stock: number;
}

export interface ProductImageCreate {
  color_id?: number;
  name: string;
  order_index: number;
}

export interface ProductCreateRequest extends ProductCreate {
  variants: ProductVariantCreate[];
  images: ProductImageCreate[];
}

export type ProductAdmin = Pick<Product, 'id' | 'image_url' | 'product_name' | 'price'> & {
  category_name: string;
  total_stock: number;
  total_variants: number;
  total_items?: number;
};
