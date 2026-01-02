import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { novelId, chapterId, isLike } = await request.json()

    if (!novelId && !chapterId) {
      return NextResponse.json(
        { error: '대상이 필요합니다.' },
        { status: 400 }
      )
    }

    const userId = session.user.id

    // 기존 투표 확인
    const existingVote = novelId
      ? await prisma.vote.findUnique({
          where: { userId_novelId: { userId, novelId } },
        })
      : await prisma.vote.findUnique({
          where: { userId_chapterId: { userId, chapterId } },
        })

    let action: 'created' | 'removed' | 'changed'

    if (existingVote) {
      if (existingVote.isLike === isLike) {
        // 같은 버튼을 다시 누르면 투표 취소
        await prisma.vote.delete({
          where: { id: existingVote.id },
        })

        // 카운트 감소
        if (novelId) {
          await prisma.novel.update({
            where: { id: novelId },
            data: isLike
              ? { likeCount: { decrement: 1 } }
              : { dislikeCount: { decrement: 1 } },
          })
        } else {
          await prisma.chapter.update({
            where: { id: chapterId },
            data: isLike
              ? { likeCount: { decrement: 1 } }
              : { dislikeCount: { decrement: 1 } },
          })
        }

        action = 'removed'
      } else {
        // 다른 버튼을 누르면 투표 변경
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { isLike },
        })

        // 카운트 변경
        if (novelId) {
          await prisma.novel.update({
            where: { id: novelId },
            data: isLike
              ? { likeCount: { increment: 1 }, dislikeCount: { decrement: 1 } }
              : { likeCount: { decrement: 1 }, dislikeCount: { increment: 1 } },
          })
        } else {
          await prisma.chapter.update({
            where: { id: chapterId },
            data: isLike
              ? { likeCount: { increment: 1 }, dislikeCount: { decrement: 1 } }
              : { likeCount: { decrement: 1 }, dislikeCount: { increment: 1 } },
          })
        }

        action = 'changed'
      }
    } else {
      // 새 투표
      await prisma.vote.create({
        data: {
          userId,
          novelId: novelId || null,
          chapterId: chapterId || null,
          isLike,
        },
      })

      // 카운트 증가
      if (novelId) {
        await prisma.novel.update({
          where: { id: novelId },
          data: isLike
            ? { likeCount: { increment: 1 } }
            : { dislikeCount: { increment: 1 } },
        })
      } else {
        await prisma.chapter.update({
          where: { id: chapterId },
          data: isLike
            ? { likeCount: { increment: 1 } }
            : { dislikeCount: { increment: 1 } },
        })
      }

      action = 'created'
    }

    return NextResponse.json({ message: '투표가 처리되었습니다.', action })
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json(
      { error: '투표 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

