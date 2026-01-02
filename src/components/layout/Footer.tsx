import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-parchment border-t border-gold-dim/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 로고 및 설명 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📜</span>
              <span className="font-display text-xl text-gold font-semibold">
                墨香書院
              </span>
            </div>
            <p className="text-sepia-muted text-sm leading-relaxed">
              당신의 이야기가 시작되는 곳.<br />
              묵향서원에서 소설을 연재하고,<br />
              다른 작가들의 이야기를 만나보세요.
            </p>
          </div>

          {/* 빠른 링크 */}
          <div className="space-y-4">
            <h3 className="font-display text-gold text-lg">바로가기</h3>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/novels"
                className="text-sepia-muted hover:text-gold transition-colors text-sm"
              >
                전체 작품
              </Link>
              <Link
                href="/novels?category=SHORT"
                className="text-sepia-muted hover:text-gold transition-colors text-sm"
              >
                단편 소설
              </Link>
              <Link
                href="/novels?category=LONG"
                className="text-sepia-muted hover:text-gold transition-colors text-sm"
              >
                장편 소설
              </Link>
              <Link
                href="/novels/write"
                className="text-sepia-muted hover:text-gold transition-colors text-sm"
              >
                작품 등록
              </Link>
            </nav>
          </div>

          {/* 안내 */}
          <div className="space-y-4">
            <h3 className="font-display text-gold text-lg">안내</h3>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/about"
                className="text-sepia-muted hover:text-gold transition-colors text-sm"
              >
                서원 소개
              </Link>
              <Link
                href="/terms"
                className="text-sepia-muted hover:text-gold transition-colors text-sm"
              >
                이용약관
              </Link>
              <Link
                href="/privacy"
                className="text-sepia-muted hover:text-gold transition-colors text-sm"
              >
                개인정보처리방침
              </Link>
            </nav>
          </div>
        </div>

        {/* 하단 구분선 및 저작권 */}
        <div className="divider-ornate my-8" />
        <div className="text-center">
          <p className="text-sepia-muted text-sm">
            <span className="ornament">墨香書院</span>
          </p>
          <p className="text-sepia-muted/60 text-xs mt-2">
            © {new Date().getFullYear()} 墨香書院. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

