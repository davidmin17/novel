import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import UserManagement from '@/components/admin/UserManagement'

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>
}

const ITEMS_PER_PAGE = 20

export default async function AdminUsersPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const params = await searchParams
  const page = parseInt(params.page || '1')
  const search = params.search || ''

  const where = search
    ? {
        OR: [
          { username: { contains: search, mode: 'insensitive' as const } },
          { nickname: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [totalCount, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
  ])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">회원 관리</h1>
            <p className="text-[#808080]">
              총 <span className="text-white">{totalCount}</span>명의 회원
            </p>
          </div>
          <Link href="/admin" className="btn-secondary px-4 py-2 rounded text-sm">
            ← 대시보드
          </Link>
        </div>

        <UserManagement
          users={users}
          currentPage={page}
          totalPages={totalPages}
          currentSearch={search}
        />
      </div>
    </div>
  )
}
