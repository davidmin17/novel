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

    // 클라이언트 유효성 검사
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

      // 성공 시 로그인 페이지로 이동
      router.push('/auth/login?registered=true')
    } catch {
      setError('회원가입 중 오류가 발생했습니다.')
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
            <div className="text-4xl mb-4">✍️</div>
            <h1 className="font-display text-3xl text-gold mb-2">회원가입</h1>
            <p className="text-sepia-muted text-sm">
              묵향서원의 작가가 되어보세요
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 rounded bg-velvet/20 border border-velvet text-sepia text-sm">
              {error}
            </div>
          )}

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="4~20자의 아이디"
                minLength={4}
                maxLength={20}
                required
              />
            </div>

            <div>
              <label
                htmlFor="nickname"
                className="block text-sm text-sepia-muted mb-2"
              >
                닉네임
              </label>
              <input
                type="text"
                id="nickname"
                value={formData.nickname}
                onChange={(e) =>
                  setFormData({ ...formData, nickname: e.target.value })
                }
                className="input-vintage w-full px-4 py-3 rounded"
                placeholder="2~20자의 닉네임"
                minLength={2}
                maxLength={20}
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
                placeholder="최소 6자 이상"
                minLength={6}
                required
              />
            </div>

            <div>
              <label
                htmlFor="passwordConfirm"
                className="block text-sm text-sepia-muted mb-2"
              >
                비밀번호 확인
              </label>
              <input
                type="password"
                id="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={(e) =>
                  setFormData({ ...formData, passwordConfirm: e.target.value })
                }
                className="input-vintage w-full px-4 py-3 rounded"
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 rounded font-medium disabled:opacity-50"
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          {/* 구분선 */}
          <div className="divider-ornate my-8" />

          {/* 로그인 링크 */}
          <p className="text-center text-sepia-muted text-sm">
            이미 회원이신가요?{' '}
            <Link href="/auth/login" className="text-gold hover:text-gold-light">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

