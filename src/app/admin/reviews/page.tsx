"use client";

import { useState, useEffect } from "react";
import { Loader2, Star, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

interface Review {
    id: string;
    rating: number;
    content: string;
    createdAt: string;
    user: { name: string | null; username: string | null; email: string | null };
    product: { id: string; name: string; imageUrl: string | null };
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchReviews();
    }, [page]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/reviews?page=${page}&limit=15`);
            const json = await res.json();
            setReviews(json.data || []);
            setTotalPages(json.meta?.totalPages || 1);
            setTotal(json.meta?.total || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("이 리뷰를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

        try {
            const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("삭제 실패");
            fetchReviews();
        } catch (err) {
            alert("리뷰 삭제에 실패했습니다.");
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={14}
                        className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">리뷰 관리</h2>
                    <p className="text-sm text-gray-500 mt-1">전체 리뷰 {total}건</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상품</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">평점</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">내용</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작성자</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작성일</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="py-20 text-center">
                                    <Loader2 className="animate-spin mx-auto text-gray-400" />
                                </td>
                            </tr>
                        ) : reviews.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-20 text-center text-gray-500">
                                    등록된 리뷰가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            reviews.map((review) => (
                                <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                                {review.product.imageUrl && (
                                                    <img
                                                        src={review.product.imageUrl}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                                                {review.product.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{renderStars(review.rating)}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-700 truncate max-w-[250px]">
                                            {review.content}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {review.user?.name || review.user?.username || "알 수 없음"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(review.createdAt).toISOString().split("T")[0]}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                            title="삭제"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 items-center">
                <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="flex items-center gap-1 px-3 py-1.5 border rounded-lg disabled:opacity-30 hover:bg-gray-50 text-sm"
                >
                    <ChevronLeft size={14} /> 이전
                </button>
                <span className="text-sm font-medium px-2">
                    {page} / {totalPages || 1} 페이지
                </span>
                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="flex items-center gap-1 px-3 py-1.5 border rounded-lg disabled:opacity-30 hover:bg-gray-50 text-sm"
                >
                    다음 <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}
