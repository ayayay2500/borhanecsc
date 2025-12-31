import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MAX_ADS = 7;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const telegramId = Number(searchParams.get('telegramId'))

  if (!telegramId) {
    return NextResponse.json({ error: 'Telegram ID مطلوب' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { telegramId } })

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    const now = new Date()
    const lastAdDate = user.lastAdDate ? new Date(user.lastAdDate) : new Date(0)
    
    // التحقق هل نحن في يوم جديد (مقارنة اليوم والشهر والسنة)
    const isNewDay = now.toDateString() !== lastAdDate.toDateString()
    const currentCount = isNewDay ? 0 : (user.adsCount || 0)

    return NextResponse.json({
      success: true,
      canClaim: currentCount < MAX_ADS,
      count: currentCount,
      maxAds: MAX_ADS
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const { telegramId } = await req.json()

  if (!telegramId) {
    return NextResponse.json({ error: 'Telegram ID مطلوب' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { telegramId: Number(telegramId) } })

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    const now = new Date()
    const lastAdDate = user.lastAdDate ? new Date(user.lastAdDate) : new Date(0)
    const isNewDay = now.toDateString() !== lastAdDate.toDateString()

    let currentCount = isNewDay ? 0 : (user.adsCount || 0)

    if (currentCount >= MAX_ADS) {
      return NextResponse.json({
        success: false,
        message: 'لقد استهلكت جميع محاولاتك لليوم (7/7)',
      })
    }

    const updatedUser = await prisma.user.update({
      where: { telegramId: Number(telegramId) },
      data: {
        points: { increment: 1 },
        adsCount: currentCount + 1,
        lastAdDate: now
      }
    })

    return NextResponse.json({
      success: true,
      points: updatedUser.points,
      newCount: updatedUser.adsCount,
      maxAds: MAX_ADS
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
