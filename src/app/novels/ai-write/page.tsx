'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// 카테고리 옵션 정의 (콘텐츠 필터 안전)
const GENRE_OPTIONS = [
  { value: 'romance', label: '로맨스', emoji: '💕' },
  { value: 'fantasy', label: '판타지', emoji: '🧙' },
  { value: 'sf', label: 'SF', emoji: '🚀' },
  { value: 'mystery', label: '추리', emoji: '🔍' },
  { value: 'healing', label: '힐링', emoji: '🌿' },
  { value: 'martial_arts', label: '무협', emoji: '⚔️' },
  { value: 'adventure', label: '모험', emoji: '🗺️' },
  { value: 'modern', label: '현대물', emoji: '🏙️' },
  { value: 'historical', label: '사극', emoji: '🏯' },
]

const ERA_OPTIONS = [
  { value: 'modern', label: '현대', emoji: '🌆' },
  { value: 'joseon', label: '조선시대', emoji: '🎎' },
  { value: 'medieval', label: '중세 유럽', emoji: '🏰' },
  { value: 'future', label: '미래', emoji: '🌌' },
  { value: 'ancient', label: '고대', emoji: '🏛️' },
  { value: 'other_world', label: '이세계', emoji: '✨' },
]

const PROTAGONIST_GENDER_OPTIONS = [
  { value: 'male', label: '남성', emoji: '👨' },
  { value: 'female', label: '여성', emoji: '👩' },
  { value: 'other', label: '기타', emoji: '🧑' },
]

const PROTAGONIST_PERSONALITY_OPTIONS = [
  { value: 'cold', label: '냉철한', emoji: '❄️' },
  { value: 'warm', label: '따뜻한', emoji: '☀️' },
  { value: 'humorous', label: '유머러스', emoji: '😄' },
  { value: 'mysterious', label: '신비로운', emoji: '🌙' },
  { value: 'righteous', label: '정의로운', emoji: '⚖️' },
  { value: 'cunning', label: '영리한', emoji: '🦊' },
]

const MOOD_OPTIONS = [
  { value: 'bright', label: '밝음', emoji: '🌞' },
  { value: 'calm', label: '잔잔함', emoji: '🌊' },
  { value: 'exciting', label: '흥미진진', emoji: '✨' },
  { value: 'touching', label: '감동적', emoji: '🥹' },
  { value: 'comic', label: '코믹', emoji: '🤣' },
]

const CONFLICT_OPTIONS = [
  { value: 'love', label: '사랑', emoji: '💗' },
  { value: 'friendship', label: '우정', emoji: '🤝' },
  { value: 'adventure', label: '모험', emoji: '🗺️' },
  { value: 'dream', label: '꿈/목표', emoji: '⭐' },
  { value: 'growth', label: '성장', emoji: '🌱' },
  { value: 'mystery', label: '미스터리', emoji: '🔮' },
]

const PACING_OPTIONS = [
  { value: 'fast', label: '빠른 전개', emoji: '⚡' },
  { value: 'slow', label: '느린 전개', emoji: '🐢' },
  { value: 'twist', label: '반전 있음', emoji: '🔄' },
]

const ENDING_OPTIONS = [
  { value: 'happy', label: '해피엔딩', emoji: '🎉' },
  { value: 'hopeful', label: '희망적', emoji: '🌈' },
  { value: 'open', label: '열린 결말', emoji: '❓' },
  { value: 'surprise', label: '반전', emoji: '😲' },
]

const SETTING_OPTIONS = [
  { value: 'city', label: '도시', emoji: '🏙️' },
  { value: 'countryside', label: '시골', emoji: '🌾' },
  { value: 'school', label: '학교', emoji: '🏫' },
  { value: 'palace', label: '궁궐', emoji: '👑' },
  { value: 'other_world', label: '이세계', emoji: '🌀' },
  { value: 'space', label: '우주', emoji: '🪐' },
]

const POV_OPTIONS = [
  { value: 'first', label: '1인칭', emoji: '👁️' },
  { value: 'third', label: '3인칭', emoji: '👥' },
]

interface SelectionState {
  genre: string
  era: string
  protagonistGender: string
  protagonistPersonality: string
  mood: string
  conflict: string
  pacing: string
  ending: string
  setting: string
  pov: string
  additionalRequest: string
}

export default function AIWritePage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [step, setStep] = useState(1)
  const [selections, setSelections] = useState<SelectionState>({
    genre: '',
    era: '',
    protagonistGender: '',
    protagonistPersonality: '',
    mood: '',
    conflict: '',
    pacing: '',
    ending: '',
    setting: '',
    pov: '',
    additionalRequest: '',
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  // 로그인 체크
  if (status === 'loading') {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-white">로딩 중...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-[#e5e5e5] mb-4">로그인이 필요한 서비스입니다.</p>
          <Link href="/auth/login" className="btn-primary px-6 py-2 rounded">
            로그인하기
          </Link>
        </div>
      </div>
    )
  }

  const handleSelect = (key: keyof SelectionState, value: string) => {
    setSelections((prev) => ({ ...prev, [key]: value }))
  }

  const canProceedStep1 = selections.genre && selections.era && selections.setting
  const canProceedStep2 = selections.protagonistGender && selections.protagonistPersonality && selections.mood
  const canProceedStep3 = selections.conflict && selections.pacing && selections.ending && selections.pov

  const handleGenerate = async () => {
    setError('')
    setIsGenerating(true)

    try {
      const response = await fetch('/api/novels/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selections),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'AI 소설 생성에 실패했습니다.')
        return
      }

      // 생성된 소설 페이지로 이동
      router.push(`/novels/${data.novel.id}`)
    } catch {
      setError('소설 생성 중 오류가 발생했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  const renderOptionButtons = (
    options: { value: string; label: string; emoji: string }[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSelect(option.value)}
          className={`px-4 py-2 rounded-lg transition-all text-sm ${
            selectedValue === option.value
              ? 'bg-[#e50914] text-white font-medium shadow-lg shadow-[#e50914]/30'
              : 'bg-[#333] text-[#e5e5e5] hover:bg-[#404040]'
          }`}
        >
          {option.emoji} {option.label}
        </button>
      ))}
    </div>
  )

  const renderProgressBar = () => (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              step >= s
                ? 'bg-[#e50914] text-white'
                : 'bg-[#333] text-[#808080]'
            }`}
          >
            {s}
          </div>
          {s < 4 && (
            <div
              className={`w-12 h-1 mx-1 transition-all ${
                step > s ? 'bg-[#e50914]' : 'bg-[#333]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#232323] p-8 rounded-xl border border-[#333]">
          {/* 헤더 */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <span className="text-3xl">🤖</span> AI 소설 생성
            </h1>
            <p className="text-[#808080] text-sm">
              원하는 옵션을 선택하면 AI가 단편 소설을 작성해드립니다
            </p>
          </div>

          {/* 진행 바 */}
          <div className="flex justify-center">
            {renderProgressBar()}
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 rounded bg-[#e50914]/20 border border-[#e50914] text-[#e5e5e5] text-sm">
              {error}
            </div>
          )}

          {/* Step 1: 배경 설정 */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                📍 Step 1: 배경 설정
              </h2>

              <div>
                <label className="block text-sm text-[#b3b3b3] mb-3">장르 *</label>
                {renderOptionButtons(GENRE_OPTIONS, selections.genre, (v) =>
                  handleSelect('genre', v)
                )}
              </div>

              <div>
                <label className="block text-sm text-[#b3b3b3] mb-3">시대배경 *</label>
                {renderOptionButtons(ERA_OPTIONS, selections.era, (v) =>
                  handleSelect('era', v)
                )}
              </div>

              <div>
                <label className="block text-sm text-[#b3b3b3] mb-3">배경 장소 *</label>
                {renderOptionButtons(SETTING_OPTIONS, selections.setting, (v) =>
                  handleSelect('setting', v)
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="btn-primary px-6 py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음 단계 →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: 캐릭터 & 분위기 */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                👤 Step 2: 캐릭터 & 분위기
              </h2>

              <div>
                <label className="block text-sm text-[#b3b3b3] mb-3">주인공 성별 *</label>
                {renderOptionButtons(
                  PROTAGONIST_GENDER_OPTIONS,
                  selections.protagonistGender,
                  (v) => handleSelect('protagonistGender', v)
                )}
              </div>

              <div>
                <label className="block text-sm text-[#b3b3b3] mb-3">주인공 성격 *</label>
                {renderOptionButtons(
                  PROTAGONIST_PERSONALITY_OPTIONS,
                  selections.protagonistPersonality,
                  (v) => handleSelect('protagonistPersonality', v)
                )}
              </div>

              <div>
                <label className="block text-sm text-[#b3b3b3] mb-3">분위기/톤 *</label>
                {renderOptionButtons(MOOD_OPTIONS, selections.mood, (v) =>
                  handleSelect('mood', v)
                )}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary px-6 py-3 rounded"
                >
                  ← 이전
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  className="btn-primary px-6 py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음 단계 →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 스토리 구조 */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                📖 Step 3: 스토리 구조
              </h2>

              <div>
                <label className="block text-sm text-[#b3b3b3] mb-3">사건/갈등 *</label>
                {renderOptionButtons(CONFLICT_OPTIONS, selections.conflict, (v) =>
                  handleSelect('conflict', v)
                )}
              </div>

              <div>
                <label className="block text-sm text-[#b3b3b3] mb-3">전개 방식 *</label>
                {renderOptionButtons(PACING_OPTIONS, selections.pacing, (v) =>
                  handleSelect('pacing', v)
                )}
              </div>

              <div>
                <label className="block text-sm text-[#b3b3b3] mb-3">결말 유형 *</label>
                {renderOptionButtons(ENDING_OPTIONS, selections.ending, (v) =>
                  handleSelect('ending', v)
                )}
              </div>

              <div>
                <label className="block text-sm text-[#b3b3b3] mb-3">서술 시점 *</label>
                {renderOptionButtons(POV_OPTIONS, selections.pov, (v) =>
                  handleSelect('pov', v)
                )}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="btn-secondary px-6 py-3 rounded"
                >
                  ← 이전
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!canProceedStep3}
                  className="btn-primary px-6 py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음 단계 →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: 추가 요청 & 생성 */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                ✨ Step 4: 마무리
              </h2>

              {/* 선택 요약 */}
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333]">
                <h3 className="text-sm font-medium text-[#b3b3b3] mb-3">선택 요약</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-[#808080]">장르: <span className="text-white">{GENRE_OPTIONS.find(o => o.value === selections.genre)?.label}</span></div>
                  <div className="text-[#808080]">시대: <span className="text-white">{ERA_OPTIONS.find(o => o.value === selections.era)?.label}</span></div>
                  <div className="text-[#808080]">장소: <span className="text-white">{SETTING_OPTIONS.find(o => o.value === selections.setting)?.label}</span></div>
                  <div className="text-[#808080]">주인공: <span className="text-white">{PROTAGONIST_GENDER_OPTIONS.find(o => o.value === selections.protagonistGender)?.label}</span></div>
                  <div className="text-[#808080]">성격: <span className="text-white">{PROTAGONIST_PERSONALITY_OPTIONS.find(o => o.value === selections.protagonistPersonality)?.label}</span></div>
                  <div className="text-[#808080]">분위기: <span className="text-white">{MOOD_OPTIONS.find(o => o.value === selections.mood)?.label}</span></div>
                  <div className="text-[#808080]">갈등: <span className="text-white">{CONFLICT_OPTIONS.find(o => o.value === selections.conflict)?.label}</span></div>
                  <div className="text-[#808080]">전개: <span className="text-white">{PACING_OPTIONS.find(o => o.value === selections.pacing)?.label}</span></div>
                  <div className="text-[#808080]">결말: <span className="text-white">{ENDING_OPTIONS.find(o => o.value === selections.ending)?.label}</span></div>
                  <div className="text-[#808080]">시점: <span className="text-white">{POV_OPTIONS.find(o => o.value === selections.pov)?.label}</span></div>
                </div>
              </div>

              {/* 추가 요청사항 */}
              <div>
                <label className="block text-sm text-[#b3b3b3] mb-2">
                  추가 요청사항 (선택, 최대 300자)
                </label>
                <textarea
                  value={selections.additionalRequest}
                  onChange={(e) => {
                    if (e.target.value.length <= 300) {
                      handleSelect('additionalRequest', e.target.value)
                    }
                  }}
                  className="input-field w-full px-4 py-3 rounded bg-[#333] min-h-[120px] resize-y"
                  placeholder="원하는 키워드, 특정 소재, 스토리 방향 등을 자유롭게 적어주세요.&#10;예: '마법 반지를 둘러싼 이야기', '주인공이 기억을 잃은 상태에서 시작'"
                />
                <p className="text-xs text-[#808080] mt-1 text-right">
                  {selections.additionalRequest.length}/300
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(3)}
                  className="btn-secondary px-6 py-3 rounded"
                >
                  ← 이전
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="btn-primary px-8 py-3 rounded disabled:opacity-50 flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      AI가 소설을 작성 중...
                    </>
                  ) : (
                    <>🚀 소설 생성하기</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 안내 문구 */}
        <div className="mt-6 text-center text-[#808080] text-sm">
          <p>AI가 생성한 소설은 바로 게시되며, 게시 후 수정이 가능합니다.</p>
          <p className="mt-1">약 5분 분량의 단편 소설이 생성됩니다.</p>
        </div>
      </div>
    </div>
  )
}

