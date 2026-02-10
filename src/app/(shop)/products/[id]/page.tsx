import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { ProductDetailClient } from "@/components/shop/ProductDetailClient";

interface ProductPageProps {
    params: {
        id: string;
    };
}

export const revalidate = 60;

export default async function ProductPage({ params }: ProductPageProps) {
    const product = await db.product.findUnique({
        where: {
            id: params.id,
        },
        include: {
            images: true,
            category: true,
        },
    });

    if (!product) {
        notFound();
    }

    return (
        <div className="bg-white min-h-screen py-12">
            <Container>
                <ProductDetailClient product={product} />
            </Container>
        </div>
    );
}
