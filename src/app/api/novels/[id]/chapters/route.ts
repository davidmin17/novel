import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// 회차 목록 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: novelId } = await params

    const chapters = await prisma.chapter.findMany({
      where: { novelId, isPublished: true },
      orderBy: { chapterNum: 'asc' },
      select: {
        id: true,
        chapterNum: true,
        title: true,
        viewCount: true,
        likeCount: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ chapters })
  } catch (error) {
    console.error('Get chapters error:', error)
    return NextResponse.json(
      { error: '회차 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 회차 등록
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { id: novelId } = await params

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const novel = await prisma.novel.findUnique({
      where: { id: novelId },
    })

    if (!novel) {
      return NextResponse.json(
        { error: '작품을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (novel.category !== 'LONG') {
      return NextResponse.json(
        { error: '장편 소설만 회차를 추가할 수 있습니다.' },
        { status: 400 }
      )
    }

    // 권한 확인: 작성자 또는 관리자만 회차 추가 가능
    if (novel.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '회차 추가 권한이 없습니다.' },
        { status: 403 }
      )
    }

    const { title, content, chapterNum } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 본문은 필수입니다.' },
        { status: 400 }
      )
    }

    // 회차 번호 중복 확인
    const existingChapter = await prisma.chapter.findUnique({
      where: { novelId_chapterNum: { novelId, chapterNum } },
    })

    if (existingChapter) {
      return NextResponse.json(
        { error: '이미 존재하는 회차 번호입니다.' },
        { status: 400 }
      )
    }

    const chapter = await prisma.chapter.create({
      data: {
        title,
        content,
        chapterNum,
        novelId,
        authorId: session.user.id,
      },
    })

    return NextResponse.json(
      { message: '회차가 등록되었습니다.', chapter },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create chapter error:', error)
    return NextResponse.json(
      { error: '회차 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

