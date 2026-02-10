import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format } from "date-fns";

async function getProducts() {
    const products = await db.product.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
    return products;
}

export default async function ProductsPage() {
    const products = await getProducts();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">상품 관리</h2>
                <div className="flex items-center space-x-2">
                    <Link href="/admin/products/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> 상품 등록
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-slate-100/50 data-[state=selected]:bg-slate-100">
                                <th className="h-12 px-4 align-middle font-medium text-slate-500">상품명</th>
                                <th className="h-12 px-4 align-middle font-medium text-slate-500">상태</th>
                                <th className="h-12 px-4 align-middle font-medium text-slate-500">가격</th>
                                <th className="h-12 px-4 align-middle font-medium text-slate-500">재고</th>
                                <th className="h-12 px-4 align-middle font-medium text-slate-500">등록일</th>
                                <th className="h-12 px-4 align-middle font-medium text-slate-500 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="h-24 text-center">
                                        등록된 상품이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="border-b transition-colors hover:bg-slate-100/50">
                                        <td className="p-4 align-middle font-medium">{product.name}</td>
                                        <td className="p-4 align-middle">{product.status}</td>
                                        <td className="p-4 align-middle">{product.price.toLocaleString()} 원</td>
                                        <td className="p-4 align-middle">{product.stock}</td>
                                        <td className="p-4 align-middle">{format(product.createdAt, "yyyy-MM-dd")}</td>
                                        <td className="p-4 align-middle text-right">
                                            <Link href={`/admin/products/${product.id}`}>
                                                <Button variant="outline" size="sm">
                                                    수정
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
