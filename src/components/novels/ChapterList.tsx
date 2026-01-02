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
      <div className="text-center py-12 text-[#808080]">
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
          className="flex items-center justify-between p-4 rounded bg-[#232323] hover:bg-[#2a2a2a] transition-colors group"
        >
          <div className="flex items-center gap-4">
            <span className="text-[#e50914] font-medium min-w-[3rem]">
              {chapter.chapterNum}화
            </span>
            <span className="text-[#e5e5e5] group-hover:text-white transition-colors">
              {chapter.title}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#808080]">
            <span>👁 {chapter.viewCount}</span>
            <span>{new Date(chapter.createdAt).toLocaleDateString('ko-KR')}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
