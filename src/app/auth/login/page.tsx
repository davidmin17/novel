'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="card-vintage p-8 rounded-lg">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🔐</div>
            <h1 className="font-display text-3xl text-gold mb-2">로그인</h1>
            <p className="text-sepia-muted text-sm">
              묵향서원에 오신 것을 환영합니다
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 rounded bg-velvet/20 border border-velvet text-sepia text-sm">
              {error}
            </div>
          )}

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm text-sepia-muted mb-2"
              >
                아이디
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="input-vintage w-full px-4 py-3 rounded"
                placeholder="아이디를 입력하세요"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm text-sepia-muted mb-2"
              >
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="input-vintage w-full px-4 py-3 rounded"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 rounded font-medium disabled:opacity-50"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* 구분선 */}
          <div className="divider-ornate my-8" />

          {/* 회원가입 링크 */}
          <p className="text-center text-sepia-muted text-sm">
            아직 회원이 아니신가요?{' '}
            <Link href="/auth/register" className="text-gold hover:text-gold-light">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

