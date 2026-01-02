'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function Header() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-[#e50914] text-2xl font-black tracking-tight">
              묵향서원
            </span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/novels"
              className="text-[#e5e5e5] hover:text-white transition-colors text-sm font-medium"
            >
              전체 작품
            </Link>
            <Link
              href="/novels?category=SHORT"
              className="text-[#e5e5e5] hover:text-white transition-colors text-sm font-medium"
            >
              단편
            </Link>
            <Link
              href="/novels?category=LONG"
              className="text-[#e5e5e5] hover:text-white transition-colors text-sm font-medium"
            >
              장편
            </Link>
            {session && (
              <Link
                href="/novels/write"
                className="text-[#e5e5e5] hover:text-white transition-colors text-sm font-medium"
              >
                작품 등록
              </Link>
            )}
          </nav>

          {/* 사용자 메뉴 */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/mypage"
                  className="text-[#e5e5e5] hover:text-white transition-colors text-sm"
                >
                  {session.user.nickname}
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="text-[#e50914] hover:text-[#f40612] transition-colors text-sm font-medium"
                  >
                    관리자
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="text-[#b3b3b3] hover:text-white transition-colors text-sm"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-[#e5e5e5] hover:text-white transition-colors text-sm"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary px-4 py-1.5 rounded text-sm"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden py-4 bg-[#141414] border-t border-[#333]">
            <nav className="flex flex-col space-y-4 px-2">
              <Link
                href="/novels"
                className="text-[#e5e5e5] hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                전체 작품
              </Link>
              <Link
                href="/novels?category=SHORT"
                className="text-[#e5e5e5] hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                단편
              </Link>
              <Link
                href="/novels?category=LONG"
                className="text-[#e5e5e5] hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                장편
              </Link>
              {session ? (
                <>
                  <Link
                    href="/novels/write"
                    className="text-[#e5e5e5] hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    작품 등록
                  </Link>
                  <Link
                    href="/mypage"
                    className="text-[#e5e5e5] hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    마이페이지
                  </Link>
                  {session.user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="text-[#e50914] hover:text-[#f40612] transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      관리자
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut()
                      setIsMenuOpen(false)
                    }}
                    className="text-left text-[#b3b3b3] hover:text-white transition-colors"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-[#e5e5e5] hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/auth/register"
                    className="text-[#e50914] hover:text-[#f40612] transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    회원가입
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
