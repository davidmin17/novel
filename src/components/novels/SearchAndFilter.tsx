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

    // 현재 값들 유지
    if (currentCategory && key !== 'category') params.set('category', currentCategory)
    if (currentSort && key !== 'sort') params.set('sort', currentSort)
    if (currentSearch && key !== 'search') params.set('search', currentSearch)

    // 새 값 설정
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
    <div className="card-vintage p-6 rounded-lg mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        {/* 검색 */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="제목, 소개, 작가명으로 검색..."
              className="input-vintage w-full pl-10 pr-4 py-3 rounded"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sepia-muted">
              🔍
            </span>
          </div>
        </form>

        {/* 카테고리 필터 */}
        <div className="flex gap-2">
          <button
            onClick={() => updateParams('category', '')}
            className={`px-4 py-2 rounded text-sm transition-all ${
              !currentCategory
                ? 'bg-gold text-parchment-dark font-medium'
                : 'btn-secondary'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => updateParams('category', 'SHORT')}
            className={`px-4 py-2 rounded text-sm transition-all ${
              currentCategory === 'SHORT'
                ? 'bg-gold text-parchment-dark font-medium'
                : 'btn-secondary'
            }`}
          >
            단편
          </button>
          <button
            onClick={() => updateParams('category', 'LONG')}
            className={`px-4 py-2 rounded text-sm transition-all ${
              currentCategory === 'LONG'
                ? 'bg-gold text-parchment-dark font-medium'
                : 'btn-secondary'
            }`}
          >
            장편
          </button>
        </div>

        {/* 정렬 */}
        <select
          value={currentSort}
          onChange={(e) => updateParams('sort', e.target.value)}
          className="input-vintage px-4 py-2 rounded min-w-[140px]"
        >
          <option value="latest">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="popular">조회순</option>
          <option value="likes">좋아요순</option>
        </select>
      </div>
    </div>
  )
}
