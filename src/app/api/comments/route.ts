import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 댓글 등록
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { content, novelId, chapterId, parentId } = await request.json()

    if (!content || (!novelId && !chapterId)) {
      return NextResponse.json(
        { error: '내용과 대상이 필요합니다.' },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: session.user.id,
        novelId: novelId || null,
        chapterId: chapterId || null,
        parentId: parentId || null,
      },
      include: {
        author: { select: { id: true, nickname: true } },
      },
    })

    return NextResponse.json(
      { message: '댓글이 등록되었습니다.', comment },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      { error: '댓글 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

