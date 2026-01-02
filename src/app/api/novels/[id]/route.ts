import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// 소설 상세 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const novel = await prisma.novel.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, nickname: true } },
        chapters: {
          where: { isPublished: true },
          orderBy: { chapterNum: 'asc' },
        },
        _count: { select: { comments: true } },
      },
    })

    if (!novel) {
      return NextResponse.json(
        { error: '작품을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ novel })
  } catch (error) {
    console.error('Get novel error:', error)
    return NextResponse.json(
      { error: '작품을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 소설 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const novel = await prisma.novel.findUnique({
      where: { id },
    })

    if (!novel) {
      return NextResponse.json(
        { error: '작품을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인: 작성자 또는 관리자만 수정 가능
    if (novel.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '수정 권한이 없습니다.' },
        { status: 403 }
      )
    }

    const { title, description, content, isPublished } = await request.json()

    const updatedNovel = await prisma.novel.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(content !== undefined && { content }),
        ...(isPublished !== undefined && { isPublished }),
      },
    })

    return NextResponse.json({
      message: '작품이 수정되었습니다.',
      novel: updatedNovel,
    })
  } catch (error) {
    console.error('Update novel error:', error)
    return NextResponse.json(
      { error: '작품 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 소설 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const novel = await prisma.novel.findUnique({
      where: { id },
    })

    if (!novel) {
      return NextResponse.json(
        { error: '작품을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인: 작성자 또는 관리자만 삭제 가능
    if (novel.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '삭제 권한이 없습니다.' },
        { status: 403 }
      )
    }

    await prisma.novel.delete({
      where: { id },
    })

    return NextResponse.json({ message: '작품이 삭제되었습니다.' })
  } catch (error) {
    console.error('Delete novel error:', error)
    return NextResponse.json(
      { error: '작품 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

