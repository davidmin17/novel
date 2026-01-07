import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#141414] border-t border-[#333] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* 로고 */}
          <div className="flex items-center space-x-4">
            <span className="text-[#e50914] text-xl font-black">WriteUs</span>
            <span className="text-[#808080] text-sm">당신의 이야기가 시작되는 곳</span>
          </div>

          {/* 링크 */}
          <nav className="flex items-center space-x-6 text-sm">
            <Link
              href="/novels"
              className="text-[#808080] hover:text-[#e5e5e5] transition-colors"
            >
              작품 목록
            </Link>
            <Link
              href="/about"
              className="text-[#808080] hover:text-[#e5e5e5] transition-colors"
            >
              소개
            </Link>
            <Link
              href="/terms"
              className="text-[#808080] hover:text-[#e5e5e5] transition-colors"
            >
              이용약관
            </Link>
            <Link
              href="/privacy"
              className="text-[#808080] hover:text-[#e5e5e5] transition-colors"
            >
              개인정보처리방침
            </Link>
          </nav>
        </div>

        {/* 저작권 */}
        <div className="mt-6 pt-6 border-t border-[#333] text-center">
          <p className="text-[#808080] text-xs">
            © {new Date().getFullYear()} WriteUs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
