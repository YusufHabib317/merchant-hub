import { Grid } from '@mantine/core';
import { ProductCard } from './ProductCard';

interface Product {
  id: string;
  name: string;
  description?: string;
  priceUSD: number;
  priceSYP?: number;
  imageUrls?: string[];
  category?: string;
}

interface ProductListProps {
  products: Product[];
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ProductList({
  products,
  showActions = false,
  onEdit = undefined,
  onDelete = undefined,
}: ProductListProps) {
  return (
    <Grid>
      {products.map((product) => (
        <Grid.Col key={product.id} span={{ base: 12, sm: 6, md: 4 }}>
          <ProductCard
            id={product.id}
            name={product.name}
            description={product.description}
            priceUSD={product.priceUSD}
            priceSYP={product.priceSYP || 0}
            imageUrls={product.imageUrls}
            category={product.category}
            showActions={showActions}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Grid.Col>
      ))}
    </Grid>
  );
}
