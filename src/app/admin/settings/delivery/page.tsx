"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";

interface Template {
    id: string;
    name: string;
    shippingInfo: string;
    returnInfo: string;
}

export default function DeliverySettingsPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

    // Form Stats
    const [name, setName] = useState("");
    const [shippingInfo, setShippingInfo] = useState("");
    const [returnInfo, setReturnInfo] = useState("");

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/delivery-templates");
            const json = await res.json();
            if (json.data) setTemplates(Array.isArray(json.data) ? json.data : []);
        } catch (e) {
            alert("템플릿 로딩 실패");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (template?: Template) => {
        if (template) {
            setEditingTemplate(template);
            setName(template.name);
            setShippingInfo(template.shippingInfo);
            setReturnInfo(template.returnInfo);
        } else {
            setEditingTemplate(null);
            setName("");
            setShippingInfo("");
            setReturnInfo("");
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!name) return alert("템플릿 이름을 입력해주세요.");

        const payload = { name, shippingInfo, returnInfo };
        try {
            if (editingTemplate) {
                // Update
                const res = await fetch(`/api/admin/delivery-templates/${editingTemplate.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error();
            } else {
                // Create
                const res = await fetch(`/api/admin/delivery-templates`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error();
            }
            setIsModalOpen(false);
            fetchTemplates();
        } catch (e) {
            alert("저장 실패");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        try {
            await fetch(`/api/admin/delivery-templates/${id}`, { method: 'DELETE' });
            fetchTemplates();
        } catch (e) {
            alert("삭제 실패");
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">배송/반품 템플릿 관리</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                    <Plus size={18} />
                    새 템플릿 만들기
                </button>
            </div>

            {loading ? (
                <div>로딩 중...</div>
            ) : templates.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200 text-gray-500">
                    등록된 템플릿이 없습니다.
                </div>
            ) : (
                <div className="grid gap-4">
                    {templates.map(t => (
                        <div key={t.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between group">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 mb-2">{t.name}</h3>
                                <div className="text-sm text-gray-500 line-clamp-2">
                                    <span className="font-medium text-gray-700">배송안내:</span> {t.shippingInfo.slice(0, 50)}...
                                </div>
                                <div className="text-sm text-gray-500 line-clamp-2">
                                    <span className="font-medium text-gray-700">반품안내:</span> {t.returnInfo.slice(0, 50)}...
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(t)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(t.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold">{editingTemplate ? "템플릿 수정" : "새 템플릿 생성"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">템플릿 이름</label>
                                <input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="예: 기본 배송 안내, 냉동 식품 배송 안내"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">배송 안내 문구</label>
                                <textarea
                                    value={shippingInfo}
                                    onChange={e => setShippingInfo(e.target.value)}
                                    rows={5}
                                    placeholder="배송 기간, 배송비 정책 등을 입력하세요."
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">교환/반품 안내 문구</label>
                                <textarea
                                    value={returnInfo}
                                    onChange={e => setReturnInfo(e.target.value)}
                                    rows={5}
                                    placeholder="교환 및 반품 규정을 입력하세요."
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-white"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200"
                            >
                                저장하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
