import Link from "next/link";
import { db } from "@/lib/db";
import { ShoppingBag } from "lucide-react";
import RollingBanner from "@/components/ui/banner";
import { Prisma } from "@prisma/client";

async function getProducts(categoryId?: string, searchTerm?: string) {
    try {
        const whereClause: Prisma.ProductWhereInput = {};

        if (categoryId && categoryId !== 'all') {
            // Check if it's likely an ID (UUID-ish) or fallback to name if needed (optional)
            // But sidebar sends ID now.
            whereClause.categoryId = categoryId;
        }

        if (searchTerm) {
            whereClause.OR = [
                { name: { contains: searchTerm } }, // remove mode: 'insensitive' for sqlite compatibility if needed, but default is usually case sens in sqlite without setup
                { description: { contains: searchTerm } }
            ];
        }

        const products = await db.product.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: { category: true } // Include category to show name if needed
        });
        return products;
    } catch (e) {
        console.error("Failed to fetch products", e);
        return [];
    }
}

export default async function Home({
    searchParams,
}: {
    searchParams: { category?: string; q?: string };
}) {
    const category = searchParams.category;
    const searchQuery = searchParams.q || "";

    const filteredProducts = await getProducts(category, searchQuery);

    let categoryName = "신상품";
    if (category && category !== 'all') {
        const catObj = await db.category.findUnique({
            where: { id: category },
            select: { name: true }
        });
        if (catObj) categoryName = catObj.name;
    }

    return (
        <div className="min-h-screen">
            <RollingBanner />

            <main className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {searchQuery ? `'${searchQuery}' 검색 결과` : categoryName}
                    </h2>
                    <span className="text-sm text-gray-500">{filteredProducts.length}개 상품</span>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
                        <p className="text-lg text-gray-500">조건에 맞는 상품이 없습니다.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                        {filteredProducts.map((product) => (
                            <Link href={`/products/${product.id}`} key={product.id} className="group relative block">
                                <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 relative">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                                            이미지 없음
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 flex justify-between">
                                    <div>
                                        <h3 className="text-sm text-gray-700 font-medium">
                                            <span aria-hidden="true" className="absolute inset-0" />
                                            {product.name}
                                        </h3>
                                        <p className="mt-1 text-sm font-medium text-gray-900">{product.price.toLocaleString()}원</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
