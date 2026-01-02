'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function Header() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-parchment border-b border-gold-dim/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="text-3xl">📜</div>
            <div className="flex flex-col">
              <span className="font-display text-2xl text-gold font-semibold tracking-wide group-hover:text-gold-light transition-colors">
                墨香書院
              </span>
              <span className="text-xs text-sepia-muted tracking-widest">
                NOVEL ARCHIVE
              </span>
            </div>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/novels"
              className="text-sepia hover:text-gold transition-colors font-medium"
            >
              작품 목록
            </Link>
            <Link
              href="/novels?category=SHORT"
              className="text-sepia hover:text-gold transition-colors font-medium"
            >
              단편
            </Link>
            <Link
              href="/novels?category=LONG"
              className="text-sepia hover:text-gold transition-colors font-medium"
            >
              장편
            </Link>
            {session && (
              <Link
                href="/novels/write"
                className="text-sepia hover:text-gold transition-colors font-medium"
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
                  className="text-sepia hover:text-gold transition-colors"
                >
                  <span className="text-gold-dim">✦</span>
                  <span className="ml-2">{session.user.nickname}</span>
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="text-velvet hover:text-velvet-hover transition-colors text-sm"
                  >
                    관리자
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="btn-secondary px-4 py-2 rounded text-sm"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-sepia hover:text-gold transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary px-4 py-2 rounded text-sm"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gold p-2"
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
          <div className="md:hidden py-4 border-t border-gold-dim/30">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/novels"
                className="text-sepia hover:text-gold transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                작품 목록
              </Link>
              <Link
                href="/novels?category=SHORT"
                className="text-sepia hover:text-gold transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                단편
              </Link>
              <Link
                href="/novels?category=LONG"
                className="text-sepia hover:text-gold transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                장편
              </Link>
              {session ? (
                <>
                  <Link
                    href="/novels/write"
                    className="text-sepia hover:text-gold transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    작품 등록
                  </Link>
                  <Link
                    href="/mypage"
                    className="text-sepia hover:text-gold transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    마이페이지
                  </Link>
                  {session.user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="text-velvet hover:text-velvet-hover transition-colors"
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
                    className="text-left text-sepia-muted hover:text-gold transition-colors"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sepia hover:text-gold transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/auth/register"
                    className="text-gold hover:text-gold-light transition-colors"
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

