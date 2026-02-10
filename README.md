# Dbaek Shopping Mall

이 프로젝트는 Next.js와 Prisma, SQLite를 사용하여 바이브코딩으로 구축된 쇼핑몰 시스템입니다.

## 📋 필수 조건
- **Node.js**: v18.17.0 이상 (LTS 버전 권장)
- **npm**: v9 이상

## 🚀 설치 및 실행 방법

### 1. 저장소 복제 (Clone)
```bash
git clone https://github.com/your-username/dbaek-shop.git
cd dbaek-shop
```

### 2. 의존성 패키지 설치
```bash
npm install
# 또는
yarn install
```

### 3. 환경 변수 설정
프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 아래 내용을 복사하여 입력하세요.
`.env.example` 파일을 참고할 수 있습니다.

```bash
# .env 파일 생성
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-at-least-32-chars-random-string"
NEXTAUTH_URL="http://localhost:3000"
```
> `NEXTAUTH_SECRET`은 보안을 위해 임의의 긴 문자열로 변경하는 것을 권장합니다.

### 4. 데이터베이스 설정 (Prisma & SQLite)
데이터베이스 스키마를 반영하고 클라이언트를 생성합니다.

```bash
# 1. Prisma 클라이언트 생성
npx prisma generate

# 2. 데이터베이스 스키마 반영 (SQLite 파일 생성)
npx prisma db push

# 3. 초기 데이터 시드 (관리자 계정 및 기본 카테고리 생성)
npx prisma db seed
```

### 5. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

---

## 👤 관리자 계정 정보
초기 설정(`npx prisma db seed`)을 통해 생성된 관리자 계정입니다.

- **URL**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Email**: `admin@example.com`
- **Password**: `password123`
- **Username**: `admin`

로그인 후 반드시 비밀번호를 변경해 주세요.

## 🛠 주요 기능
- **사용자**: 회원가입/로그인, 상품 검색 및 조회, 장바구니, 주소록 관리(Daum 주소찾기), 주문 및 결제(무통장 입금).
- **관리자**: 대시보드(통계), 상품 등록/수정/삭제, 주문 관리(입금확인/배송상태 변경), 카테고리 관리.

## 📦 배포 시 주의사항 (GitHub)
- `.env` 파일과 `prisma/dev.db` 파일은 깃허브에 업로드되지 않도록 `.gitignore`에 설정되어 있습니다.
- 새로운 환경(서버)에서 배포할 때는 위 **설치 및 실행 방법** 중 3번(환경 변수)과 4번(데이터베이스 설정) 과정을 다시 수행해야 합니다.

## 📄 라이선스
This project is licensed under the MIT License.
