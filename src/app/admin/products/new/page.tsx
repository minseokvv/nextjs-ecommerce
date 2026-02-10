"use client";

import * as z from "zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
    name: z.string().min(1, "상품명을 입력해주세요"),
    description: z.string().min(1, "상품 설명을 입력해주세요"),
    price: z.coerce.number().min(1, "가격은 1원 이상이어야 합니다"),
    stock: z.coerce.number().min(0, "재고는 0개 이상이어야 합니다"),
    categoryId: z.string().min(1, "카테고리를 선택해주세요"),
    images: z.object({ url: z.string() }).array(),
    status: z.string().min(1),
});

type ProductFormValues = z.infer<typeof formSchema>;

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/categories");
                const json = await res.json();
                if (json.data && Array.isArray(json.data)) {
                    setCategories(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            stock: 0,
            categoryId: "",
            images: [],
            status: "SALE",
        },
    });

    const onSubmit = async (data: ProductFormValues) => {
        try {
            setLoading(true);
            const payload = {
                ...data,
                images: data.images.map((img) => img.url),
            };

            const response = await fetch("/api/admin/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || "상품 등록 실패");
            }

            router.push("/admin/products");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("상품 등록 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center space-x-4 mb-4">
                <Link href="/admin/products">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">상품 등록</h2>
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>상품 정보</CardTitle>
                        <CardDescription>상품의 기본 정보를 입력해주세요.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label>이미지</Label>
                                <ImageUpload
                                    value={form.watch("images").map((img) => img.url)}
                                    disabled={loading}
                                    onChange={(urls) => form.setValue("images", urls.map((url) => ({ url })))}
                                    onRemove={(url) => form.setValue("images", form.watch("images").filter((img) => img.url !== url))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">상품명</Label>
                                    <Input id="name" disabled={loading} {...form.register("name")} placeholder="상품명을 입력하세요" />
                                    {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">판매 상태</Label>
                                    <select
                                        id="status"
                                        disabled={loading}
                                        {...form.register("status")}
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    >
                                        <option value="SALE">판매중</option>
                                        <option value="SOLD_OUT">품절</option>
                                        <option value="HIDDEN">숨김</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">설명</Label>
                                <Textarea id="description" disabled={loading} {...form.register("description")} placeholder="상품 설명을 입력하세요" />
                                <p className="text-xs text-gray-500">상세페이지에 노출될 텍스트입니다. 추후 에디터 적용 예정.</p>
                                {form.formState.errors.description && <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">가격 (원)</Label>
                                    <Input id="price" type="number" disabled={loading} {...form.register("price")} placeholder="0" />
                                    {form.formState.errors.price && <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stock">재고 수량</Label>
                                    <Input id="stock" type="number" disabled={loading} {...form.register("stock")} placeholder="0" />
                                    {form.formState.errors.stock && <p className="text-sm text-red-500">{form.formState.errors.stock.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="categoryId">카테고리</Label>
                                <select
                                    id="categoryId"
                                    disabled={loading}
                                    {...form.register("categoryId")}
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    <option value="">카테고리 선택</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {categories.length === 0 && (
                                    <p className="text-xs text-red-500">등록된 카테고리가 없습니다. 카테고리 관리에서 먼저 등록해주세요.</p>
                                )}
                                {form.formState.errors.categoryId && <p className="text-sm text-red-500">{form.formState.errors.categoryId.message}</p>}
                            </div>

                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? "등록 중..." : "상품 등록"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
