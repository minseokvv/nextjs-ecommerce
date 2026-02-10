"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function EditProduct({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        categoryId: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
        status: "SALE",
        purchaseLimit: "EVERYONE",
        minQuantity: 1,
        maxQuantity: "",
        useDefaultPoints: true,
        points: 0
    });

    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Categories
                const catRes = await fetch("/api/admin/categories");
                const catData = await catRes.json();
                setCategories(catData.data || []);

                // Fetch Product
                const prodRes = await fetch(`/api/admin/products?id=${params.id}`);
                if (!prodRes.ok) throw new Error("Product not found");
                const prodJson = await prodRes.json();
                const prodData = prodJson.data;

                setFormData({
                    name: prodData.name,
                    categoryId: prodData.categoryId,
                    description: prodData.description || "",
                    price: prodData.price,
                    stock: prodData.stock,
                    imageUrl: prodData.imageUrl || "",
                    status: prodData.status,
                    purchaseLimit: prodData.purchaseLimit,
                    minQuantity: prodData.minQuantity,
                    maxQuantity: prodData.maxQuantity || "",
                    useDefaultPoints: prodData.useDefaultPoints,
                    points: prodData.points || 0
                });
            } catch (err) {
                console.error(err);
                alert("상품 정보를 불러오지 못했습니다.");
                router.push("/admin/products");
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [params.id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append("file", file);

        try {
            const res = await fetch("/api/upload", { method: "POST", body: data });
            if (!res.ok) throw new Error("Upload failed");
            const json = await res.json();
            setFormData(prev => ({ ...prev, imageUrl: json.data?.url }));
        } catch (err) {
            alert("이미지 업로드 실패");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                id: params.id,
                ...formData,
                price: Number(formData.price),
                stock: Number(formData.stock),
                minQuantity: Number(formData.minQuantity),
                maxQuantity: formData.maxQuantity ? Number(formData.maxQuantity) : null,
                points: formData.useDefaultPoints ? 0 : Number(formData.points)
            };

            const res = await fetch("/api/admin/products", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                alert("수정되었습니다.");
                router.push("/admin/products");
            } else {
                const errData = await res.json();
                alert(errData.error?.message || "Update failed");
            }
        } catch (err) {
            console.error(err);
            alert("Error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/admin/products" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                    <ChevronLeft size={20} />
                </Link>
                <h2 className="text-2xl font-bold text-gray-900">상품 수정</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Same form layout as NewProduct, but with formData hooked up */}
                <section className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
                    <h3 className="mb-6 text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4">기본 정보</h3>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="mb-2 block text-sm font-medium text-gray-700">상품명</label>
                                <input
                                    name="name" required placeholder="상품명을 입력하세요"
                                    value={formData.name} onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">카테고리</label>
                                <select
                                    name="categoryId" required value={formData.categoryId} onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="" disabled>선택하세요</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">판매 가격</label>
                                <input
                                    name="price" type="number" required placeholder="0" min="0"
                                    value={formData.price} onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">대표 이미지</label>
                            <div className="flex items-start gap-4">
                                <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <ImageIcon className="text-gray-300" size={32} />
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Loader2 className="animate-spin text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file" accept="image/png, image/jpeg, image/gif"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    <input
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                        className="mt-1 input-field text-sm py-2"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">상세 설명</label>
                            <textarea
                                name="description" rows={5} placeholder="상품 상세 설명을 입력하세요"
                                value={formData.description} onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
                    <h3 className="mb-6 text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4">판매 및 재고 관리</h3>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">판매 상태</label>
                                <div className="flex gap-4">
                                    {["SALE", "SOLD_OUT", "HIDDEN"].map(status => (
                                        <label key={status} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio" name="status" value={status}
                                                checked={formData.status === status}
                                                onChange={handleChange}
                                                className="text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">
                                                {status === 'SALE' ? '판매중' : status === 'SOLD_OUT' ? '품절' : '비공개'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">재고 수량</label>
                                <input
                                    name="stock" type="number" required placeholder="0" min="0"
                                    value={formData.stock} onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">구매 제한</label>
                                <select
                                    name="purchaseLimit"
                                    value={formData.purchaseLimit}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="EVERYONE">모든 사용자 구매 가능</option>
                                    <option value="MEMBER">회원만 구매 가능</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">최소 주문 수량</label>
                                <input
                                    name="minQuantity" type="number" required min="1"
                                    value={formData.minQuantity} onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">최대 주문 수량 (선택)</label>
                                <input
                                    name="maxQuantity" type="number" placeholder="제한 없음" min="1"
                                    value={formData.maxQuantity} onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <label className="mb-2 block text-sm font-medium text-gray-700">적립금 설정</label>
                            <label className="flex items-center gap-2 mb-3">
                                <input
                                    type="checkbox" name="useDefaultPoints"
                                    checked={formData.useDefaultPoints}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-600">기본 적립금 설정 사용 (관리자 설정값)</span>
                            </label>

                            {!formData.useDefaultPoints && (
                                <div className="flex items-center gap-2 max-w-xs">
                                    <span className="text-sm text-gray-500">개별 적립금:</span>
                                    <input
                                        name="points" type="number" min="0" placeholder="0"
                                        value={formData.points} onChange={handleChange}
                                        className="input-field w-32"
                                    />
                                    <span className="text-sm text-gray-500">원</span>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <div className="flex justify-end gap-4">
                    <Link href="/admin/products" className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
                        취소
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                        수정 완료
                    </button>
                </div>
            </form>
            <style jsx global>{`
                .input-field {
                    display: block;
                    width: 100%;
                    border-radius: 0.75rem;
                    border-color: #E5E7EB;
                    background-color: #F9FAFB;
                    padding: 0.75rem 1rem;
                    font-size: 0.95rem;
                    color: #111827;
                }
                .input-field:focus {
                     border-color: #3B82F6;
                     background-color: #FFFFFF;
                     outline: 2px solid rgba(59, 130, 246, 0.2);
                }
            `}</style>
        </div>
    );
}
