import { writeFile, mkdir, unlink, access } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { apiSuccess, apiError } from "@/lib/utils";

// 설정
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * 날짜 기반 업로드 디렉토리 경로 생성
 * /public/uploads/2026/02/ 형식
 */
function getUploadDir(): { dir: string; urlPrefix: string } {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");

    const dir = path.join(process.cwd(), "public", "uploads", year, month);
    const urlPrefix = `/uploads/${year}/${month}`;

    return { dir, urlPrefix };
}

/**
 * 파일명 안전하게 변환
 * UUID + 원본 확장자 조합
 */
function generateSafeFilename(originalName: string): string {
    const ext = path.extname(originalName).toLowerCase();
    const safeName = crypto.randomUUID();
    return `${safeName}${ext}`;
}

/**
 * POST /api/upload
 * 이미지 파일 업로드
 */
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return apiError("파일이 업로드되지 않았습니다.", "MISSING_FIELDS", 400);
        }

        // 파일 타입 검증
        if (!ALLOWED_TYPES.includes(file.type)) {
            return apiError(
                `지원하지 않는 파일 형식입니다. (${ALLOWED_TYPES.map(t => t.split("/")[1].toUpperCase()).join(", ")}만 가능)`,
                "VALIDATION_ERROR",
                400
            );
        }

        // 파일 크기 검증
        if (file.size > MAX_FILE_SIZE) {
            const maxMB = Math.round(MAX_FILE_SIZE / (1024 * 1024));
            return apiError(`파일 크기가 너무 큽니다. (최대 ${maxMB}MB)`, "VALIDATION_ERROR", 400);
        }

        // 날짜 기반 디렉토리 생성
        const { dir, urlPrefix } = getUploadDir();
        await mkdir(dir, { recursive: true });

        // 파일 저장
        const filename = generateSafeFilename(file.name);
        const filepath = path.join(dir, filename);
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        await writeFile(filepath, uint8Array);

        const fileUrl = `${urlPrefix}/${filename}`;

        return apiSuccess(
            {
                url: fileUrl,
                filename,
                size: file.size,
                type: file.type,
            },
            undefined,
            201
        );
    } catch (error) {
        console.error("[UPLOAD_POST]", error);
        return apiError("파일 업로드에 실패했습니다.", "INTERNAL_ERROR");
    }
}

/**
 * DELETE /api/upload?url=/uploads/2026/02/xxx.jpg
 * 업로드된 파일 삭제
 */
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fileUrl = searchParams.get("url");

        if (!fileUrl) {
            return apiError("삭제할 파일 URL이 필요합니다.", "MISSING_FIELDS", 400);
        }

        // 보안: /uploads/ 경로 내 파일만 삭제 허용
        if (!fileUrl.startsWith("/uploads/")) {
            return apiError("잘못된 파일 경로입니다.", "VALIDATION_ERROR", 400);
        }

        // 경로 탐색 공격 방지
        const normalizedUrl = path.normalize(fileUrl);
        if (normalizedUrl.includes("..")) {
            return apiError("잘못된 파일 경로입니다.", "VALIDATION_ERROR", 400);
        }

        const filepath = path.join(process.cwd(), "public", normalizedUrl);

        // 파일 존재 확인
        try {
            await access(filepath);
        } catch {
            return apiError("파일을 찾을 수 없습니다.", "NOT_FOUND", 404);
        }

        await unlink(filepath);

        return apiSuccess({ deleted: true, url: fileUrl });
    } catch (error) {
        console.error("[UPLOAD_DELETE]", error);
        return apiError("파일 삭제에 실패했습니다.", "INTERNAL_ERROR");
    }
}
