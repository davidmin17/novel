import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import VoteButtons from '@/components/novels/VoteButtons'
import CommentSection from '@/components/novels/CommentSection'
import ChapterList from '@/components/novels/ChapterList'

interface Props {
  params: Promise<{ id: string }>
}

async function getNovel(id: string) {
  const novel = await prisma.novel.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, nickname: true } },
      chapters: {
        where: { isPublished: true },
        orderBy: { chapterNum: 'asc' },
        select: {
          id: true,
          chapterNum: true,
          title: true,
          viewCount: true,
          createdAt: true,
        },
      },
      comments: {
        where: { chapterId: null },
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
      _count: { select: { comments: true } },
    },
  })

  return novel
}

async function incrementViewCount(id: string) {
  await prisma.novel.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  })
}

async function getUserVote(userId: string | undefined, novelId: string) {
  if (!userId) return null
  return prisma.vote.findUnique({
    where: { userId_novelId: { userId, novelId } },
  })
}

export default async function NovelDetailPage({ params }: Props) {
  const { id } = await params
  const [novel, session] = await Promise.all([
    getNovel(id),
    getServerSession(authOptions),
  ])

  if (!novel || !novel.isPublished) {
    notFound()
  }

  // 조회수 증가
  await incrementViewCount(id)

  const userVote = await getUserVote(session?.user?.id, id)
  const isAuthor = session?.user?.id === novel.authorId
  const isAdmin = session?.user?.role === 'ADMIN'
  const canEdit = isAuthor || isAdmin

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      {/* 헤더 */}
      <div className="card-vintage p-8 rounded-lg mb-8">
        <div className="flex items-start justify-between mb-4">
          <span className="text-sm px-3 py-1 rounded bg-leather-accent text-gold-dim">
            {novel.category === 'SHORT' ? '📝 단편' : '📚 장편'}
          </span>
          {canEdit && (
            <div className="flex gap-2">
              <Link
                href={`/novels/${id}/edit`}
                className="btn-secondary px-3 py-1 rounded text-sm"
              >
                수정
              </Link>
              {novel.category === 'LONG' && (
                <Link
                  href={`/novels/${id}/chapters/write`}
                  className="btn-primary px-3 py-1 rounded text-sm"
                >
                  + 회차 추가
                </Link>
              )}
            </div>
          )}
        </div>

        <h1 className="font-display text-3xl md:text-4xl text-gold mb-4">
          {novel.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-sepia-muted mb-6">
          <span>✍️ {novel.author.nickname}</span>
          <span>📅 {new Date(novel.createdAt).toLocaleDateString('ko-KR')}</span>
          <span>👁️ {novel.viewCount + 1}</span>
          <span>💬 {novel._count.comments}</span>
        </div>

        {novel.description && (
          <div className="p-4 rounded bg-leather/50 border border-gold-dim/30 mb-6">
            <p className="text-sepia leading-relaxed">{novel.description}</p>
          </div>
        )}

        {/* 좋아요/싫어요 */}
        <VoteButtons
          novelId={id}
          likeCount={novel.likeCount}
          dislikeCount={novel.dislikeCount}
          userVote={userVote?.isLike}
          isLoggedIn={!!session}
        />
      </div>

      {/* 장편: 회차 목록 / 단편: 본문 */}
      {novel.category === 'LONG' ? (
        <div className="card-vintage p-6 rounded-lg mb-8">
          <h2 className="font-display text-xl text-gold mb-6">
            📖 회차 목록 ({novel.chapters.length}화)
          </h2>
          <ChapterList chapters={novel.chapters} novelId={id} />
        </div>
      ) : (
        <div className="card-vintage p-8 rounded-lg mb-8">
          <div className="novel-content text-sepia whitespace-pre-wrap">
            {novel.content || '내용이 없습니다.'}
          </div>
        </div>
      )}

      {/* 댓글 섹션 */}
      <CommentSection
        novelId={id}
        comments={novel.comments}
        isLoggedIn={!!session}
        currentUserId={session?.user?.id}
        isAdmin={isAdmin}
      />
    </div>
  )
}

