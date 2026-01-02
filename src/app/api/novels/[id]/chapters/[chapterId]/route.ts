import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string; chapterId: string }>
}

// 회차 상세 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { chapterId } = await params

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        author: { select: { id: true, nickname: true } },
        novel: { select: { id: true, title: true } },
      },
    })

    if (!chapter) {
      return NextResponse.json(
        { error: '회차를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ chapter })
  } catch (error) {
    console.error('Get chapter error:', error)
    return NextResponse.json(
      { error: '회차를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 회차 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { id: novelId, chapterId } = await params

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { novel: true },
    })

    if (!chapter) {
      return NextResponse.json(
        { error: '회차를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (chapter.novelId !== novelId) {
      return NextResponse.json(
        { error: '잘못된 요청입니다.' },
        { status: 400 }
      )
    }

    // 권한 확인
    if (chapter.novel.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '수정 권한이 없습니다.' },
        { status: 403 }
      )
    }

    const { title, content, isPublished } = await request.json()

    const updatedChapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(isPublished !== undefined && { isPublished }),
      },
    })

    return NextResponse.json({
      message: '회차가 수정되었습니다.',
      chapter: updatedChapter,
    })
  } catch (error) {
    console.error('Update chapter error:', error)
    return NextResponse.json(
      { error: '회차 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 회차 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { id: novelId, chapterId } = await params

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { novel: true },
    })

    if (!chapter) {
      return NextResponse.json(
        { error: '회차를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (chapter.novelId !== novelId) {
      return NextResponse.json(
        { error: '잘못된 요청입니다.' },
        { status: 400 }
      )
    }

    // 권한 확인
    if (chapter.novel.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '삭제 권한이 없습니다.' },
        { status: 403 }
      )
    }

    await prisma.chapter.delete({
      where: { id: chapterId },
    })

    return NextResponse.json({ message: '회차가 삭제되었습니다.' })
  } catch (error) {
    console.error('Delete chapter error:', error)
    return NextResponse.json(
      { error: '회차 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

