export interface Sale {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  total_price: number;
   date?: string; 
}