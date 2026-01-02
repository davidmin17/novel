'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const [search, setSearch] = useState(currentSearch)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (currentCategory) params.set('category', currentCategory)
    router.push(`/admin/novels?${params.toString()}`)
  }

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams()
    if (currentSearch) params.set('search', currentSearch)
    if (category) params.set('category', category)
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
            className="input-field flex-1 px-4 py-3 rounded bg-[#333]"
          />
          <button type="submit" className="btn-primary px-6 py-3 rounded">
            검색
          </button>
        </form>
        <div className="flex gap-2">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              !currentCategory ? 'bg-white text-black' : 'bg-[#333] text-[#e5e5e5] hover:bg-[#404040]'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => handleCategoryChange('SHORT')}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              currentCategory === 'SHORT' ? 'bg-white text-black' : 'bg-[#333] text-[#e5e5e5] hover:bg-[#404040]'
            }`}
          >
            단편
          </button>
          <button
            onClick={() => handleCategoryChange('LONG')}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              currentCategory === 'LONG' ? 'bg-white text-black' : 'bg-[#333] text-[#e5e5e5] hover:bg-[#404040]'
            }`}
          >
            장편
          </button>
        </div>
      </div>

      {/* 작품 목록 */}
      <div className="bg-[#232323] rounded overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-[#333]">
              <th className="text-left p-4 text-[#808080] font-medium text-sm">제목</th>
              <th className="text-left p-4 text-[#808080] font-medium text-sm">분류</th>
              <th className="text-left p-4 text-[#808080] font-medium text-sm">작가</th>
              <th className="text-left p-4 text-[#808080] font-medium text-sm">조회</th>
              <th className="text-left p-4 text-[#808080] font-medium text-sm">좋아요</th>
              <th className="text-left p-4 text-[#808080] font-medium text-sm">회차</th>
              <th className="text-left p-4 text-[#808080] font-medium text-sm">상태</th>
              <th className="text-left p-4 text-[#808080] font-medium text-sm">등록일</th>
              <th className="text-left p-4 text-[#808080] font-medium text-sm">관리</th>
            </tr>
          </thead>
          <tbody>
            {novels.map((novel) => (
              <tr
                key={novel.id}
                className="border-b border-[#333]/50 hover:bg-[#2a2a2a]"
              >
                <td className="p-4">
                  <Link
                    href={`/novels/${novel.id}`}
                    className="text-[#e5e5e5] hover:text-[#e50914] transition-colors"
                  >
                    {novel.title}
                  </Link>
                </td>
                <td className="p-4">
                  <span className="text-xs px-2 py-1 rounded bg-[#e50914] text-white">
                    {novel.category === 'SHORT' ? '단편' : '장편'}
                  </span>
                </td>
                <td className="p-4 text-[#808080]">{novel.author.nickname}</td>
                <td className="p-4 text-[#808080]">{novel.viewCount}</td>
                <td className="p-4 text-[#808080]">{novel.likeCount}</td>
                <td className="p-4 text-[#808080]">
                  {novel.category === 'LONG' ? `${novel._count.chapters}화` : '-'}
                </td>
                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      novel.isPublished
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-[#333] text-[#808080]'
                    }`}
                  >
                    {novel.isPublished ? '공개' : '비공개'}
                  </span>
                </td>
                <td className="p-4 text-[#808080] text-sm">
                  {new Date(novel.createdAt).toLocaleDateString('ko-KR')}
                </td>
                <td className="p-4">
                  <div className="flex gap-3">
                    <Link
                      href={`/novels/${novel.id}/edit`}
                      className="text-xs text-[#e5e5e5] hover:text-white"
                    >
                      수정
                    </Link>
                    <button
                      onClick={() => handleDelete(novel.id, novel.title)}
                      className="text-xs text-[#e50914] hover:text-[#f40612]"
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
        <div className="flex justify-center gap-1 mt-6">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(
            (page) => (
              <Link
                key={page}
                href={`/admin/novels?page=${page}${currentSearch ? `&search=${currentSearch}` : ''}${currentCategory ? `&category=${currentCategory}` : ''}`}
                className={`px-3 py-2 rounded text-sm ${
                  currentPage === page
                    ? 'bg-white text-black'
                    : 'bg-[#333] text-[#e5e5e5] hover:bg-[#404040]'
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
