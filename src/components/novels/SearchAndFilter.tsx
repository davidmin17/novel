'use client'

import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'

interface Props {
  currentCategory?: string
  currentSort: string
  currentSearch: string
}

export default function SearchAndFilter({
  currentCategory,
  currentSort,
  currentSearch,
}: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(currentSearch)

  const updateParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams()

    if (currentCategory && key !== 'category') params.set('category', currentCategory)
    if (currentSort && key !== 'sort') params.set('sort', currentSort)
    if (currentSearch && key !== 'search') params.set('search', currentSearch)

    if (value) {
      params.set(key, value)
    }

    router.push(`/novels?${params.toString()}`)
  }, [router, currentCategory, currentSort, currentSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams('search', search)
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      {/* 검색 */}
      <form onSubmit={handleSearch} className="flex-1">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="제목, 작가명으로 검색..."
            className="input-field w-full pl-10 pr-4 py-3 rounded bg-[#333]"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#808080]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </form>

      {/* 카테고리 필터 */}
      <div className="flex gap-2">
        <button
          onClick={() => updateParams('category', '')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            !currentCategory
              ? 'bg-white text-black'
              : 'bg-[#333] text-[#e5e5e5] hover:bg-[#404040]'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => updateParams('category', 'SHORT')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            currentCategory === 'SHORT'
              ? 'bg-white text-black'
              : 'bg-[#333] text-[#e5e5e5] hover:bg-[#404040]'
          }`}
        >
          단편
        </button>
        <button
          onClick={() => updateParams('category', 'LONG')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            currentCategory === 'LONG'
              ? 'bg-white text-black'
              : 'bg-[#333] text-[#e5e5e5] hover:bg-[#404040]'
          }`}
        >
          장편
        </button>
      </div>

      {/* 정렬 */}
      <select
        value={currentSort}
        onChange={(e) => updateParams('sort', e.target.value)}
        className="input-field px-4 py-2 rounded bg-[#333] min-w-[120px]"
      >
        <option value="latest">최신순</option>
        <option value="oldest">오래된순</option>
        <option value="popular">조회순</option>
        <option value="likes">좋아요순</option>
      </select>
    </div>
  )
}
