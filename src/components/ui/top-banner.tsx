"use client";

import { X } from "lucide-react";
import { useState } from "react";

export default function TopBanner() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="relative bg-black text-white px-10 py-2.5 text-xs overflow-hidden whitespace-nowrap z-50">
            <div className="animate-marquee inline-block">
                {/* Repeat content multiple times to ensure it covers wide screens and loops seamlessly */}
                {[...Array(10)].map((_, i) => (
                    <span key={i} className="inline-flex">
                        <span className="mx-8">🎉 신규 가입 시 10% 할인 쿠폰 증정!</span>
                        <span className="mx-8">🚚 전 상품 무료 배송 이벤트 진행 중</span>
                        <span className="mx-8">💫 매일 새로운 신상품 업데이트</span>
                    </span>
                ))}
            </div>

            {/* Close Button */}
            <button
                onClick={() => setIsVisible(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/70 hover:text-white transition-colors bg-black/20 backdrop-blur-sm rounded-full z-10"
            >
                <X size={16} />
            </button>
        </div>
    );
}
