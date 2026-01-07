# WriteUs - 소설 연재 플랫폼

고풍스러운 다크 테마의 소설 연재 웹사이트입니다.

## 🌟 주요 기능

### 회원 시스템
- 회원가입/로그인 (ID, 비밀번호, 닉네임)
- 일반 회원 및 관리자 권한 구분

### 소설 관리
- **단편 소설**: 하나의 완결된 이야기
- **장편 소설**: 회차별 연재 시스템
- 본인 작품만 수정 가능 (관리자는 모든 작품 수정/삭제 가능)

### 상호작용
- 조회수 자동 카운트
- 좋아요/싫어요 (회원만, 중복 불가)
- 댓글 및 대댓글 시스템

### 검색 및 정렬
- 제목, 소개, 작가명 검색
- 최신순, 오래된순, 조회순, 좋아요순 정렬
- 카테고리별 필터링

### 관리자 기능
- 대시보드 통계
- 회원 관리 (권한 변경)
- 작품 관리

## 🛠 기술 스택

- **Frontend/Backend**: Next.js 15 (App Router)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **인증**: NextAuth.js
- **스타일**: Tailwind CSS
- **호스팅**: Vercel

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 수정하여 Neon 데이터베이스 연결 정보를 입력하세요:

```env
# Neon PostgreSQL 연결 문자열
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

# NextAuth.js 설정
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

`NEXTAUTH_SECRET`은 다음 명령어로 생성할 수 있습니다:
```bash
openssl rand -base64 32
```

### 3. 데이터베이스 마이그레이션

```bash
npx prisma migrate dev --name init
```

### 4. Prisma 클라이언트 생성

```bash
npx prisma generate
```

### 5. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 📦 Vercel 배포

### 1. Vercel에 프로젝트 연결

```bash
vercel
```

### 2. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정하세요:
- `DATABASE_URL`
- `NEXTAUTH_URL` (배포된 URL)
- `NEXTAUTH_SECRET`

### 3. 배포

```bash
vercel --prod
```

## 👤 관리자 계정 생성

첫 번째 사용자를 관리자로 설정하려면 데이터베이스에서 직접 수정하거나,
Prisma Studio를 사용하세요:

```bash
npx prisma studio
```

`users` 테이블에서 원하는 사용자의 `role`을 `ADMIN`으로 변경합니다.

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/                 # API 라우트
│   │   ├── auth/           # 인증 관련
│   │   ├── novels/         # 소설 CRUD
│   │   ├── comments/       # 댓글 CRUD
│   │   ├── votes/          # 좋아요/싫어요
│   │   └── admin/          # 관리자 API
│   ├── auth/               # 로그인/회원가입 페이지
│   ├── novels/             # 소설 관련 페이지
│   ├── admin/              # 관리자 페이지
│   ├── mypage/             # 마이페이지
│   └── layout.tsx          # 루트 레이아웃
├── components/
│   ├── layout/             # 헤더, 푸터
│   ├── novels/             # 소설 관련 컴포넌트
│   ├── admin/              # 관리자 컴포넌트
│   ├── common/             # 공통 컴포넌트
│   └── providers/          # Context Providers
├── lib/
│   ├── prisma.ts           # Prisma 클라이언트
│   └── auth.ts             # NextAuth 설정
└── types/
    └── next-auth.d.ts      # 타입 정의
```

## 🎨 디자인 컨셉

- **테마**: 어두운 고풍스러운 서재 분위기
- **색상**: 골드, 세피아, 벨벳 레드, 가죽 브라운
- **폰트**: Noto Serif KR, Cormorant Garamond
- **특징**: 빈티지한 카드 스타일, 장식적 구분선

## 📝 라이선스

MIT License
