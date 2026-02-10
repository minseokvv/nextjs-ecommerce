import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { NextResponse } from 'next/server';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// API Response Helpers
export interface ApiSuccessResponse<T = any> {
    success: true;
    data: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

export interface ApiErrorResponse {
    success: false;
    error: {
        message: string;
        code?: string;
    };
}

export function apiSuccess<T>(data: T, meta?: ApiSuccessResponse<T>['meta'], status = 200) {
    return NextResponse.json(
        {
            success: true,
            data,
            ...(meta && { meta }),
        } as ApiSuccessResponse<T>,
        { status }
    );
}

export function apiError(message: string, code?: string, status = 500) {
    return NextResponse.json(
        {
            success: false,
            error: {
                message,
                ...(code && { code }),
            },
        } as ApiErrorResponse,
        { status }
    );
}
// Phone Number Formatter (010-1234-5678)
export function formatPhoneNumber(value: string) {
    if (!value) return "";
    const clean = value.replace(/[^0-9]/g, "");

    if (clean.length < 4) return clean;
    if (clean.length < 7) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
    if (clean.length < 11) return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
    return `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7, 11)}`;
}
