import Link from 'next/link'

interface Props {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export default function Pagination({ currentPage, totalPages, baseUrl }: Props) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showPages = 5 // 표시할 페이지 수

    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="flex justify-center items-center space-x-2">
      {/* 이전 페이지 */}
      {currentPage > 1 ? (
        <Link
          href={`${baseUrl}page=${currentPage - 1}`}
          className="btn-secondary px-3 py-2 rounded text-sm"
        >
          ← 이전
        </Link>
      ) : (
        <span className="px-3 py-2 text-sepia-muted/50 text-sm">← 이전</span>
      )}

      {/* 페이지 번호 */}
      <div className="flex items-center space-x-1">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-sepia-muted">
                ⋯
              </span>
            )
          }

          const pageNum = page as number
          return (
            <Link
              key={pageNum}
              href={`${baseUrl}page=${pageNum}`}
              className={`px-3 py-2 rounded text-sm transition-all ${
                currentPage === pageNum
                  ? 'bg-gold text-parchment-dark font-medium'
                  : 'btn-secondary hover:bg-gold/10'
              }`}
            >
              {pageNum}
            </Link>
          )
        })}
      </div>

      {/* 다음 페이지 */}
      {currentPage < totalPages ? (
        <Link
          href={`${baseUrl}page=${currentPage + 1}`}
          className="btn-secondary px-3 py-2 rounded text-sm"
        >
          다음 →
        </Link>
      ) : (
        <span className="px-3 py-2 text-sepia-muted/50 text-sm">다음 →</span>
      )}
    </div>
  )
}

