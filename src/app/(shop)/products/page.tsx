import { db } from "@/lib/db";
import { ProductCard } from "@/components/shop/ProductCard";
import { Container } from "@/components/ui/Container";

interface ProductsPageProps {
    searchParams: {
        category?: string;
        sort?: string;
        q?: string;
    };
}

export const revalidate = 0; // Dynamic

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    const { category, sort, q } = searchParams;

    const where: any = {
        status: "SALE",
        isDeleted: false,
    };

    if (category) {
        where.category = {
            name: category,
        };
    }

    if (q) {
        where.name = {
            contains: q,
        };
    }

    const orderBy: any = {};
    if (sort === "price_asc") {
        orderBy.price = "asc";
    } else if (sort === "price_desc") {
        orderBy.price = "desc";
    } else {
        orderBy.createdAt = "desc";
    }

    const products = await db.product.findMany({
        where,
        orderBy,
        include: {
            category: true,
            images: true, // Fetch images for display
        },
    });

    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <Container>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">
                        {category ? `${category}` : "All Products"}
                    </h1>
                    <p className="text-slate-500 mt-2">
                        {products.length} items found
                    </p>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg border border-dashed text-slate-500">
                        No products found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                description={product.description}
                                price={product.price}
                                imageUrl={product.imageUrl || (product.images[0]?.url)}
                                category={product.category}
                            />
                        ))}
                    </div>
                )}
            </Container>
        </div>
    );
}
