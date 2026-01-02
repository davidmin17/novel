'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Author {
  id: string
  nickname: string
}

interface Comment {
  id: string
  content: string
  createdAt: Date
  author: Author
  replies?: Comment[]
}

interface Props {
  novelId?: string
  chapterId?: string
  comments: Comment[]
  isLoggedIn: boolean
  currentUserId?: string
  isAdmin?: boolean
}

export default function CommentSection({
  novelId,
  chapterId,
  comments,
  isLoggedIn,
  currentUserId,
  isAdmin,
}: Props) {
  const router = useRouter()
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault()
    if (isSubmitting) return

    const content = parentId ? replyContent : newComment
    if (!content.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          novelId,
          chapterId,
          parentId,
        }),
      })

      if (response.ok) {
        if (parentId) {
          setReplyContent('')
          setReplyTo(null)
        } else {
          setNewComment('')
        }
        router.refresh()
      }
    } catch (error) {
      console.error('Comment error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      })

      if (response.ok) {
        setEditingId(null)
        setEditContent('')
        router.refresh()
      }
    } catch (error) {
      console.error('Edit comment error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Delete comment error:', error)
    }
  }

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const canModify = (authorId: string) => {
    return currentUserId === authorId || isAdmin
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">
        댓글 {comments.length}개
      </h2>

      {/* 댓글 작성 폼 */}
      {isLoggedIn ? (
        <form onSubmit={(e) => handleSubmit(e)} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 작성해주세요..."
            className="input-field w-full px-4 py-3 rounded bg-[#333] min-h-[100px] resize-y mb-3"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="btn-primary px-6 py-2 rounded disabled:opacity-50"
            >
              {isSubmitting ? '등록 중...' : '댓글 등록'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 rounded bg-[#232323] text-center text-[#808080]">
          <a href="/auth/login" className="text-[#e50914] hover:underline">
            로그인
          </a>
          하시면 댓글을 작성할 수 있습니다.
        </div>
      )}

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-[#808080] py-8">
            아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-[#333] pb-4 last:border-0">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white font-medium">
                      {comment.author.nickname}
                    </span>
                    <span className="text-xs text-[#808080]">
                      {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>

                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="input-field w-full px-3 py-2 rounded bg-[#333] min-h-[80px] resize-y text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(comment.id)}
                          disabled={isSubmitting}
                          className="btn-primary px-3 py-1 rounded text-xs"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn-secondary px-3 py-1 rounded text-xs"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-[#e5e5e5] whitespace-pre-wrap">{comment.content}</p>
                      <div className="flex gap-3 mt-2">
                        {isLoggedIn && (
                          <button
                            onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                            className="text-xs text-[#808080] hover:text-white"
                          >
                            답글
                          </button>
                        )}
                        {canModify(comment.author.id) && (
                          <>
                            <button
                              onClick={() => startEdit(comment)}
                              className="text-xs text-[#808080] hover:text-white"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDelete(comment.id)}
                              className="text-xs text-[#808080] hover:text-[#e50914]"
                            >
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 답글 작성 폼 */}
              {replyTo === comment.id && (
                <form
                  onSubmit={(e) => handleSubmit(e, comment.id)}
                  className="mt-4 ml-8 p-4 bg-[#1a1a1a] rounded"
                >
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="답글을 작성해주세요..."
                    className="input-field w-full px-3 py-2 rounded bg-[#333] min-h-[80px] resize-y text-sm mb-2"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      className="btn-secondary px-4 py-1 rounded text-sm"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !replyContent.trim()}
                      className="btn-primary px-4 py-1 rounded text-sm disabled:opacity-50"
                    >
                      답글 등록
                    </button>
                  </div>
                </form>
              )}

              {/* 대댓글 목록 */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 ml-8 space-y-3">
                  {comment.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="p-3 bg-[#1a1a1a] rounded border-l-2 border-[#333]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-medium text-sm">
                          {reply.author.nickname}
                        </span>
                        <span className="text-xs text-[#808080]">
                          {new Date(reply.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>

                      {editingId === reply.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="input-field w-full px-3 py-2 rounded bg-[#333] min-h-[60px] resize-y text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(reply.id)}
                              disabled={isSubmitting}
                              className="btn-primary px-3 py-1 rounded text-xs"
                            >
                              저장
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="btn-secondary px-3 py-1 rounded text-xs"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-[#e5e5e5] text-sm whitespace-pre-wrap">
                            {reply.content}
                          </p>
                          {canModify(reply.author.id) && (
                            <div className="flex gap-3 mt-2">
                              <button
                                onClick={() => startEdit(reply)}
                                className="text-xs text-[#808080] hover:text-white"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDelete(reply.id)}
                                className="text-xs text-[#808080] hover:text-[#e50914]"
                              >
                                삭제
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
