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
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      {/* 헤더 */}
      <div className="mb-10">
        <h1 className="font-display text-4xl text-gold mb-2">🏛️ 관리자 대시보드</h1>
        <p className="text-sepia-muted">묵향서원의 모든 것을 관리합니다</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="card-vintage p-6 rounded-lg">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl text-gold font-bold">{stats.userCount}</div>
          <div className="text-sepia-muted text-sm">전체 회원</div>
        </div>
        <div className="card-vintage p-6 rounded-lg">
          <div className="text-3xl mb-2">📚</div>
          <div className="text-2xl text-gold font-bold">{stats.novelCount}</div>
          <div className="text-sepia-muted text-sm">전체 작품</div>
        </div>
        <div className="card-vintage p-6 rounded-lg">
          <div className="text-3xl mb-2">📖</div>
          <div className="text-2xl text-gold font-bold">{stats.chapterCount}</div>
          <div className="text-sepia-muted text-sm">전체 회차</div>
        </div>
        <div className="card-vintage p-6 rounded-lg">
          <div className="text-3xl mb-2">💬</div>
          <div className="text-2xl text-gold font-bold">{stats.commentCount}</div>
          <div className="text-sepia-muted text-sm">전체 댓글</div>
        </div>
      </div>

      {/* 카테고리별 통계 */}
      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <div className="card-vintage p-6 rounded-lg">
          <h3 className="font-display text-lg text-gold mb-4">📝 단편 소설</h3>
          <div className="text-3xl text-gold-light font-bold">{stats.shortNovelCount}</div>
        </div>
        <div className="card-vintage p-6 rounded-lg">
          <h3 className="font-display text-lg text-gold mb-4">📚 장편 소설</h3>
          <div className="text-3xl text-gold-light font-bold">{stats.longNovelCount}</div>
        </div>
      </div>

      {/* 관리 메뉴 */}
      <div className="grid sm:grid-cols-3 gap-6 mb-10">
        <Link
          href="/admin/users"
          className="card-vintage p-6 rounded-lg hover-glow transition-all group"
        >
          <div className="text-3xl mb-3">👥</div>
          <h3 className="font-display text-lg text-gold-light group-hover:text-gold transition-colors">
            회원 관리
          </h3>
          <p className="text-sepia-muted text-sm mt-2">
            회원 목록 조회 및 권한 관리
          </p>
        </Link>
        <Link
          href="/admin/novels"
          className="card-vintage p-6 rounded-lg hover-glow transition-all group"
        >
          <div className="text-3xl mb-3">📚</div>
          <h3 className="font-display text-lg text-gold-light group-hover:text-gold transition-colors">
            작품 관리
          </h3>
          <p className="text-sepia-muted text-sm mt-2">
            작품 목록 조회 및 관리
          </p>
        </Link>
        <Link
          href="/admin/comments"
          className="card-vintage p-6 rounded-lg hover-glow transition-all group"
        >
          <div className="text-3xl mb-3">💬</div>
          <h3 className="font-display text-lg text-gold-light group-hover:text-gold transition-colors">
            댓글 관리
          </h3>
          <p className="text-sepia-muted text-sm mt-2">
            댓글 목록 조회 및 삭제
          </p>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 최근 작품 */}
        <div className="card-vintage p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-lg text-gold">최근 등록된 작품</h3>
            <Link
              href="/admin/novels"
              className="text-sm text-sepia-muted hover:text-gold"
            >
              더보기 →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentNovels.map((novel) => (
              <Link
                key={novel.id}
                href={`/novels/${novel.id}`}
                className="flex justify-between items-center p-3 rounded bg-leather/30 hover:bg-leather/50 transition-colors"
              >
                <div>
                  <span className="text-xs px-2 py-0.5 rounded bg-leather-accent text-gold-dim mr-2">
                    {novel.category === 'SHORT' ? '단편' : '장편'}
                  </span>
                  <span className="text-sepia">{novel.title}</span>
                </div>
                <span className="text-xs text-sepia-muted">
                  {novel.author.nickname}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* 최근 가입 회원 */}
        <div className="card-vintage p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-lg text-gold">최근 가입 회원</h3>
            <Link
              href="/admin/users"
              className="text-sm text-sepia-muted hover:text-gold"
            >
              더보기 →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex justify-between items-center p-3 rounded bg-leather/30"
              >
                <div className="flex items-center gap-2">
                  {user.role === 'ADMIN' && (
                    <span className="text-xs px-2 py-0.5 rounded bg-velvet text-sepia">
                      관리자
                    </span>
                  )}
                  <span className="text-sepia">{user.nickname}</span>
                  <span className="text-xs text-sepia-muted">@{user.username}</span>
                </div>
                <span className="text-xs text-sepia-muted">
                  작품 {user._count.novels}개
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

