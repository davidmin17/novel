'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function WriteNovelPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'SHORT',
    content: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 로그인 체크
  if (status === 'loading') {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-white">로딩 중...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-[#e5e5e5] mb-4">로그인이 필요한 서비스입니다.</p>
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
    setIsLoading(true)

    try {
      const response = await fetch('/api/novels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '작품 등록에 실패했습니다.')
        return
      }

      router.push(`/novels/${data.novel.id}`)
    } catch {
      setError('작품 등록 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#232323] p-8 rounded">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">새 작품 등록</h1>
            <p className="text-[#808080] text-sm">
              당신의 이야기를 세상에 펼쳐보세요
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 rounded bg-[#e50914]/20 border border-[#e50914] text-[#e5e5e5] text-sm">
              {error}
            </div>
          )}

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 카테고리 선택 */}
            <div>
              <label className="block text-sm text-[#808080] mb-3">
                작품 유형
              </label>
              <div className="flex gap-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value="SHORT"
                    checked={formData.category === 'SHORT'}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="sr-only"
                  />
                  <span
                    className={`px-5 py-3 rounded transition-all ${
                      formData.category === 'SHORT'
                        ? 'bg-white text-black font-medium'
                        : 'bg-[#333] text-[#e5e5e5] hover:bg-[#404040]'
                    }`}
                  >
                    📝 단편 소설
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value="LONG"
                    checked={formData.category === 'LONG'}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="sr-only"
                  />
                  <span
                    className={`px-5 py-3 rounded transition-all ${
                      formData.category === 'LONG'
                        ? 'bg-white text-black font-medium'
                        : 'bg-[#333] text-[#e5e5e5] hover:bg-[#404040]'
                    }`}
                  >
                    📚 장편 소설
                  </span>
                </label>
              </div>
              <p className="text-xs text-[#808080] mt-2">
                {formData.category === 'SHORT'
                  ? '단편 소설은 하나의 완결된 이야기를 작성합니다.'
                  : '장편 소설은 회차별로 연재할 수 있습니다.'}
              </p>
            </div>

            {/* 제목 */}
            <div>
              <label htmlFor="title" className="block text-sm text-[#808080] mb-2">
                제목 *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="input-field w-full px-4 py-3 rounded bg-[#333]"
                placeholder="작품의 제목을 입력하세요"
                required
              />
            </div>

            {/* 소개 */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm text-[#808080] mb-2"
              >
                작품 소개
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="input-field w-full px-4 py-3 rounded bg-[#333] min-h-[100px] resize-y"
                placeholder="작품에 대한 간단한 소개를 작성해주세요"
              />
            </div>

            {/* 본문 (단편만) */}
            {formData.category === 'SHORT' && (
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm text-[#808080] mb-2"
                >
                  본문 *
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="input-field w-full px-4 py-3 rounded bg-[#333] min-h-[400px] resize-y leading-relaxed"
                  placeholder="이야기를 시작해보세요..."
                  required={formData.category === 'SHORT'}
                />
              </div>
            )}

            {formData.category === 'LONG' && (
              <div className="p-4 rounded bg-[#1a1a1a] border border-[#333]">
                <p className="text-[#808080] text-sm">
                  💡 장편 소설은 작품 등록 후 회차를 추가하여 연재할 수 있습니다.
                </p>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary px-6 py-3 rounded flex-1"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary px-6 py-3 rounded flex-1 disabled:opacity-50"
              >
                {isLoading ? '등록 중...' : '작품 등록'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
