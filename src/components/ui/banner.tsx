"use client";

export default function RollingBanner() {
    return (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-2xl bg-gray-900">
            <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center text-center">
                <h2 className="text-4xl font-bold text-white">2024 F/W New Season</h2>
                <p className="mt-4 text-lg text-white/90">단 하나의 스타일, Dbaek에서 시작하세요.</p>
            </div>
        </div>
    );
}
