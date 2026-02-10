
"use client";

import { useEffect, useState } from "react";
import { Star, User, Lock } from "lucide-react";

interface Review {
    id: string;
    rating: number;
    content: string;
    createdAt: string;
    user: { name: string | null; username: string | null };
}

export default function ProductReviews({ productId }: { productId: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState("");
    const [rating, setRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetch(`/api/reviews?productId=${productId}`)
            .then(res => res.json())
            .then(json => {
                setReviews(json.data || []);
            })
            .finally(() => setLoading(false));
    }, [productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, rating, content })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || "리뷰 등록 실패");

            alert("리뷰가 등록되었습니다.");
            window.location.reload();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <h3 className="text-xl font-bold">상품 후기 ({reviews.length})</h3>

            {/* Write Review Form */}
            <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                        >
                            ★
                        </button>
                    ))}
                    <span className="text-sm text-gray-500 ml-2">{rating}점</span>
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="상품에 대한 솔직한 후기를 남겨주세요."
                    className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-black min-h-[100px]"
                    required
                />
                <div className="text-right">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-black text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors"
                    >
                        {submitting ? "등록 중..." : "후기 등록"}
                    </button>
                </div>
            </form>

            {/* Review List */}
            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">아직 작성된 후기가 없습니다.</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                                        ))}
                                    </div>
                                    <span className="font-bold text-gray-900">{review.user.name || "익명"}</span>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-line">{review.content}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
