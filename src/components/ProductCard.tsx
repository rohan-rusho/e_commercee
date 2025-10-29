import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  slug: string;
  isFeatured?: boolean;
}

export const ProductCard = ({
  id,
  name,
  price,
  imageUrl,
  stock,
  slug,
  isFeatured,
}: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(id);
  };

  return (
    <Link to={`/product/${slug}`}>
      <div className="product-card group">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {isFeatured && (
            <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
              Featured
            </Badge>
          )}
          
          {stock < 1 && (
            <Badge className="absolute top-2 right-2" variant="destructive">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              ${price.toFixed(2)}
            </span>
            
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={stock < 1}
              className="transition-all"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          {stock > 0 && stock < 10 && (
            <p className="text-xs text-muted-foreground mt-2">
              Only {stock} left in stock
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};
