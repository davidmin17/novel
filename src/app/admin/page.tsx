import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getStats() {
  const [userCount, novelCount, chapterCount, commentCount] = await Promise.all([
    prisma.user.count(),
    prisma.novel.count(),
    prisma.chapter.count(),
    prisma.comment.count(),
  ])

  const [shortNovelCount, longNovelCount] = await Promise.all([
    prisma.novel.count({ where: { category: 'SHORT' } }),
    prisma.novel.count({ where: { category: 'LONG' } }),
  ])

  const recentNovels = await prisma.novel.findMany({
    include: { author: { select: { nickname: true } } },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      username: true,
      nickname: true,
      role: true,
      createdAt: true,
      _count: { select: { novels: true } },
    },
  })

  return {
    userCount,
    novelCount,
    chapterCount,
    commentCount,
    shortNovelCount,
    longNovelCount,
    recentNovels,
    recentUsers,
  }
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const stats = await getStats()

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">관리자 대시보드</h1>
          <p className="text-[#808080]">묵향서원의 모든 것을 관리합니다</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#232323] p-6 rounded">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-3xl text-white font-bold">{stats.userCount}</div>
            <div className="text-[#808080] text-sm">전체 회원</div>
          </div>
          <div className="bg-[#232323] p-6 rounded">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-3xl text-white font-bold">{stats.novelCount}</div>
            <div className="text-[#808080] text-sm">전체 작품</div>
          </div>
          <div className="bg-[#232323] p-6 rounded">
            <div className="text-3xl mb-2">📖</div>
            <div className="text-3xl text-white font-bold">{stats.chapterCount}</div>
            <div className="text-[#808080] text-sm">전체 회차</div>
          </div>
          <div className="bg-[#232323] p-6 rounded">
            <div className="text-3xl mb-2">💬</div>
            <div className="text-3xl text-white font-bold">{stats.commentCount}</div>
            <div className="text-[#808080] text-sm">전체 댓글</div>
          </div>
        </div>

        {/* 카테고리별 통계 */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-[#232323] p-6 rounded">
            <h3 className="text-lg text-[#e5e5e5] mb-2">📝 단편 소설</h3>
            <div className="text-3xl text-white font-bold">{stats.shortNovelCount}</div>
          </div>
          <div className="bg-[#232323] p-6 rounded">
            <h3 className="text-lg text-[#e5e5e5] mb-2">📚 장편 소설</h3>
            <div className="text-3xl text-white font-bold">{stats.longNovelCount}</div>
          </div>
        </div>

        {/* 관리 메뉴 */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Link
            href="/admin/users"
            className="bg-[#232323] p-6 rounded hover:bg-[#2a2a2a] transition-colors group"
          >
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-lg text-white group-hover:text-[#e50914] transition-colors">
              회원 관리
            </h3>
            <p className="text-[#808080] text-sm mt-2">
              회원 목록 조회 및 권한 관리
            </p>
          </Link>
          <Link
            href="/admin/novels"
            className="bg-[#232323] p-6 rounded hover:bg-[#2a2a2a] transition-colors group"
          >
            <div className="text-3xl mb-3">📚</div>
            <h3 className="text-lg text-white group-hover:text-[#e50914] transition-colors">
              작품 관리
            </h3>
            <p className="text-[#808080] text-sm mt-2">
              작품 목록 조회 및 관리
            </p>
          </Link>
          <Link
            href="/admin/comments"
            className="bg-[#232323] p-6 rounded hover:bg-[#2a2a2a] transition-colors group"
          >
            <div className="text-3xl mb-3">💬</div>
            <h3 className="text-lg text-white group-hover:text-[#e50914] transition-colors">
              댓글 관리
            </h3>
            <p className="text-[#808080] text-sm mt-2">
              댓글 목록 조회 및 삭제
            </p>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* 최근 작품 */}
          <div className="bg-[#232323] p-6 rounded">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg text-white font-medium">최근 등록된 작품</h3>
              <Link
                href="/admin/novels"
                className="text-sm text-[#808080] hover:text-white transition-colors"
              >
                더보기 &gt;
              </Link>
            </div>
            <div className="space-y-2">
              {stats.recentNovels.map((novel) => (
                <Link
                  key={novel.id}
                  href={`/novels/${novel.id}`}
                  className="flex justify-between items-center p-3 rounded bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-[#e50914] text-white">
                      {novel.category === 'SHORT' ? '단편' : '장편'}
                    </span>
                    <span className="text-[#e5e5e5]">{novel.title}</span>
                  </div>
                  <span className="text-xs text-[#808080]">
                    {novel.author.nickname}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* 최근 가입 회원 */}
          <div className="bg-[#232323] p-6 rounded">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg text-white font-medium">최근 가입 회원</h3>
              <Link
                href="/admin/users"
                className="text-sm text-[#808080] hover:text-white transition-colors"
              >
                더보기 &gt;
              </Link>
            </div>
            <div className="space-y-2">
              {stats.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex justify-between items-center p-3 rounded bg-[#1a1a1a]"
                >
                  <div className="flex items-center gap-2">
                    {user.role === 'ADMIN' && (
                      <span className="text-xs px-2 py-0.5 rounded bg-[#e50914] text-white">
                        관리자
                      </span>
                    )}
                    <span className="text-[#e5e5e5]">{user.nickname}</span>
                    <span className="text-xs text-[#808080]">@{user.username}</span>
                  </div>
                  <span className="text-xs text-[#808080]">
                    작품 {user._count.novels}개
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
