import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getRecentNovels() {
  try {
    const novels = await prisma.novel.findMany({
      where: { isPublished: true },
      include: {
        author: {
          select: { nickname: true },
        },
        _count: {
          select: { chapters: true, comments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
    return novels
  } catch {
    return []
  }
}

async function getPopularNovels() {
  try {
    const novels = await prisma.novel.findMany({
      where: { isPublished: true },
      include: {
        author: {
          select: { nickname: true },
        },
        _count: {
          select: { chapters: true, comments: true },
        },
      },
      orderBy: { viewCount: 'desc' },
      take: 10,
    })
    return novels
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [recentNovels, popularNovels, session] = await Promise.all([
    getRecentNovels(),
    getPopularNovels(),
    getServerSession(authOptions),
  ])

  const isLoggedIn = !!session

  return (
    <div className="animate-fade-in">
      {/* 히어로 섹션 */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-16">
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#141414] via-transparent to-[#141414]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e50914]/10 via-transparent to-transparent" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            <span className="text-[#e50914]">WriteUs</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#e5e5e5] mb-4">
            당신의 이야기가 시작되는 곳
          </p>
          <p className="text-[#b3b3b3] mb-10 max-w-2xl mx-auto">
            수많은 작가들의 이야기가 태어나고 있습니다.
            지금 바로 당신만의 이야기를 세상에 펼쳐보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/novels"
              className="btn-primary px-8 py-3 rounded text-lg font-semibold inline-flex items-center justify-center"
            >
              작품 둘러보기
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href="/novels/write"
                  className="btn-secondary px-8 py-3 rounded text-lg font-semibold inline-flex items-center justify-center"
                >
                  ✍️ 글쓰기
                </Link>
                <Link
                  href="/novels/ai-write"
                  className="px-8 py-3 rounded text-lg font-semibold inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all"
                >
                  🤖 AI 글쓰기
                </Link>
              </>
            ) : (
              <Link
                href="/auth/register"
                className="btn-secondary px-8 py-3 rounded text-lg font-semibold inline-flex items-center justify-center"
              >
                시작하기
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 최신 작품 섹션 */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#1a1a1a] rounded-xl p-6 md:p-8 border border-[#2a2a2a]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  🆕 최신 작품
                </h2>
                <p className="text-[#808080] text-sm">
                  방금 등록된 따끈따끈한 신작들
                </p>
              </div>
              <Link
                href="/novels?sort=latest"
                className="text-[#e50914] hover:text-[#f40612] text-sm font-medium transition-colors flex items-center gap-1"
              >
                전체보기
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {recentNovels.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {recentNovels.map((novel) => (
                  <NovelCard key={novel.id} novel={novel} />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </section>

      {/* 인기 작품 섹션 */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#141414] via-[#1a1a1a] to-[#141414]">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#232323] rounded-xl p-6 md:p-8 border border-[#333] shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  🔥 인기 작품
                </h2>
                <p className="text-[#808080] text-sm">
                  독자들이 가장 많이 찾는 작품들
                </p>
              </div>
              <Link
                href="/novels?sort=popular"
                className="text-[#e50914] hover:text-[#f40612] text-sm font-medium transition-colors flex items-center gap-1"
              >
                전체보기
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {popularNovels.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {popularNovels.map((novel, index) => (
                  <NovelCard key={novel.id} novel={novel} rank={index + 1} />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-[#e50914]/20 via-[#1a1a1a] to-[#e50914]/20 rounded-xl p-8 md:p-12 border border-[#e50914]/30 text-center">
            {isLoggedIn ? (
              <>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  새로운 이야기를 시작하세요
                </h2>
                <p className="text-[#b3b3b3] mb-8 max-w-xl mx-auto">
                  머릿속에 떠오르는 이야기가 있나요?
                  지금 바로 작품을 등록하고 독자들과 만나보세요.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/novels/write"
                    className="btn-primary px-8 py-3 rounded text-lg font-semibold inline-flex items-center gap-2"
                  >
                    ✍️ 새 작품 쓰기
                  </Link>
                  <Link
                    href="/novels/ai-write"
                    className="px-8 py-3 rounded text-lg font-semibold inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all"
                  >
                    🤖 AI로 작성하기
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  당신의 이야기를 들려주세요
                </h2>
                <p className="text-[#b3b3b3] mb-8 max-w-xl mx-auto">
                  지금 바로 작가로 등록하고 첫 번째 작품을 연재해보세요.
                  수많은 독자들이 당신의 이야기를 기다리고 있습니다.
                </p>
                <Link
                  href="/auth/register"
                  className="btn-primary px-8 py-3 rounded text-lg font-semibold inline-block"
                >
                  작가로 시작하기
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

interface NovelCardProps {
  novel: {
    id: string
    title: string
    description: string | null
    category: string
    viewCount: number
    likeCount: number
    createdAt: Date
    author: { nickname: string }
    _count: { chapters: number; comments: number }
  }
  rank?: number
}

function NovelCard({ novel, rank }: NovelCardProps) {
  return (
    <Link
      href={`/novels/${novel.id}`}
      className="novel-card group block relative"
    >
      {/* 순위 배지 */}
      {rank && rank <= 3 && (
        <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-[#e50914] flex items-center justify-center text-white font-bold text-sm shadow-lg">
          {rank}
        </div>
      )}

      {/* 썸네일 영역 */}
      <div className="aspect-[3/4] bg-gradient-to-br from-[#333] to-[#1a1a1a] relative overflow-hidden rounded-t">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl opacity-30">📖</span>
        </div>
        {/* 호버 오버레이 */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white font-medium text-sm">자세히 보기</span>
        </div>
        {/* 카테고리 배지 */}
        <div className="absolute top-2 right-2">
          <span className="badge badge-red text-xs">
            {novel.category === 'SHORT' ? '단편' : '장편'}
          </span>
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="p-3 bg-[#232323] rounded-b border-t border-[#333]">
        <h3 className="text-white font-medium text-sm line-clamp-1 mb-1 group-hover:text-[#e50914] transition-colors">
          {novel.title}
        </h3>
        <p className="text-[#808080] text-xs mb-2">
          {novel.author.nickname}
        </p>
        <div className="flex items-center gap-3 text-[#666] text-xs">
          <span>👁 {novel.viewCount.toLocaleString()}</span>
          <span>❤️ {novel.likeCount.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4 opacity-50">📚</div>
      <p className="text-[#808080] mb-2 text-lg">아직 등록된 작품이 없습니다.</p>
      <p className="text-[#666] text-sm">첫 번째 작가가 되어보세요!</p>
    </div>
  )
}
