"use client";

import { useState, useEffect } from "react";
import { formatPhoneNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Plus, Trash2 } from "lucide-react";
import DaumPostcodeEmbed from "react-daum-postcode";

interface Address {
    id: string;
    name: string;
    recipient: string;
    phone: string;
    address: string;
    detailAddress?: string;
    zipcode?: string;
    isDefault: boolean;
}

export function AddressListModal({ onSelect }: { onSelect: (addr: Address) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // New Address Form State
    const [formData, setFormData] = useState({
        name: "",
        recipient: "",
        phone: "",
        address: "",
        detailAddress: "",
        zipcode: "",
        isDefault: false
    });

    const fetchAddresses = async () => {
        setIsLoading(true);
        try {
            // 5초 타임아웃 추가
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const res = await fetch("/api/user/addresses", {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const json = await res.json();
            if (json.success) {
                setAddresses(json.data || []);
            } else {
                console.error("API Error:", json.error?.message);
                setAddresses([]);
            }
        } catch (error: any) {
            console.error("Failed to fetch addresses", error);
            if (error.name === 'AbortError') {
                alert("주소 불러오기 시간이 초과되었습니다. 개발 서버를 재시작해주세요.");
            }
            setAddresses([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchAddresses();
            setIsAdding(false);
            setIsSearching(false);
        }
    }, [isOpen]);

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/user/addresses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const json = await res.json();

            if (json.success) {
                await fetchAddresses(); // Refresh list
                setIsAdding(false); // Back to list view
                setFormData({ name: "", recipient: "", phone: "", address: "", detailAddress: "", zipcode: "", isDefault: false });
            } else {
                alert(json.error?.message || "주소 추가 실패");
            }
        } catch (error) {
            console.error(error);
            alert("오류가 발생했습니다.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("정말 이 주소를 삭제하시겠습니까?")) return;

        try {
            const res = await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchAddresses();
            } else {
                alert("삭제 실패");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSelect = (addr: Address) => {
        onSelect(addr);
        setIsOpen(false);
    };

    const handleCompletePostcode = (data: any) => {
        let fullAddress = data.address;
        let extraAddress = "";

        if (data.addressType === "R") {
            if (data.bname !== "") {
                extraAddress += data.bname;
            }
            if (data.buildingName !== "") {
                extraAddress += extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
            }
            fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
        }

        setFormData({
            ...formData,
            zipcode: data.zonecode,
            address: fullAddress,
        });
        setIsSearching(false);
    };

    // Format phone in form
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setFormData({ ...formData, phone: formatted });
    };

    return (
        <>
            <Button variant="outline" size="sm" type="button" onClick={() => setIsOpen(true)}>
                주소록 불러오기
            </Button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={isAdding ? (isSearching ? "주소 검색" : "새 배송지 추가") : "배송지 목록"}>
                {isSearching ? (
                    <div className="h-[400px]">
                        <div className="mb-2 text-right">
                            <Button variant="ghost" size="sm" onClick={() => setIsSearching(false)}>닫기</Button>
                        </div>
                        <DaumPostcodeEmbed
                            onComplete={handleCompletePostcode}
                            style={{ height: '100%' }}
                            autoClose={false}
                        />
                    </div>
                ) : isAdding ? (
                    <form onSubmit={handleAddAddress} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="addr-name">배송지명 (예: 집)</Label>
                            <Input id="addr-name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="집, 회사 등" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="addr-recipient">받는 사람</Label>
                            <Input id="addr-recipient" value={formData.recipient} onChange={e => setFormData({ ...formData, recipient: e.target.value })} required placeholder="이름" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="addr-phone">연락처</Label>
                            <Input id="addr-phone" value={formData.phone} onChange={handlePhoneChange} required placeholder="010-1234-5678" maxLength={13} />
                        </div>
                        <div className="grid gap-2">
                            <Label>주소</Label>
                            <div className="flex gap-2 mb-2">
                                <Input value={formData.zipcode} readOnly placeholder="우편번호" className="w-24 bg-gray-50" />
                                <Button type="button" variant="outline" onClick={() => setIsSearching(true)}>주소 검색</Button>
                            </div>
                            <Input value={formData.address} readOnly placeholder="기본 주소" className="bg-gray-50 mb-2" required />
                            <Input value={formData.detailAddress} onChange={e => setFormData({ ...formData, detailAddress: e.target.value })} placeholder="상세주소 입력" required />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="addr-default"
                                checked={formData.isDefault}
                                onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor="addr-default" className="text-sm font-normal cursor-pointer">기본 배송지로 설정</Label>
                        </div>

                        <div className="flex gap-2 justify-end mt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>취소</Button>
                            <Button type="submit">저장</Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="text-center py-8 text-gray-500">로딩 중...</div>
                        ) : addresses.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">저장된 배송지가 없습니다.</div>
                        ) : (
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                                {addresses.map((addr) => (
                                    <div key={addr.id} className="border rounded-lg p-3 hover:bg-slate-50 relative group transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900">{addr.name}</span>
                                                {addr.isDefault && (
                                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">기본</span>
                                                )}
                                            </div>
                                            <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(addr.id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="삭제">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div
                                            className="text-sm text-gray-600 space-y-1 cursor-pointer"
                                            onClick={() => handleSelect(addr)}
                                        >
                                            <p>{addr.recipient} / {addr.phone}</p>
                                            <p className="line-clamp-1">({addr.zipcode}) {addr.address} {addr.detailAddress}</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="w-full mt-3 h-8 text-xs"
                                            onClick={() => handleSelect(addr)}
                                        >
                                            이 주소로 선택
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {addresses.length < 5 && (
                            <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full border-dashed">
                                <Plus size={16} className="mr-2" /> 새 배송지 추가
                            </Button>
                        )}
                        {addresses.length >= 5 && (
                            <p className="text-xs text-center text-gray-500">최대 5개까지만 저장할 수 있습니다.</p>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
}
