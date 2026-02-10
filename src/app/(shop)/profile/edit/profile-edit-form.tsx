"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Save, MapPin, Phone, Search, X } from "lucide-react";
import DaumPostcodeEmbed from "react-daum-postcode";

interface UserData {
    id: string;
    username: string | null;
    email: string | null;
    name: string | null;
    phone: string | null;
    zipcode: string | null;
    address: string | null;
    detailAddress: string | null;
}

export default function ProfileEditForm({ user }: { user: UserData }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isOpenPostcode, setIsOpenPostcode] = useState(false);
    const [formData, setFormData] = useState({
        email: user.email || "",
        name: user.name || "",
        phone: user.phone || "",
        zipcode: user.zipcode || "",
        address: user.address || "",
        detailAddress: user.detailAddress || ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

        setFormData(prev => ({
            ...prev,
            zipcode: data.zonecode,
            address: fullAddress
        }));
        setIsOpenPostcode(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/user", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Failed to update");

            alert("회원 정보가 수정되었습니다.");
            router.refresh();
            router.push("/profile");
        } catch (error) {
            console.error(error);
            alert("수정에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
                    {/* Read Only Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">아이디</label>
                            <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-700 font-medium">
                                {user.username || "설정안됨"}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">이메일</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="이메일을 입력하세요"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Editable Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">이름</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="이름을 입력하세요"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">연락처</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="연락처를 입력하세요 (010-0000-0000)"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">주소</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    name="zipcode"
                                    value={formData.zipcode}
                                    readOnly
                                    placeholder="우편번호"
                                    className="w-32 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsOpenPostcode(true)}
                                    className="px-4 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors flex items-center gap-2"
                                >
                                    <Search size={16} />
                                    주소 검색
                                </button>
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    readOnly
                                    placeholder="주소 검색을 통해 입력해주세요"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none mb-2"
                                />
                                <input
                                    type="text"
                                    name="detailAddress"
                                    value={formData.detailAddress}
                                    onChange={handleChange}
                                    placeholder="상세 주소를 입력하세요 (동, 호수 등)"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                    <Save size={20} />
                    {loading ? "저장 중..." : "정보 수정하기"}
                </button>
            </form>

            {/* Address Search Modal */}
            {isOpenPostcode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg">주소 검색</h3>
                            <button onClick={() => setIsOpenPostcode(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="h-[500px]">
                            <DaumPostcodeEmbed
                                onComplete={handleCompletePostcode}
                                style={{ height: "100%" }}
                                autoClose
                                scriptUrl="https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
