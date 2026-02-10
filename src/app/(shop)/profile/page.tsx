import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { User, MapPin, Phone, Mail, LogOut } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { signOut } from "next-auth/react";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/login");
    }

    const user = await db.user.findUnique({
        where: { email: session.user.email },
        include: {
            _count: {
                select: { orders: true }
            }
        }
    });

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 animate-fade-in-up space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">내 정보</h1>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 border-b border-gray-100 pb-8 mb-8">
                    <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <User size={40} />
                    </div>
                    <div className="text-center md:text-left flex-1 space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">{user.name || "구매자"}님</h2>
                        <p className="text-gray-500 text-sm">@{user.username || user.email}</p>
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                {user.role === 'ADMIN' ? '관리자' : '일반회원'}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                주문 {user._count.orders}건
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="flex flex-col gap-2">
                            <Link
                                href="/profile/edit"
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-lg">✎</span>
                                정보 수정
                            </Link>
                            <LogoutButton />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">기본 정보</h3>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mt-1">
                                <Mail size={16} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-0.5">이메일</p>
                                <p className="text-gray-900">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mt-1">
                                <Phone size={16} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-0.5">전화번호</p>
                                <p className="text-gray-900">{user.phone || "등록된 번호가 없습니다."}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">배송지 정보</h3>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mt-1">
                                <MapPin size={16} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-0.5">주소</p>
                                <p className="text-gray-900 leading-relaxed">
                                    {user.address ? (
                                        <>
                                            {user.zipcode && <span className="text-gray-500 mr-2">[{user.zipcode}]</span>}
                                            {user.address} {user.detailAddress}
                                        </>
                                    ) : "등록된 주소가 없습니다."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Link
                    href="/orders"
                    className="block bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center group"
                >
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <span className="font-bold text-xl">{user._count.orders}</span>
                    </div>
                    <h3 className="font-bold text-gray-900">주문 내역</h3>
                    <p className="text-sm text-gray-500 mt-1">최근 주문 확인</p>
                </Link>
                <Link
                    href="/cart"
                    className="block bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center group"
                >
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        {/* We don't have cart count yet in user model for this view, just Icon */}
                        <span className="font-bold text-xl">🛒</span>
                    </div>
                    <h3 className="font-bold text-gray-900">장바구니</h3>
                    <p className="text-sm text-gray-500 mt-1">담아둔 상품</p>
                </Link>
            </div>
        </div>
    );
}
