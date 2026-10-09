export type CatalogProduct = {
  id: string;
  shelf: string;
  brand: string;
  product_name: string;
  image_file: string | null;
  image_url: string | null;
  image_status: string | null;
  needs_restock: string | null;
  restock_done: string | null;
  barcode_sku: string | null;
  restock_note: string | null;
  source_review_note: string | null;
};
