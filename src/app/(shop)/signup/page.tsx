"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DaumPostcodeEmbed from "react-daum-postcode";

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        phone1: "010",
        phone2: "",
        phone3: "",
        zipcode: "",
        address: "",
        addressDetail: "",
    });

    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreeAge, setAgreeAge] = useState(false);
    const [agreeMarketing, setAgreeMarketing] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
        setIsPostcodeOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (!formData.username || formData.username.length < 5) {
            setError("아이디는 영문, 숫자 5자 이상이어야 합니다.");
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("비밀번호는 6자 이상이어야 합니다.");
            setIsLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.");
            setIsLoading(false);
            return;
        }

        if (!agreeTerms) {
            setError("이용약관 및 개인정보 수집·이용에 동의해주세요.");
            setIsLoading(false);
            return;
        }

        if (!agreeAge) {
            setError("만 14세 이상인지 확인해주세요.");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    phone: `${formData.phone1}-${formData.phone2}-${formData.phone3}`,
                    zipcode: formData.zipcode,
                    address: `${formData.address} ${formData.addressDetail}`,
                    marketingConsent: agreeMarketing,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error?.message || "회원가입 실패");
            }

            alert("회원가입이 완료되었습니다! 로그인해주세요.");
            router.push("/login");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-lg space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">회원가입</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        필수 정보를 입력해주세요.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        {/* ID */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">아이디 *</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                placeholder="영문, 숫자 5자 이상"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일 *</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                placeholder="example@email.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">이름 *</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                placeholder="이름"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">비밀번호 *</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                placeholder="6자 이상 입력해주세요"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">비밀번호 확인 *</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                placeholder="비밀번호 확인"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">휴대폰 번호 *</label>
                            <div className="mt-1 flex gap-2">
                                <input
                                    type="text"
                                    name="phone1"
                                    className="block w-full rounded-md border-gray-300 py-2 px-3 text-center text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                    value={formData.phone1}
                                    maxLength={3}
                                    onChange={handleChange}
                                />
                                <span className="flex items-center text-gray-500">-</span>
                                <input
                                    type="text"
                                    name="phone2"
                                    className="block w-full rounded-md border-gray-300 py-2 px-3 text-center text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                    value={formData.phone2}
                                    maxLength={4}
                                    onChange={handleChange}
                                />
                                <span className="flex items-center text-gray-500">-</span>
                                <input
                                    type="text"
                                    name="phone3"
                                    className="block w-full rounded-md border-gray-300 py-2 px-3 text-center text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                    value={formData.phone3}
                                    maxLength={4}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">주소 *</label>
                            <div className="mt-1 flex gap-2">
                                <input
                                    type="text"
                                    name="zipcode"
                                    readOnly
                                    placeholder="우편번호"
                                    className="block w-32 rounded-md border-gray-300 py-2 px-3 text-gray-900 shadow-sm bg-gray-50 sm:text-sm"
                                    value={formData.zipcode}
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsPostcodeOpen(true)}
                                    className="rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                                >
                                    검색하기
                                </button>
                            </div>
                            <input
                                type="text"
                                name="address"
                                readOnly
                                placeholder="기본 주소"
                                className="mt-2 block w-full rounded-md border-gray-300 py-2 px-3 text-gray-900 shadow-sm bg-gray-50 sm:text-sm"
                                value={formData.address}
                            />
                            <input
                                type="text"
                                name="addressDetail"
                                placeholder="상세 주소 입력"
                                className="mt-2 block w-full rounded-md border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                value={formData.addressDetail}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center pb-2 border-b border-gray-100 mb-2">
                            <input
                                id="agreeAll"
                                name="agreeAll"
                                type="checkbox"
                                checked={agreeTerms && agreeAge && agreeMarketing}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setAgreeTerms(checked);
                                    setAgreeAge(checked);
                                    setAgreeMarketing(checked);
                                }}
                                className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
                            />
                            <label htmlFor="agreeAll" className="ml-2 block text-base font-bold text-gray-900 cursor-pointer">
                                전체 동의하기
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                id="agreeTerms"
                                name="agreeTerms"
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                            />
                            <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                                <span className="font-bold text-black">(필수)</span> 이용약관과 개인정보 수집 및 이용에 동의합니다.
                            </label>
                        </div>

                        <div>
                            <div className="flex items-center">
                                <input
                                    id="agreeAge"
                                    name="agreeAge"
                                    type="checkbox"
                                    checked={agreeAge}
                                    onChange={(e) => setAgreeAge(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                />
                                <label htmlFor="agreeAge" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                                    <span className="font-bold text-black">(필수)</span> 만 14세 이상입니다.
                                </label>
                            </div>
                            <p className="ml-6 text-xs text-gray-500 mt-1">
                                - 만 19세 미만의 미성년자가 결제 시 법정대리인이 거래를 취소할 수 있습니다.
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center">
                                <input
                                    id="agreeMarketing"
                                    name="agreeMarketing"
                                    type="checkbox"
                                    checked={agreeMarketing}
                                    onChange={(e) => setAgreeMarketing(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                />
                                <label htmlFor="agreeMarketing" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                                    <span className="text-gray-500">(선택)</span> 이메일 및 SMS 마케팅 정보 수신에 동의합니다.
                                </label>
                            </div>
                            <p className="ml-6 text-xs text-gray-500 mt-1">
                                - 회원은 언제든지 회원 정보에서 수신 거부로 변경할 수 있습니다.
                            </p>
                        </div>
                    </div>

                    {isPostcodeOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white p-4 rounded-lg w-full max-w-md relative">
                                <button
                                    type="button"
                                    onClick={() => setIsPostcodeOpen(false)}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-black"
                                >
                                    닫기
                                </button>
                                <DaumPostcodeEmbed
                                    onComplete={handleCompletePostcode}
                                    scriptUrl="https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-lg bg-black py-3 px-4 text-sm font-semibold text-white hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-70"
                        >
                            {isLoading ? "가입 처리중..." : "가입하기"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
