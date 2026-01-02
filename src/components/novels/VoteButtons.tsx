'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  novelId?: string
  chapterId?: string
  likeCount: number
  dislikeCount: number
  userVote?: boolean
  isLoggedIn: boolean
}

export default function VoteButtons({
  novelId,
  chapterId,
  likeCount: initialLikeCount,
  dislikeCount: initialDislikeCount,
  userVote: initialUserVote,
  isLoggedIn,
}: Props) {
  const router = useRouter()
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [dislikeCount, setDislikeCount] = useState(initialDislikeCount)
  const [userVote, setUserVote] = useState(initialUserVote)
  const [isLoading, setIsLoading] = useState(false)

  const handleVote = async (isLike: boolean) => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.')
      router.push('/auth/login')
      return
    }

    if (isLoading) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          novelId,
          chapterId,
          isLike,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.action === 'created') {
          if (isLike) {
            setLikeCount((prev) => prev + 1)
          } else {
            setDislikeCount((prev) => prev + 1)
          }
          setUserVote(isLike)
        } else if (data.action === 'removed') {
          if (userVote === true) {
            setLikeCount((prev) => prev - 1)
          } else if (userVote === false) {
            setDislikeCount((prev) => prev - 1)
          }
          setUserVote(undefined)
        } else if (data.action === 'changed') {
          if (isLike) {
            setLikeCount((prev) => prev + 1)
            setDislikeCount((prev) => prev - 1)
          } else {
            setLikeCount((prev) => prev - 1)
            setDislikeCount((prev) => prev + 1)
          }
          setUserVote(isLike)
        }
      }
    } catch (error) {
      console.error('Vote error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center gap-4">
      {/* 좋아요 버튼 */}
      <button
        onClick={() => handleVote(true)}
        disabled={isLoading}
        className={`flex items-center gap-2 px-6 py-3 rounded transition-all ${
          userVote === true
            ? 'bg-white text-black'
            : 'bg-[#333] text-[#e5e5e5] hover:bg-[#404040]'
        } disabled:opacity-50`}
      >
        <span className="text-lg">👍</span>
        <span className="font-medium">{likeCount}</span>
      </button>

      {/* 싫어요 버튼 */}
      <button
        onClick={() => handleVote(false)}
        disabled={isLoading}
        className={`flex items-center gap-2 px-6 py-3 rounded transition-all ${
          userVote === false
            ? 'bg-white text-black'
            : 'bg-[#333] text-[#e5e5e5] hover:bg-[#404040]'
        } disabled:opacity-50`}
      >
        <span className="text-lg">👎</span>
        <span className="font-medium">{dislikeCount}</span>
      </button>
    </div>
  )
}
