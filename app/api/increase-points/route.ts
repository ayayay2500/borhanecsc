import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MAX_ADS = 3;

// جلب بيانات المستخدم
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

    return NextResponse.json({ success: true, count: currentCount, points: user.points })
  } catch (error) {
    return NextResponse.json({ error: 'خطأ خادم' }, { status: 500 })
  }
}

// معالجة الأكواد والإعلانات والشراء
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const telegramId = Number(body.telegramId || body.id)

    const user = await prisma.user.upsert({
      where: { telegramId },
      update: { username: body.username, firstName: body.first_name || body.firstName },
      create: { telegramId, username: body.username, firstName: body.first_name || body.firstName, points: 0, adsCount: 0, status: 0 }
    })

    if (user.status === 1) return NextResponse.json({ error: 'محظور' }, { status: 403 })

    // --- منطق استرداد الكود (النسخة المرنة) ---
    if (body.action === 'redeem_code') {
      const input = String(body.code).replace(/\s+/g, '').toUpperCase();

      // جلب كافة الأكواد وفحصها يدوياً لتجاوز مشاكل النوع (String/Int) والمسافات
      const allCodes = await prisma.giftCode.findMany();
      const gift = allCodes.find(g => String(g.code).replace(/\s+/g, '').toUpperCase() === input);

      if (!gift) {
        return NextResponse.json({ success: false, message: 'كود غير صحيح' });
      }

      if (Number(gift.currentUses) >= Number(gift.maxUses)) {
        return NextResponse.json({ success: false, message: 'انتهت الكمية' });
      }

      const alreadyUsed = await prisma.usedCode.findFirst({
        where: { userId: telegramId, codeId: gift.id }
      });

      if (alreadyUsed) return NextResponse.json({ success: false, message: 'استخدمته سابقاً' });

      const result = await prisma.$transaction([
        prisma.user.update({ where: { telegramId }, data: { points: { increment: Number(gift.points) } } }),
        prisma.giftCode.update({ where: { id: gift.id }, data: { currentUses: { increment: 1 } } }),
        prisma.usedCode.create({ data: { userId: telegramId, codeId: gift.id } })
      ]);

      return NextResponse.json({ success: true, newPoints: result[0].points, amount: gift.points });
    }

    // --- منطق الإعلانات ---
    if (body.action === 'watch_ad') {
      const now = new Date();
      const lastAdDate = user.lastAdDate ? new Date(user.lastAdDate) : new Date(0);
      const isNewDay = now.toDateString() !== lastAdDate.toDateString();
      let currentCount = isNewDay ? 0 : (user.adsCount || 0);

      if (currentCount >= MAX_ADS) return NextResponse.json({ success: false, message: 'انتهت المحاولات' });

      const updated = await prisma.user.update({
        where: { telegramId },
        data: { points: { increment: 1 }, adsCount: currentCount + 1, lastAdDate: now }
      })
      return NextResponse.json({ success: true, points: updated.points })
    }

    // --- منطق الشراء ---
    if (body.action === 'purchase_product') {
      if (user.points < body.price) return NextResponse.json({ success: false, message: 'رصيد غير كافٍ' });
      const updated = await prisma.user.update({
        where: { telegramId },
        data: { points: { decrement: body.price } }
      })
      return NextResponse.json({ success: true, newPoints: updated.points })
    }

    return NextResponse.json(user)
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'خطأ: ' + e.message }, { status: 500 })
  }
}
