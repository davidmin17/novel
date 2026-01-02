import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// 댓글 수정
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

    const comment = await prisma.comment.findUnique({
      where: { id },
    })

    if (!comment) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인: 작성자 또는 관리자만 수정 가능
    if (comment.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '수정 권한이 없습니다.' },
        { status: 403 }
      )
    }

    const { content } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: '내용을 입력해주세요.' },
        { status: 400 }
      )
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content },
    })

    return NextResponse.json({
      message: '댓글이 수정되었습니다.',
      comment: updatedComment,
    })
  } catch (error) {
    console.error('Update comment error:', error)
    return NextResponse.json(
      { error: '댓글 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 댓글 삭제
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

    const comment = await prisma.comment.findUnique({
      where: { id },
    })

    if (!comment) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인: 작성자 또는 관리자만 삭제 가능
    if (comment.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '삭제 권한이 없습니다.' },
        { status: 403 }
      )
    }

    await prisma.comment.delete({
      where: { id },
    })

    return NextResponse.json({ message: '댓글이 삭제되었습니다.' })
  } catch (error) {
    console.error('Delete comment error:', error)
    return NextResponse.json(
      { error: '댓글 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

