'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export default function WriteChapterPage({ params }: Props) {
  const { id: novelId } = use(params)
  const router = useRouter()
  const { data: session, status } = useSession()

  const [novel, setNovel] = useState<{ title: string; category: string } | null>(null)
  const [nextChapterNum, setNextChapterNum] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchNovel = async () => {
      try {
        const response = await fetch(`/api/novels/${novelId}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || '작품을 불러올 수 없습니다.')
          return
        }

        if (data.novel.category !== 'LONG') {
          setError('장편 소설만 회차를 추가할 수 있습니다.')
          return
        }

        setNovel(data.novel)
        setNextChapterNum(data.novel.chapters.length + 1)
      } catch {
        setError('작품을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNovel()
  }, [novelId])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gold">로딩 중...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-sepia mb-4">로그인이 필요한 서비스입니다.</p>
          <Link href="/auth/login" className="btn-primary px-6 py-2 rounded">
            로그인하기
          </Link>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-sepia mb-4">{error}</p>
          <Link href={`/novels/${novelId}`} className="btn-secondary px-6 py-2 rounded">
            작품으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      const response = await fetch(`/api/novels/${novelId}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          chapterNum: nextChapterNum,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '회차 등록에 실패했습니다.')
        return
      }

      router.push(`/novels/${novelId}/chapters/${data.chapter.id}`)
    } catch {
      setError('회차 등록 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <div className="card-vintage p-8 rounded-lg">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href={`/novels/${novelId}`}
            className="text-sepia-muted hover:text-gold text-sm mb-2 inline-block"
          >
            ← {novel?.title}
          </Link>
          <h1 className="font-display text-3xl text-gold mb-2">
            📝 {nextChapterNum}화 작성
          </h1>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 rounded bg-velvet/20 border border-velvet text-sepia text-sm">
            {error}
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 제목 */}
          <div>
            <label htmlFor="title" className="block text-sm text-sepia-muted mb-2">
              회차 제목 *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="input-vintage w-full px-4 py-3 rounded"
              placeholder="이번 회차의 제목을 입력하세요"
              required
            />
          </div>

          {/* 본문 */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm text-sepia-muted mb-2"
            >
              본문 *
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="input-vintage w-full px-4 py-3 rounded min-h-[500px] resize-y font-serif leading-relaxed"
              placeholder="이야기를 이어가세요..."
              required
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary px-6 py-3 rounded flex-1"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary px-6 py-3 rounded flex-1 disabled:opacity-50"
            >
              {isSaving ? '등록 중...' : '회차 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

