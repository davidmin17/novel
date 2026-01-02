import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// 사용자 권한 변경
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    // 자기 자신의 권한은 변경 불가
    if (session.user.id === id) {
      return NextResponse.json(
        { error: '자신의 권한은 변경할 수 없습니다.' },
        { status: 400 }
      )
    }

    const { role } = await request.json()

    if (!['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: '올바르지 않은 권한입니다.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
    })

    return NextResponse.json({
      message: '권한이 변경되었습니다.',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Update user role error:', error)
    return NextResponse.json(
      { error: '권한 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 사용자 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    // 자기 자신은 삭제 불가
    if (session.user.id === id) {
      return NextResponse.json(
        { error: '자신의 계정은 삭제할 수 없습니다.' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: '사용자가 삭제되었습니다.' })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: '사용자 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

