
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProductCardProps {
  imageUrl: string;
  title: string;
  price: number;
}

export default function ProductCard({
  imageUrl,
  title,
  price,
}: ProductCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-square relative">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover rounded-md"
          />
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-lg font-semibold">
          {price ? `$${price}` : "Price not available"}
        </p>
      </CardFooter>
    </Card>
  );
}
