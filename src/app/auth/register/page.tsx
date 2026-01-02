'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          nickname: formData.nickname,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '회원가입에 실패했습니다.')
        return
      }

      router.push('/auth/login?registered=true')
    } catch {
      setError('회원가입 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-[#141414]">
      <div className="w-full max-w-md">
        <div className="bg-black/75 p-12 rounded">
          {/* 헤더 */}
          <h1 className="text-3xl font-bold text-white mb-8">회원가입</h1>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-4 rounded bg-[#e87c03]/20 border border-[#e87c03] text-[#e87c03] text-sm">
              {error}
            </div>
          )}

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="input-field w-full px-4 py-4 rounded bg-[#333] text-white"
                placeholder="아이디 (4~20자)"
                minLength={4}
                maxLength={20}
                required
              />
            </div>

            <div>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) =>
                  setFormData({ ...formData, nickname: e.target.value })
                }
                className="input-field w-full px-4 py-4 rounded bg-[#333] text-white"
                placeholder="닉네임 (2~20자)"
                minLength={2}
                maxLength={20}
                required
              />
            </div>

            <div>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="input-field w-full px-4 py-4 rounded bg-[#333] text-white"
                placeholder="비밀번호 (6자 이상)"
                minLength={6}
                required
              />
            </div>

            <div>
              <input
                type="password"
                value={formData.passwordConfirm}
                onChange={(e) =>
                  setFormData({ ...formData, passwordConfirm: e.target.value })
                }
                className="input-field w-full px-4 py-4 rounded bg-[#333] text-white"
                placeholder="비밀번호 확인"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 rounded font-semibold text-base disabled:opacity-50 mt-6"
            >
              {isLoading ? '가입 중...' : '가입하기'}
            </button>
          </form>

          {/* 로그인 링크 */}
          <p className="text-[#b3b3b3] mt-8">
            이미 회원이신가요?{' '}
            <Link href="/auth/login" className="text-white hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
