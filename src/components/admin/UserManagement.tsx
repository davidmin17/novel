'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  username: string
  nickname: string
  role: string
  createdAt: Date
  _count: {
    novels: number
    comments: number
  }
}

interface Props {
  users: User[]
  currentPage: number
  totalPages: number
  currentSearch: string
}

export default function UserManagement({
  users,
  currentPage,
  totalPages,
  currentSearch,
}: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(currentSearch)
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) {
      params.set('search', search)
    }
    router.push(`/admin/users?${params.toString()}`)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`정말로 이 사용자의 권한을 ${newRole === 'ADMIN' ? '관리자' : '일반 회원'}으로 변경하시겠습니까?`)) {
      return
    }

    setIsLoading(userId)

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || '권한 변경에 실패했습니다.')
      }
    } catch {
      alert('권한 변경 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div>
      {/* 검색 */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="아이디 또는 닉네임으로 검색..."
            className="input-field flex-1 px-4 py-3 rounded bg-[#333]"
          />
          <button type="submit" className="btn-primary px-6 py-3 rounded">
            검색
          </button>
        </div>
      </form>

      {/* 사용자 목록 */}
      <div className="bg-[#232323] rounded overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-[#333]">
              <th className="text-left p-4 text-[#808080] font-medium text-sm">아이디</th>
              <th className="text-left p-4 text-[#808080] font-medium text-sm">닉네임</th>
              <th className="text-left p-4 text-[#808080] font-medium text-sm">권한</th>
              <th className="text-left p-4 text-[#808080] font-medium text-sm">작품</th>
              <th className="text-left p-4 text-[#808080] font-medium text-sm">댓글</th>
              <th className="text-left p-4 text-[#808080] font-medium text-sm">가입일</th>
              <th className="text-left p-4 text-[#808080] font-medium text-sm">관리</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-[#333]/50 hover:bg-[#2a2a2a]"
              >
                <td className="p-4 text-[#e5e5e5]">{user.username}</td>
                <td className="p-4 text-[#e5e5e5]">{user.nickname}</td>
                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      user.role === 'ADMIN'
                        ? 'bg-[#e50914] text-white'
                        : 'bg-[#333] text-[#808080]'
                    }`}
                  >
                    {user.role === 'ADMIN' ? '관리자' : '회원'}
                  </span>
                </td>
                <td className="p-4 text-[#808080]">{user._count.novels}</td>
                <td className="p-4 text-[#808080]">{user._count.comments}</td>
                <td className="p-4 text-[#808080] text-sm">
                  {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                </td>
                <td className="p-4">
                  <button
                    onClick={() =>
                      handleRoleChange(
                        user.id,
                        user.role === 'ADMIN' ? 'USER' : 'ADMIN'
                      )
                    }
                    disabled={isLoading === user.id}
                    className="text-xs text-[#e50914] hover:text-[#f40612] disabled:opacity-50"
                  >
                    {isLoading === user.id
                      ? '처리중...'
                      : user.role === 'ADMIN'
                      ? '권한 해제'
                      : '관리자 지정'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/admin/users?page=${page}${currentSearch ? `&search=${currentSearch}` : ''}`}
              className={`px-3 py-2 rounded text-sm ${
                currentPage === page
                  ? 'bg-white text-black'
                  : 'bg-[#333] text-[#e5e5e5] hover:bg-[#404040]'
              }`}
            >
              {page}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
