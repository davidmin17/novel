import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import NovelManagement from '@/components/admin/NovelManagement'

interface Props {
  searchParams: Promise<{ page?: string; search?: string; category?: string }>
}

const ITEMS_PER_PAGE = 20

export default async function AdminNovelsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const params = await searchParams
  const page = parseInt(params.page || '1')
  const search = params.search || ''
  const category = params.category

  const where = {
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { author: { nickname: { contains: search, mode: 'insensitive' as const } } },
      ],
    }),
    ...(category && { category: category as 'SHORT' | 'LONG' }),
  }

  const [totalCount, novels] = await Promise.all([
    prisma.novel.count({ where }),
    prisma.novel.findMany({
      where,
      include: {
        author: { select: { nickname: true } },
        _count: { select: { chapters: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
  ])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-display text-3xl text-gold mb-2">📚 작품 관리</h1>
          <p className="text-sepia-muted">
            총 <span className="text-gold">{totalCount}</span>개의 작품
          </p>
        </div>
        <Link href="/admin" className="btn-secondary px-4 py-2 rounded text-sm">
          ← 대시보드
        </Link>
      </div>

      <NovelManagement
        novels={novels}
        currentPage={page}
        totalPages={totalPages}
        currentSearch={search}
        currentCategory={category}
      />
    </div>
  )
}

