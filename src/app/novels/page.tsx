import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SearchAndFilter from '@/components/novels/SearchAndFilter'
import Pagination from '@/components/common/Pagination'

interface Props {
  searchParams: Promise<{
    category?: string
    sort?: string
    search?: string
    page?: string
  }>
}

const ITEMS_PER_PAGE = 12

export default async function NovelsPage({ searchParams }: Props) {
  const params = await searchParams
  const category = params.category
  const sort = params.sort || 'latest'
  const search = params.search || ''
  const page = parseInt(params.page || '1')

  // 정렬 옵션
  const orderBy = (() => {
    switch (sort) {
      case 'popular':
        return { viewCount: 'desc' as const }
      case 'likes':
        return { likeCount: 'desc' as const }
      case 'oldest':
        return { createdAt: 'asc' as const }
      default:
        return { createdAt: 'desc' as const }
    }
  })()

  // 필터 조건
  const where = {
    isPublished: true,
    ...(category && { category: category as 'SHORT' | 'LONG' }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { author: { nickname: { contains: search, mode: 'insensitive' as const } } },
      ],
    }),
  }

  // 전체 개수 및 소설 목록 조회
  const [totalCount, novels] = await Promise.all([
    prisma.novel.count({ where }),
    prisma.novel.findMany({
      where,
      include: {
        author: { select: { nickname: true } },
        _count: { select: { chapters: true, comments: true } },
      },
      orderBy,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
  ])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl text-gold mb-4">
          {category === 'SHORT' ? '📝 단편 소설' : category === 'LONG' ? '📚 장편 소설' : '📖 전체 작품'}
        </h1>
        <p className="text-sepia-muted">
          {category === 'SHORT'
            ? '짧지만 깊은 감동을 주는 단편 소설들'
            : category === 'LONG'
            ? '회차별로 연재되는 장대한 이야기들'
            : '묵향서원의 모든 작품을 만나보세요'}
        </p>
      </div>

      {/* 검색 및 필터 */}
      <SearchAndFilter
        currentCategory={category}
        currentSort={sort}
        currentSearch={search}
      />

      {/* 결과 카운트 */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sepia-muted text-sm">
          총 <span className="text-gold">{totalCount}</span>개의 작품
        </p>
      </div>

      {/* 소설 목록 */}
      {novels.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {novels.map((novel) => (
            <Link
              key={novel.id}
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
              <p className="text-sm text-sepia-muted mb-4 line-clamp-2 min-h-[2.5rem]">
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
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-sepia-muted text-lg mb-2">
            {search ? '검색 결과가 없습니다.' : '아직 등록된 작품이 없습니다.'}
          </p>
          <p className="text-sepia-muted/60 text-sm">
            {search ? '다른 검색어로 시도해보세요.' : '첫 번째 작가가 되어보세요!'}
          </p>
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          baseUrl={`/novels?${category ? `category=${category}&` : ''}${sort ? `sort=${sort}&` : ''}${search ? `search=${search}&` : ''}`}
        />
      )}
    </div>
  )
}

