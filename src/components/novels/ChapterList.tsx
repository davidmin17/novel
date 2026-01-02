import Link from 'next/link'

interface Chapter {
  id: string
  chapterNum: number
  title: string
  viewCount: number
  createdAt: Date
}

interface Props {
  chapters: Chapter[]
  novelId: string
}

export default function ChapterList({ chapters, novelId }: Props) {
  if (chapters.length === 0) {
    return (
      <div className="text-center py-8 text-sepia-muted">
        <p>아직 연재된 회차가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {chapters.map((chapter) => (
        <Link
          key={chapter.id}
          href={`/novels/${novelId}/chapters/${chapter.id}`}
          className="flex items-center justify-between p-4 rounded bg-leather/30 hover:bg-leather/50 border border-gold-dim/20 hover:border-gold-dim/40 transition-all group"
        >
          <div className="flex items-center gap-4">
            <span className="text-gold-dim font-medium min-w-[3rem]">
              {chapter.chapterNum}화
            </span>
            <span className="text-sepia group-hover:text-gold-light transition-colors">
              {chapter.title}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-sepia-muted">
            <span>👁️ {chapter.viewCount}</span>
            <span>{new Date(chapter.createdAt).toLocaleDateString('ko-KR')}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

