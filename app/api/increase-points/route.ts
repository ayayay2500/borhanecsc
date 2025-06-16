import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const telegramId = Number(searchParams.get('telegramId'))

  if (!telegramId) {
    return NextResponse.json(
      { error: 'Telegram ID مطلوب' },
      { status: 400 }
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    const now = new Date()
    const twentyFourHours = 24 * 60 * 60 * 1000
    const canClaim = !user.updatedAt || 
      (now.getTime() - new Date(user.updatedAt).getTime()) >= twentyFourHours

    return NextResponse.json({
      success: true,
      canClaim,
      nextClaimTime: canClaim ? null : new Date(new Date(user.updatedAt).getTime() + twentyFourHours).toISOString()
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const { telegramId } = await req.json()

  if (!telegramId) {
    return NextResponse.json(
      { error: 'Telegram ID مطلوب' },
      { status: 400 }
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: Number(telegramId) }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    const now = new Date()
    const twentyFourHours = 24 * 60 * 60 * 1000

    if (user.updatedAt && (now.getTime() - new Date(user.updatedAt).getTime()) < twentyFourHours) {
      return NextResponse.json({
        success: false,
        message: 'لقد حصلت بالفعل على جائزتك اليومية',
        nextClaimTime: new Date(new Date(user.updatedAt).getTime() + twentyFourHours).toISOString()
      })
    }

    const updatedUser = await prisma.user.update({
      where: { telegramId: Number(telegramId) },
      data: {
        points: { increment: 1 },
        updatedAt: now.toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      points: updatedUser.points,
      nextClaimTime: new Date(now.getTime() + twentyFourHours).toISOString()
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}
