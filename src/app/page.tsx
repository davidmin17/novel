import Link from 'next/link'
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
      take: 6,
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
      take: 6,
    })
    return novels
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [recentNovels, popularNovels] = await Promise.all([
    getRecentNovels(),
    getPopularNovels(),
  ])

  return (
    <div className="animate-fade-in">
      {/* 히어로 섹션 */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-leather/50 to-transparent" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <span className="text-6xl">📜</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-gold font-bold mb-6 text-shadow-gold">
            墨香書院
          </h1>
          <p className="text-xl md:text-2xl text-sepia mb-4 font-serif">
            당신의 이야기가 시작되는 곳
          </p>
          <p className="text-sepia-muted mb-10 max-w-2xl mx-auto leading-relaxed">
            먹의 향기가 가득한 서원에서, 수많은 이야기들이 태어나고 있습니다.
            <br />
            당신만의 이야기를 세상에 펼쳐보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/novels"
              className="btn-primary px-8 py-3 rounded-lg text-lg font-medium inline-flex items-center justify-center"
            >
              <span className="mr-2">📖</span>
              작품 둘러보기
            </Link>
            <Link
              href="/auth/register"
              className="btn-secondary px-8 py-3 rounded-lg text-lg font-medium inline-flex items-center justify-center"
            >
              <span className="mr-2">✍️</span>
              작가로 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* 구분선 */}
      <div className="divider-ornate max-w-4xl mx-auto" />

      {/* 카테고리 섹션 */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl text-gold text-center mb-12">
            <span className="ornament">작품 분류</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Link
              href="/novels?category=SHORT"
              className="card-vintage p-8 rounded-lg hover-glow transition-all group"
            >
              <div className="text-4xl mb-4">📝</div>
              <h3 className="font-display text-2xl text-gold-light mb-3 group-hover:text-gold transition-colors">
                단편 소설
              </h3>
              <p className="text-sepia-muted leading-relaxed">
                짧지만 강렬한 이야기. 한 편의 완결된 세계를 경험해보세요.
                순간의 감동과 여운이 오래 남는 작품들이 기다리고 있습니다.
              </p>
            </Link>
            <Link
              href="/novels?category=LONG"
              className="card-vintage p-8 rounded-lg hover-glow transition-all group"
            >
              <div className="text-4xl mb-4">📚</div>
              <h3 className="font-display text-2xl text-gold-light mb-3 group-hover:text-gold transition-colors">
                장편 소설
              </h3>
              <p className="text-sepia-muted leading-relaxed">
                깊고 넓은 이야기의 바다. 회차별로 연재되는 장대한 서사시를
                따라가며, 작가와 함께 이야기의 여정을 떠나보세요.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* 최신 작품 */}
      <section className="py-16 px-4 bg-leather/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h2 className="font-display text-2xl text-gold">
              ✦ 최신 작품
            </h2>
            <Link
              href="/novels?sort=latest"
              className="text-sepia-muted hover:text-gold transition-colors text-sm"
            >
              더보기 →
            </Link>
          </div>
          {recentNovels.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentNovels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-sepia-muted">
              <p>아직 등록된 작품이 없습니다.</p>
              <p className="mt-2">첫 번째 작가가 되어보세요!</p>
            </div>
          )}
        </div>
      </section>

      {/* 인기 작품 */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h2 className="font-display text-2xl text-gold">
              ✦ 인기 작품
            </h2>
            <Link
              href="/novels?sort=popular"
              className="text-sepia-muted hover:text-gold transition-colors text-sm"
            >
              더보기 →
            </Link>
          </div>
          {popularNovels.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularNovels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-sepia-muted">
              <p>아직 등록된 작품이 없습니다.</p>
            </div>
          )}
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
}

function NovelCard({ novel }: NovelCardProps) {
  return (
    <Link
      href={`/novels/${novel.id}`}
      className="card-vintage p-6 rounded-lg hover-glow transition-all group block"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs px-2 py-1 rounded bg-leather-accent text-gold-dim">
          {novel.category === 'SHORT' ? '단편' : '장편'}
        </span>
        <span className="text-xs text-sepia-muted">
          {new Date(novel.createdAt).toLocaleDateString('ko-KR')}
        </span>
      </div>
      <h3 className="font-display text-lg text-gold-light mb-2 group-hover:text-gold transition-colors line-clamp-1">
        {novel.title}
      </h3>
      <p className="text-sm text-sepia-muted mb-4 line-clamp-2">
        {novel.description || '소개글이 없습니다.'}
      </p>
      <div className="flex items-center justify-between text-xs text-sepia-muted">
        <span>✍️ {novel.author.nickname}</span>
        <div className="flex items-center space-x-3">
          <span>👁️ {novel.viewCount}</span>
          <span>❤️ {novel.likeCount}</span>
          {novel.category === 'LONG' && (
            <span>📖 {novel._count.chapters}화</span>
          )}
        </div>
      </div>
    </Link>
  )
}
