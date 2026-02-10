import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";

interface ProductCardProps {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string | null;
    category?: { name: string };
}

export function ProductCard({
    id,
    name,
    description,
    price,
    imageUrl,
    category,
}: ProductCardProps) {
    return (
        <Link href={`/products/${id}`} className="group block h-full">
            <div className="h-full overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg border border-slate-100 flex flex-col">
                <div className="aspect-[4/3] w-full bg-gray-100 relative overflow-hidden">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300 bg-slate-50">
                            No Image
                        </div>
                    )}
                    {category && (
                        <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                            {category.name}
                        </span>
                    )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2 flex-1">
                        {description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-lg font-bold text-slate-900">
                            {price.toLocaleString()} 원
                        </span>
                        <span className="text-sm font-medium text-indigo-600 group-hover:underline">
                            View Details
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
