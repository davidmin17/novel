'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export default function EditNovelPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const { data: session, status } = useSession()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchNovel = async () => {
      try {
        const response = await fetch(`/api/novels/${id}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || '작품을 불러올 수 없습니다.')
          return
        }

        setFormData({
          title: data.novel.title,
          description: data.novel.description || '',
          content: data.novel.content || '',
          category: data.novel.category,
        })
      } catch {
        setError('작품을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNovel()
  }, [id])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      const response = await fetch(`/api/novels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '작품 수정에 실패했습니다.')
        return
      }

      router.push(`/novels/${id}`)
    } catch {
      setError('작품 수정 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말로 이 작품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    try {
      const response = await fetch(`/api/novels/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || '작품 삭제에 실패했습니다.')
        return
      }

      router.push('/novels')
    } catch {
      setError('작품 삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <div className="card-vintage p-8 rounded-lg">
        {/* 헤더 */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="font-display text-3xl text-gold mb-2">✏️ 작품 수정</h1>
            <p className="text-sepia-muted text-sm">
              {formData.category === 'SHORT' ? '📝 단편 소설' : '📚 장편 소설'}
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="text-velvet hover:text-velvet-hover text-sm transition-colors"
          >
            🗑️ 삭제
          </button>
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
              제목 *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="input-vintage w-full px-4 py-3 rounded"
              placeholder="작품의 제목을 입력하세요"
              required
            />
          </div>

          {/* 소개 */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm text-sepia-muted mb-2"
            >
              작품 소개
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input-vintage w-full px-4 py-3 rounded min-h-[100px] resize-y"
              placeholder="작품에 대한 간단한 소개를 작성해주세요"
            />
          </div>

          {/* 본문 (단편만) */}
          {formData.category === 'SHORT' && (
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
                className="input-vintage w-full px-4 py-3 rounded min-h-[400px] resize-y font-serif leading-relaxed"
                placeholder="이야기를 시작해보세요..."
                required
              />
            </div>
          )}

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
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

