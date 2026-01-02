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

const ITEMS_PER_PAGE = 20

export default async function NovelsPage({ searchParams }: Props) {
  const params = await searchParams
  const category = params.category
  const sort = params.sort || 'latest'
  const search = params.search || ''
  const page = parseInt(params.page || '1')

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
    <div className="min-h-screen pt-20 pb-12 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {category === 'SHORT' ? '단편 소설' : category === 'LONG' ? '장편 소설' : '전체 작품'}
          </h1>
          <p className="text-[#808080]">
            총 {totalCount}개의 작품
          </p>
        </div>

        {/* 검색 및 필터 */}
        <SearchAndFilter
          currentCategory={category}
          currentSort={sort}
          currentSearch={search}
        />

        {/* 소설 목록 */}
        {novels.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
            {novels.map((novel) => (
              <Link
                key={novel.id}
                href={`/novels/${novel.id}`}
                className="novel-card group block"
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-[#333] to-[#1a1a1a] relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl opacity-30">📖</span>
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium">자세히 보기</span>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="badge badge-red text-xs">
                      {novel.category === 'SHORT' ? '단편' : '장편'}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-white font-medium text-sm line-clamp-1 mb-1 group-hover:text-[#e50914] transition-colors">
                    {novel.title}
                  </h3>
                  <p className="text-[#808080] text-xs mb-2">
                    {novel.author.nickname}
                  </p>
                  <div className="flex items-center gap-3 text-[#808080] text-xs">
                    <span>👁 {novel.viewCount}</span>
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
            <div className="text-6xl mb-4 opacity-50">📚</div>
            <p className="text-[#808080] text-lg mb-2">
              {search ? '검색 결과가 없습니다.' : '아직 등록된 작품이 없습니다.'}
            </p>
            <p className="text-[#808080] text-sm">
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
    </div>
  )
}
