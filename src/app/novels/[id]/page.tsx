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

  await incrementViewCount(id)

  const userVote = await getUserVote(session?.user?.id, id)
  const isAuthor = session?.user?.id === novel.authorId
  const isAdmin = session?.user?.role === 'ADMIN'
  const canEdit = isAuthor || isAdmin

  return (
    <div className="min-h-screen pt-20 pb-12 animate-fade-in">
      {/* 히어로 섹션 */}
      <div className="relative h-[50vh] flex items-end">
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 pb-8 w-full">
          <div className="flex items-start justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="badge badge-red">
                  {novel.category === 'SHORT' ? '단편' : '장편'}
                </span>
                {novel.category === 'LONG' && (
                  <span className="badge badge-dark">
                    {novel.chapters.length}화
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {novel.title}
              </h1>

              <div className="flex items-center gap-4 text-[#b3b3b3] text-sm mb-4">
                <span>{novel.author.nickname}</span>
                <span>•</span>
                <span>{new Date(novel.createdAt).toLocaleDateString('ko-KR')}</span>
                <span>•</span>
                <span>조회 {novel.viewCount + 1}</span>
              </div>

              {novel.description && (
                <p className="text-[#e5e5e5] leading-relaxed">
                  {novel.description}
                </p>
              )}
            </div>

            {canEdit && (
              <div className="flex gap-2">
                <Link
                  href={`/novels/${id}/edit`}
                  className="btn-secondary px-4 py-2 rounded text-sm"
                >
                  수정
                </Link>
                {novel.category === 'LONG' && (
                  <Link
                    href={`/novels/${id}/chapters/write`}
                    className="btn-primary px-4 py-2 rounded text-sm"
                  >
                    + 회차 추가
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* 좋아요/싫어요 */}
        <div className="py-6 border-b border-[#333]">
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
          <div className="py-8">
            <h2 className="text-xl font-bold text-white mb-6">
              회차 목록
            </h2>
            <ChapterList chapters={novel.chapters} novelId={id} />
          </div>
        ) : (
          <div className="py-8">
            <div className="novel-content whitespace-pre-wrap">
              {novel.content || '내용이 없습니다.'}
            </div>
          </div>
        )}

        {/* 댓글 섹션 */}
        <div className="py-8 border-t border-[#333]">
          <CommentSection
            novelId={id}
            comments={novel.comments}
            isLoggedIn={!!session}
            currentUserId={session?.user?.id}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </div>
  )
}
