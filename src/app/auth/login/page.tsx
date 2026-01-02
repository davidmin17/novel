'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError('로그인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-black/75 p-12 rounded">
        {/* 헤더 */}
        <h1 className="text-3xl font-bold text-white mb-8">로그인</h1>

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
              placeholder="아이디"
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
              placeholder="비밀번호"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 rounded font-semibold text-base disabled:opacity-50 mt-6"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 회원가입 링크 */}
        <p className="text-[#b3b3b3] mt-8">
          처음이신가요?{' '}
          <Link href="/auth/register" className="text-white hover:underline">
            지금 가입하세요.
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-[#141414]">
      <Suspense fallback={
        <div className="text-white">로딩 중...</div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
