import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MAX_ADS = 7;

// دالة GET لجلب حالة المستخدم وعدد الإعلانات المشاهدة
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const telegramId = Number(searchParams.get('telegramId'))

  if (!telegramId) return NextResponse.json({ error: 'ID مطلوب' }, { status: 400 })

  try {
    const user = await prisma.user.findUnique({ where: { telegramId } })
    if (!user) return NextResponse.json({ error: 'غير موجود' }, { status: 404 })

    const now = new Date()
    const lastAdDate = user.lastAdDate ? new Date(user.lastAdDate) : new Date(0)
    const isNewDay = now.toDateString() !== lastAdDate.toDateString()
    const currentCount = isNewDay ? 0 : (user.adsCount || 0)

    return NextResponse.json({
      success: true,
      count: currentCount,
      points: user.points,
      status: user.status
    })
  } catch (error) {
    return NextResponse.json({ error: 'خطأ خادم' }, { status: 500 })
  }
}

// دالة POST للتعامل مع العمليات (إنشاء، حظر، مشاهدة، شراء)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const telegramId = Number(body.id || body.telegramId)

    if (!telegramId) return NextResponse.json({ error: 'ID غير صالح' }, { status: 400 });

    // 1. جلب أو إنشاء المستخدم
    const user = await prisma.user.upsert({
      where: { telegramId },
      update: {
        username: body.username,
        firstName: body.first_name || body.firstName,
        photoUrl: body.photo_url || body.photoUrl,
      },
      create: {
        telegramId,
        username: body.username,
        firstName: body.first_name || body.firstName,
        photoUrl: body.photo_url || body.photoUrl,
        points: 0,
        adsCount: 0,
        status: 0
      }
    })

    // 2. التحقق من الحظر
    if (user.status === 1) {
      return NextResponse.json({ 
        error: 'حسابك محظور', 
        status: 1, 
        banReason: user.banReason || 'تم حظر حسابك لمخالفة القوانين' 
      }, { status: 403 })
    }

    // 3. عملية مشاهدة الإعلان (زيادة نقاط)
    if (body.action === 'watch_ad') {
      const now = new Date()
      const lastAdDate = user.lastAdDate ? new Date(user.lastAdDate) : new Date(0)
      const isNewDay = now.toDateString() !== lastAdDate.toDateString()
      let currentCount = isNewDay ? 0 : (user.adsCount || 0)

      if (currentCount >= MAX_ADS) {
        return NextResponse.json({ success: false, message: 'انتهت محاولات اليوم' })
      }

      const updated = await prisma.user.update({
        where: { telegramId },
        data: { 
          points: { increment: 1 }, 
          adsCount: currentCount + 1, 
          lastAdDate: now 
        }
      })
      return NextResponse.json({ success: true, newCount: updated.adsCount, points: updated.points })
    }

    // 4. عملية الشراء (خصم نقاط)
    if (body.action === 'purchase_product') {
      const productPrice = Number(body.price)
      
      if (user.points < productPrice) {
        return NextResponse.json({ success: false, message: 'رصيدك غير كافٍ' }, { status: 400 })
      }

      const updated = await prisma.user.update({
        where: { telegramId },
        data: { points: { decrement: productPrice } }
      })

      return NextResponse.json({ 
        success: true, 
        newPoints: updated.points,
        message: 'تم خصم النقاط بنجاح' 
      })
    }

    // الحالة الافتراضية: العودة ببيانات المستخدم
    return NextResponse.json(user)

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'خطأ داخلي في النظام' }, { status: 500 })
  }
}
