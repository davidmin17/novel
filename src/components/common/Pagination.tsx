import Link from 'next/link'

interface Props {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export default function Pagination({ currentPage, totalPages, baseUrl }: Props) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showPages = 5

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
    <div className="flex justify-center items-center space-x-1">
      {/* 이전 페이지 */}
      {currentPage > 1 ? (
        <Link
          href={`${baseUrl}page=${currentPage - 1}`}
          className="px-3 py-2 rounded bg-[#333] text-[#e5e5e5] hover:bg-[#404040] text-sm transition-colors"
        >
          ‹
        </Link>
      ) : (
        <span className="px-3 py-2 text-[#808080] text-sm">‹</span>
      )}

      {/* 페이지 번호 */}
      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-3 py-2 text-[#808080]">
              ⋯
            </span>
          )
        }

        const pageNum = page as number
        return (
          <Link
            key={pageNum}
            href={`${baseUrl}page=${pageNum}`}
            className={`px-3 py-2 rounded text-sm transition-colors ${
              currentPage === pageNum
                ? 'bg-white text-black font-medium'
                : 'bg-[#333] text-[#e5e5e5] hover:bg-[#404040]'
            }`}
          >
            {pageNum}
          </Link>
        )
      })}

      {/* 다음 페이지 */}
      {currentPage < totalPages ? (
        <Link
          href={`${baseUrl}page=${currentPage + 1}`}
          className="px-3 py-2 rounded bg-[#333] text-[#e5e5e5] hover:bg-[#404040] text-sm transition-colors"
        >
          ›
        </Link>
      ) : (
        <span className="px-3 py-2 text-[#808080] text-sm">›</span>
      )}
    </div>
  )
}
