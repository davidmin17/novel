import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import VoteButtons from '@/components/novels/VoteButtons'
import CommentSection from '@/components/novels/CommentSection'

interface Props {
  params: Promise<{ id: string; chapterId: string }>
}

async function getChapter(chapterId: string) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      novel: {
        select: { id: true, title: true, authorId: true },
      },
      author: { select: { id: true, nickname: true } },
      comments: {
        include: {
          author: { select: { id: true, nickname: true } },
          replies: {
            include: {
              author: { select: { id: true, nickname: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  return chapter
}

async function getAdjacentChapters(novelId: string, chapterNum: number) {
  const [prev, next] = await Promise.all([
    prisma.chapter.findFirst({
      where: { novelId, chapterNum: { lt: chapterNum }, isPublished: true },
      orderBy: { chapterNum: 'desc' },
      select: { id: true, chapterNum: true, title: true },
    }),
    prisma.chapter.findFirst({
      where: { novelId, chapterNum: { gt: chapterNum }, isPublished: true },
      orderBy: { chapterNum: 'asc' },
      select: { id: true, chapterNum: true, title: true },
    }),
  ])

  return { prev, next }
}

async function incrementViewCount(id: string) {
  await prisma.chapter.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  })
}

async function getUserVote(userId: string | undefined, chapterId: string) {
  if (!userId) return null
  return prisma.vote.findUnique({
    where: { userId_chapterId: { userId, chapterId } },
  })
}

export default async function ChapterDetailPage({ params }: Props) {
  const { id: novelId, chapterId } = await params
  const [chapter, session] = await Promise.all([
    getChapter(chapterId),
    getServerSession(authOptions),
  ])

  if (!chapter || !chapter.isPublished) {
    notFound()
  }

  // 조회수 증가
  await incrementViewCount(chapterId)

  const [adjacentChapters, userVote] = await Promise.all([
    getAdjacentChapters(novelId, chapter.chapterNum),
    getUserVote(session?.user?.id, chapterId),
  ])

  const isAuthor = session?.user?.id === chapter.novel.authorId
  const isAdmin = session?.user?.role === 'ADMIN'
  const canEdit = isAuthor || isAdmin

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      {/* 헤더 */}
      <div className="card-vintage p-6 rounded-lg mb-6">
        <Link
          href={`/novels/${novelId}`}
          className="text-sepia-muted hover:text-gold text-sm mb-4 inline-block"
        >
          ← {chapter.novel.title}
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <span className="text-gold-dim text-sm">
              {chapter.chapterNum}화
            </span>
            <h1 className="font-display text-2xl md:text-3xl text-gold mt-1">
              {chapter.title}
            </h1>
          </div>
          {canEdit && (
            <Link
              href={`/novels/${novelId}/chapters/${chapterId}/edit`}
              className="btn-secondary px-3 py-1 rounded text-sm"
            >
              수정
            </Link>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-sepia-muted mt-4">
          <span>✍️ {chapter.author.nickname}</span>
          <span>📅 {new Date(chapter.createdAt).toLocaleDateString('ko-KR')}</span>
          <span>👁️ {chapter.viewCount + 1}</span>
        </div>
      </div>

      {/* 본문 */}
      <div className="card-vintage p-8 rounded-lg mb-6">
        <div className="novel-content text-sepia whitespace-pre-wrap">
          {chapter.content}
        </div>
      </div>

      {/* 좋아요/싫어요 */}
      <div className="card-vintage p-6 rounded-lg mb-6">
        <VoteButtons
          chapterId={chapterId}
          likeCount={chapter.likeCount}
          dislikeCount={chapter.dislikeCount}
          userVote={userVote?.isLike}
          isLoggedIn={!!session}
        />
      </div>

      {/* 이전/다음 회차 네비게이션 */}
      <div className="flex gap-4 mb-8">
        {adjacentChapters.prev ? (
          <Link
            href={`/novels/${novelId}/chapters/${adjacentChapters.prev.id}`}
            className="btn-secondary flex-1 p-4 rounded text-left"
          >
            <span className="text-xs text-sepia-muted block mb-1">← 이전 화</span>
            <span className="text-gold-light">
              {adjacentChapters.prev.chapterNum}화. {adjacentChapters.prev.title}
            </span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {adjacentChapters.next ? (
          <Link
            href={`/novels/${novelId}/chapters/${adjacentChapters.next.id}`}
            className="btn-secondary flex-1 p-4 rounded text-right"
          >
            <span className="text-xs text-sepia-muted block mb-1">다음 화 →</span>
            <span className="text-gold-light">
              {adjacentChapters.next.chapterNum}화. {adjacentChapters.next.title}
            </span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {/* 댓글 섹션 */}
      <CommentSection
        chapterId={chapterId}
        comments={chapter.comments}
        isLoggedIn={!!session}
        currentUserId={session?.user?.id}
        isAdmin={isAdmin}
      />
    </div>
  )
}

