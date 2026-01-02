import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getUserData(userId: string) {
  const [user, novels] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        nickname: true,
        role: true,
        createdAt: true,
        _count: {
          select: { novels: true, comments: true },
        },
      },
    }),
    prisma.novel.findMany({
      where: { authorId: userId },
      include: {
        _count: { select: { chapters: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return { user, novels }
}

export default async function MyPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  const { user, novels } = await getUserData(session.user.id)

  if (!user) {
    redirect('/auth/login')
  }

  const totalViews = novels.reduce((sum, novel) => sum + novel.viewCount, 0)
  const totalLikes = novels.reduce((sum, novel) => sum + novel.likeCount, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      {/* 프로필 카드 */}
      <div className="card-vintage p-8 rounded-lg mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-3xl text-gold">{user.nickname}</h1>
              {user.role === 'ADMIN' && (
                <span className="text-xs px-2 py-1 rounded bg-velvet text-sepia">
                  관리자
                </span>
              )}
            </div>
            <p className="text-sepia-muted">@{user.username}</p>
            <p className="text-sepia-muted text-sm mt-2">
              가입일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}
            </p>
          </div>
          <Link
            href="/novels/write"
            className="btn-primary px-4 py-2 rounded"
          >
            ✍️ 새 작품 쓰기
          </Link>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-gold-dim/30">
          <div className="text-center">
            <div className="text-2xl text-gold font-bold">{user._count.novels}</div>
            <div className="text-sepia-muted text-sm">작품</div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-gold font-bold">{user._count.comments}</div>
            <div className="text-sepia-muted text-sm">댓글</div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-gold font-bold">{totalViews}</div>
            <div className="text-sepia-muted text-sm">총 조회수</div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-gold font-bold">{totalLikes}</div>
            <div className="text-sepia-muted text-sm">총 좋아요</div>
          </div>
        </div>
      </div>

      {/* 내 작품 목록 */}
      <div className="card-vintage p-6 rounded-lg">
        <h2 className="font-display text-xl text-gold mb-6">📚 내 작품</h2>

        {novels.length > 0 ? (
          <div className="space-y-4">
            {novels.map((novel) => (
              <div
                key={novel.id}
                className="flex items-center justify-between p-4 rounded bg-leather/30 hover:bg-leather/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-leather-accent text-gold-dim">
                      {novel.category === 'SHORT' ? '단편' : '장편'}
                    </span>
                    {!novel.isPublished && (
                      <span className="text-xs px-2 py-0.5 rounded bg-velvet/50 text-sepia">
                        비공개
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/novels/${novel.id}`}
                    className="text-sepia hover:text-gold font-medium"
                  >
                    {novel.title}
                  </Link>
                  <div className="flex items-center gap-4 mt-2 text-xs text-sepia-muted">
                    <span>👁️ {novel.viewCount}</span>
                    <span>❤️ {novel.likeCount}</span>
                    <span>💬 {novel._count.comments}</span>
                    {novel.category === 'LONG' && (
                      <span>📖 {novel._count.chapters}화</span>
                    )}
                    <span>{new Date(novel.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/novels/${novel.id}/edit`}
                    className="btn-secondary px-3 py-1 rounded text-sm"
                  >
                    수정
                  </Link>
                  {novel.category === 'LONG' && (
                    <Link
                      href={`/novels/${novel.id}/chapters/write`}
                      className="btn-primary px-3 py-1 rounded text-sm"
                    >
                      + 회차
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-sepia-muted">
            <div className="text-4xl mb-4">📝</div>
            <p>아직 작성한 작품이 없습니다.</p>
            <Link
              href="/novels/write"
              className="inline-block mt-4 btn-primary px-6 py-2 rounded"
            >
              첫 작품 쓰기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

