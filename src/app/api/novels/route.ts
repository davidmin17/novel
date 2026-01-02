import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 소설 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'latest'
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

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
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    return NextResponse.json({
      novels,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error('Get novels error:', error)
    return NextResponse.json(
      { error: '소설 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 소설 등록
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { title, description, category, content } = await request.json()

    // 유효성 검사
    if (!title || !category) {
      return NextResponse.json(
        { error: '제목과 카테고리는 필수입니다.' },
        { status: 400 }
      )
    }

    if (category === 'SHORT' && !content) {
      return NextResponse.json(
        { error: '단편 소설은 본문이 필수입니다.' },
        { status: 400 }
      )
    }

    const novel = await prisma.novel.create({
      data: {
        title,
        description,
        category,
        content: category === 'SHORT' ? content : null,
        authorId: session.user.id,
      },
    })

    return NextResponse.json(
      { message: '작품이 등록되었습니다.', novel },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create novel error:', error)
    return NextResponse.json(
      { error: '작품 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

