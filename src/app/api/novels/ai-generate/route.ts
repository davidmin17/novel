import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

// 옵션 라벨 매핑 (콘텐츠 필터 안전)
const LABELS = {
  genre: {
    romance: '로맨스',
    fantasy: '판타지',
    sf: 'SF',
    mystery: '추리',
    healing: '힐링',
    martial_arts: '무협',
    adventure: '모험',
    modern: '현대물',
    historical: '사극',
  },
  era: {
    modern: '현대',
    joseon: '조선시대',
    medieval: '중세 유럽',
    future: '미래',
    ancient: '고대',
    other_world: '이세계',
  },
  protagonistGender: {
    male: '남성',
    female: '여성',
    other: '성별 불특정',
  },
  protagonistPersonality: {
    cold: '냉철하고 이성적인',
    warm: '따뜻하고 다정한',
    humorous: '유머러스하고 밝은',
    mysterious: '신비롭고 비밀스러운',
    righteous: '정의롭고 곧은',
    cunning: '영리하고 재치있는',
  },
  mood: {
    bright: '밝고 희망찬',
    calm: '잔잔하고 평화로운',
    exciting: '흥미진진한',
    touching: '감동적인',
    comic: '코믹하고 유쾌한',
  },
  conflict: {
    love: '사랑',
    friendship: '우정',
    adventure: '모험',
    dream: '꿈과 목표 추구',
    growth: '성장',
    mystery: '미스터리 해결',
  },
  pacing: {
    fast: '빠른 전개',
    slow: '느린 전개로 감정선 중심',
    twist: '반전이 있는',
  },
  ending: {
    happy: '해피엔딩',
    hopeful: '희망적인 결말',
    open: '열린 결말',
    surprise: '반전 결말',
  },
  setting: {
    city: '도시',
    countryside: '시골',
    school: '학교',
    palace: '궁궐',
    other_world: '이세계',
    space: '우주',
  },
  pov: {
    first: '1인칭 시점',
    third: '3인칭 시점',
  },
} as const

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

function getLabel(category: keyof typeof LABELS, value: string): string {
  const categoryLabels = LABELS[category] as Record<string, string>
  return categoryLabels[value] || value
}

function buildPrompt(selections: SelectionState): string {
  const genre = getLabel('genre', selections.genre)
  const era = getLabel('era', selections.era)
  const setting = getLabel('setting', selections.setting)
  const protagonistGender = getLabel('protagonistGender', selections.protagonistGender)
  const protagonistPersonality = getLabel('protagonistPersonality', selections.protagonistPersonality)
  const mood = getLabel('mood', selections.mood)
  const conflict = getLabel('conflict', selections.conflict)
  const pacing = getLabel('pacing', selections.pacing)
  const ending = getLabel('ending', selections.ending)
  const pov = getLabel('pov', selections.pov)

  let prompt = `당신은 한국의 베스트셀러 소설가입니다. 아래 조건에 맞는 창작 단편 소설을 작성해주세요.
이것은 순수 창작 문학 작품이며, 교육적이고 예술적인 목적으로 작성됩니다.

## 소설 조건
- 장르: ${genre}
- 시대배경: ${era}
- 배경 장소: ${setting}
- 주인공: ${protagonistGender}, ${protagonistPersonality} 성격
- 분위기: ${mood}
- 주요 테마/사건: ${conflict}
- 전개 방식: ${pacing}
- 결말: ${ending}
- 서술 시점: ${pov}

## 작성 규칙
1. 약 2500~3000자 분량의 완결된 단편 소설을 작성하세요.
2. 독자가 5분 내외로 읽을 수 있는 분량입니다.
3. 한국어로 작성하며, 자연스럽고 몰입감 있는 문체를 사용하세요.
4. 소설의 제목도 함께 제안해주세요.
5. 제목과 본문을 구분하여 작성하세요.
6. 폭력적이거나 선정적인 내용은 피하고, 문학적으로 표현해주세요.

## 출력 형식
제목: [소설 제목]

[소설 본문]`

  if (selections.additionalRequest) {
    prompt += `

## 추가 요청사항
${selections.additionalRequest}`
  }

  return prompt
}

function parseResponse(content: string): { title: string; body: string; description: string } {
  const lines = content.split('\n')
  let title = ''
  let bodyStartIndex = 0

  // 제목 찾기
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.startsWith('제목:') || line.startsWith('제목 :')) {
      title = line.replace(/^제목\s*:\s*/, '').trim()
      bodyStartIndex = i + 1
      break
    }
  }

  // 제목이 없으면 첫 줄을 제목으로 사용
  if (!title && lines.length > 0) {
    title = lines[0].replace(/^#\s*/, '').trim()
    bodyStartIndex = 1
  }

  // 본문 추출 (빈 줄 건너뛰기)
  while (bodyStartIndex < lines.length && lines[bodyStartIndex].trim() === '') {
    bodyStartIndex++
  }

  const body = lines.slice(bodyStartIndex).join('\n').trim()

  // 소개글 생성 (본문 첫 100자)
  const description = body.substring(0, 100).replace(/\n/g, ' ') + '...'

  return { title, body, description }
}

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // API 키 확인 (GitHub Models 또는 OpenAI)
    const apiKey = process.env.GITHUB_TOKEN || process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 키가 설정되지 않았습니다. (GITHUB_TOKEN 또는 OPENAI_API_KEY)' },
        { status: 500 }
      )
    }

    // GitHub Models 사용 여부 확인
    const useGitHubModels = !!process.env.GITHUB_TOKEN

    // OpenAI 클라이언트 초기화 (런타임에만)
    const openai = new OpenAI({
      apiKey,
      baseURL: useGitHubModels ? 'https://models.inference.ai.azure.com' : undefined,
    })

    // 요청 데이터 파싱
    const selections: SelectionState = await request.json()

    // 필수 필드 검증
    const requiredFields = [
      'genre',
      'era',
      'setting',
      'protagonistGender',
      'protagonistPersonality',
      'mood',
      'conflict',
      'pacing',
      'ending',
      'pov',
    ]

    for (const field of requiredFields) {
      if (!selections[field as keyof SelectionState]) {
        return NextResponse.json(
          { error: `${field} 필드가 필요합니다.` },
          { status: 400 }
        )
      }
    }

    // 프롬프트 생성
    const prompt = buildPrompt(selections)

    // API 호출 (GitHub Models: gpt-4o-mini, OpenAI: gpt-4o-mini)
    const modelName = 'gpt-4o-mini'

    console.log('AI 소설 생성 시작:', { useGitHubModels, modelName })

    let completion
    try {
      completion = await openai.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: 'system',
            content:
              '당신은 한국의 유명 소설가입니다. 독자들의 마음을 사로잡는 몰입감 있는 이야기를 작성합니다.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 4000,
        temperature: 0.8,
      })
    } catch (apiError) {
      console.error('OpenAI/GitHub API 호출 오류:', apiError)
      const errorMessage = apiError instanceof Error ? apiError.message : 'API 호출 실패'
      return NextResponse.json(
        { error: `AI API 오류: ${errorMessage}` },
        { status: 500 }
      )
    }

    const choice = completion.choices[0]
    console.log('AI 응답 수신:', {
      finishReason: choice?.finish_reason,
      contentPreview: choice?.message?.content?.substring(0, 100),
    })

    // 콘텐츠 필터에 의해 차단된 경우
    if (choice?.finish_reason === 'content_filter') {
      console.error('콘텐츠 필터에 의해 차단됨')
      return NextResponse.json(
        { error: '선택한 옵션 조합이 콘텐츠 정책에 맞지 않습니다. 다른 장르나 분위기를 선택해주세요.' },
        { status: 400 }
      )
    }

    const generatedContent = choice?.message?.content
    if (!generatedContent) {
      console.error('AI 응답 내용 없음:', completion)
      return NextResponse.json(
        { error: 'AI 응답을 받지 못했습니다. 다시 시도해주세요.' },
        { status: 500 }
      )
    }

    // 응답 파싱
    const { title, body, description } = parseResponse(generatedContent)

    // 소설 저장
    const novel = await prisma.novel.create({
      data: {
        title: title || 'AI가 작성한 소설',
        description,
        content: body,
        category: 'SHORT',
        authorId: session.user.id,
        isPublished: true,
      },
    })

    return NextResponse.json({
      success: true,
      novel: {
        id: novel.id,
        title: novel.title,
      },
    })
  } catch (error) {
    console.error('AI 소설 생성 오류:', error)
    return NextResponse.json(
      { error: '소설 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

