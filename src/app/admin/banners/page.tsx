"use client";

import { useState, useEffect } from "react";
import {
    Loader2,
    Plus,
    Trash2,
    ArrowUp,
    ArrowDown,
    Eye,
    EyeOff,
    ExternalLink,
    Image as ImageIcon,
} from "lucide-react";

interface Banner {
    id: string;
    title: string;
    imageUrl: string;
    link: string | null;
    isActive: boolean;
    order: number;
    createdAt: string;
}

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    // New banner form
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newImageUrl, setNewImageUrl] = useState("");
    const [newLink, setNewLink] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/banners");
            const json = await res.json();
            setBanners(json.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newImageUrl.trim()) {
            setFormError("제목과 이미지 URL을 입력해주세요.");
            return;
        }

        setSubmitting(true);
        setFormError("");

        try {
            const res = await fetch("/api/admin/banners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTitle,
                    imageUrl: newImageUrl,
                    link: newLink || null,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error?.message || "등록 실패");
            }

            setNewTitle("");
            setNewImageUrl("");
            setNewLink("");
            setShowForm(false);
            fetchBanners();
        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("이 배너를 삭제하시겠습니까?")) return;

        try {
            const res = await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("삭제 실패");
            fetchBanners();
        } catch (err) {
            alert("배너 삭제에 실패했습니다.");
        }
    };

    const handleToggleActive = async (banner: Banner) => {
        const newActive = !banner.isActive;
        // Optimistic update
        setBanners((prev) =>
            prev.map((b) => (b.id === banner.id ? { ...b, isActive: newActive } : b))
        );

        try {
            await fetch("/api/admin/banners", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: banner.id, isActive: newActive }),
            });
        } catch (err) {
            alert("상태 변경 실패");
            fetchBanners();
        }
    };

    const handleMove = async (index: number, direction: "up" | "down") => {
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === banners.length - 1) return;

        const newBanners = [...banners];
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        const temp = newBanners[index];
        newBanners[index] = newBanners[targetIndex];
        newBanners[targetIndex] = temp;

        const updated = newBanners.map((b, idx) => ({ ...b, order: idx }));
        setBanners(updated);

        try {
            await fetch("/api/admin/banners", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    banners: updated.map((b) => ({ id: b.id, order: b.order })),
                }),
            });
        } catch (err) {
            alert("순서 변경 실패");
            fetchBanners();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">배너 관리</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        메인 페이지에 노출되는 배너를 관리합니다.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                    <Plus size={18} />
                    배너 추가
                </button>
            </div>

            {/* Add Banner Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">새 배너 등록</h3>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    배너 제목 *
                                </label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="예: 여름 세일 배너"
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    이미지 URL *
                                </label>
                                <input
                                    type="text"
                                    value={newImageUrl}
                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                    placeholder="https://... 또는 /uploads/banner.jpg"
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    링크 (선택)
                                </label>
                                <input
                                    type="text"
                                    value={newLink}
                                    onChange={(e) => setNewLink(e.target.value)}
                                    placeholder="클릭 시 이동할 URL"
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            {formError && <p className="text-sm text-red-600">{formError}</p>}
                            <div className="flex gap-2 ml-auto">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <Loader2 className="animate-spin" size={16} />
                                    ) : (
                                        <Plus size={16} />
                                    )}
                                    등록
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Banner List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center">
                        <Loader2 className="animate-spin mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">로딩 중...</p>
                    </div>
                ) : banners.length === 0 ? (
                    <div className="py-20 text-center">
                        <ImageIcon className="mx-auto text-gray-300 mb-3" size={48} />
                        <p className="text-gray-500">등록된 배너가 없습니다.</p>
                        <p className="text-sm text-gray-400 mt-1">
                            위의 &quot;배너 추가&quot; 버튼으로 첫 배너를 등록해보세요.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {banners.map((banner, index) => (
                            <div
                                key={banner.id}
                                className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${!banner.isActive ? "opacity-50" : ""
                                    }`}
                            >
                                {/* Order Buttons */}
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => handleMove(index, "up")}
                                        disabled={index === 0}
                                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ArrowUp size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleMove(index, "down")}
                                        disabled={index === banners.length - 1}
                                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ArrowDown size={14} />
                                    </button>
                                </div>

                                {/* Preview Image */}
                                <div className="w-32 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                        src={banner.imageUrl}
                                        alt={banner.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "";
                                            (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-gray-900 truncate">
                                        {banner.title}
                                    </h3>
                                    {banner.link && (
                                        <a
                                            href={banner.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5"
                                        >
                                            <ExternalLink size={10} />
                                            {banner.link.length > 40
                                                ? banner.link.slice(0, 40) + "..."
                                                : banner.link}
                                        </a>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(banner.createdAt).toISOString().split("T")[0]}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleActive(banner)}
                                        className={`p-2 rounded-lg transition-colors ${banner.isActive
                                            ? "text-green-600 hover:bg-green-50"
                                            : "text-gray-400 hover:bg-gray-100"
                                            }`}
                                        title={banner.isActive ? "비활성화" : "활성화"}
                                    >
                                        {banner.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(banner.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                        title="삭제"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
