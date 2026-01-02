'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Novel {
  id: string
  title: string
  category: string
  viewCount: number
  likeCount: number
  isPublished: boolean
  createdAt: Date
  author: { nickname: string }
  _count: { chapters: number; comments: number }
}

interface Props {
  novels: Novel[]
  currentPage: number
  totalPages: number
  currentSearch: string
  currentCategory?: string
}

export default function NovelManagement({
  novels,
  currentPage,
  totalPages,
  currentSearch,
  currentCategory,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentSearch)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }
    params.delete('page')
    router.push(`/admin/novels?${params.toString()}`)
  }

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    params.delete('page')
    router.push(`/admin/novels?${params.toString()}`)
  }

  const handleDelete = async (novelId: string, title: string) => {
    if (!confirm(`정말로 "${title}"을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    try {
      const response = await fetch(`/api/novels/${novelId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || '삭제에 실패했습니다.')
      }
    } catch {
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div>
      {/* 필터 및 검색 */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="제목 또는 작가명으로 검색..."
            className="input-vintage flex-1 px-4 py-2 rounded"
          />
          <button type="submit" className="btn-primary px-6 py-2 rounded">
            검색
          </button>
        </form>
        <div className="flex gap-2">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-4 py-2 rounded text-sm ${
              !currentCategory ? 'bg-gold text-parchment-dark' : 'btn-secondary'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => handleCategoryChange('SHORT')}
            className={`px-4 py-2 rounded text-sm ${
              currentCategory === 'SHORT' ? 'bg-gold text-parchment-dark' : 'btn-secondary'
            }`}
          >
            단편
          </button>
          <button
            onClick={() => handleCategoryChange('LONG')}
            className={`px-4 py-2 rounded text-sm ${
              currentCategory === 'LONG' ? 'bg-gold text-parchment-dark' : 'btn-secondary'
            }`}
          >
            장편
          </button>
        </div>
      </div>

      {/* 작품 목록 */}
      <div className="card-vintage rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gold-dim/30">
              <th className="text-left p-4 text-gold-dim font-medium">제목</th>
              <th className="text-left p-4 text-gold-dim font-medium">분류</th>
              <th className="text-left p-4 text-gold-dim font-medium">작가</th>
              <th className="text-left p-4 text-gold-dim font-medium">조회</th>
              <th className="text-left p-4 text-gold-dim font-medium">좋아요</th>
              <th className="text-left p-4 text-gold-dim font-medium">회차</th>
              <th className="text-left p-4 text-gold-dim font-medium">상태</th>
              <th className="text-left p-4 text-gold-dim font-medium">등록일</th>
              <th className="text-left p-4 text-gold-dim font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {novels.map((novel) => (
              <tr
                key={novel.id}
                className="border-b border-gold-dim/10 hover:bg-leather/30"
              >
                <td className="p-4">
                  <Link
                    href={`/novels/${novel.id}`}
                    className="text-sepia hover:text-gold"
                  >
                    {novel.title}
                  </Link>
                </td>
                <td className="p-4">
                  <span className="text-xs px-2 py-1 rounded bg-leather-accent text-gold-dim">
                    {novel.category === 'SHORT' ? '단편' : '장편'}
                  </span>
                </td>
                <td className="p-4 text-sepia-muted">{novel.author.nickname}</td>
                <td className="p-4 text-sepia-muted">{novel.viewCount}</td>
                <td className="p-4 text-sepia-muted">{novel.likeCount}</td>
                <td className="p-4 text-sepia-muted">
                  {novel.category === 'LONG' ? `${novel._count.chapters}화` : '-'}
                </td>
                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      novel.isPublished
                        ? 'bg-green-900/50 text-green-300'
                        : 'bg-velvet/50 text-sepia'
                    }`}
                  >
                    {novel.isPublished ? '공개' : '비공개'}
                  </span>
                </td>
                <td className="p-4 text-sepia-muted text-sm">
                  {new Date(novel.createdAt).toLocaleDateString('ko-KR')}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/novels/${novel.id}/edit`}
                      className="text-xs text-gold hover:text-gold-light"
                    >
                      수정
                    </Link>
                    <button
                      onClick={() => handleDelete(novel.id, novel.title)}
                      className="text-xs text-velvet hover:text-velvet-hover"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(
            (page) => (
              <Link
                key={page}
                href={`/admin/novels?page=${page}${currentSearch ? `&search=${currentSearch}` : ''}${currentCategory ? `&category=${currentCategory}` : ''}`}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? 'bg-gold text-parchment-dark'
                    : 'btn-secondary'
                }`}
              >
                {page}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  )
}

