import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MAX_ADS = 3;

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

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const telegramId = Number(body.telegramId || body.id)

    const user = await prisma.user.upsert({
      where: { telegramId },
      update: { username: body.username, firstName: body.first_name || body.firstName },
      create: { telegramId, username: body.username, firstName: body.first_name || body.firstName, points: 0, adsCount: 0, status: 0 }
    })

    if (user.status === 1) return NextResponse.json({ error: 'محظور', status: 1 }, { status: 403 })

    if (body.action === 'redeem_code') {
      const inputCode = String(body.code).trim().toUpperCase();

      // جلب جميع الأكواد المتاحة في القاعدة التي يتصل بها التطبيق حالياً
      const allCodes = await prisma.giftCode.findMany();
      
      // إذا كانت القاعدة فارغة تماماً
      if (allCodes.length === 0) {
        return NextResponse.json({ success: false, message: 'قاعدة الأكواد فارغة تماماً في هذا السيرفر' });
      }

      // البحث عن الكود مع تنظيف شامل
      const gift = allCodes.find(g => g.code.replace(/\s+/g, '') === inputCode);

      if (!gift) {
        // رسالة تخبرك بالأكواد الموجودة فعلياً (للتصحيح)
        const available = allCodes.map(c => c.code).join(', ');
        return NextResponse.json({ 
          success: false, 
          message: `الكود ${inputCode} غير موجود. المتاح هو: [${available}]` 
        });
      }

      if (gift.currentUses >= gift.maxUses) return NextResponse.json({ success: false, message: 'انتهت الكمية' });

      const alreadyUsed = await prisma.usedCode.findFirst({
        where: { userId: telegramId, codeId: gift.id }
      });

      if (alreadyUsed) return NextResponse.json({ success: false, message: 'استعملته مسبقاً' });

      try {
        const result = await prisma.$transaction([
          prisma.user.update({ where: { telegramId }, data: { points: { increment: gift.points } } }),
          prisma.giftCode.update({ where: { id: gift.id }, data: { currentUses: { increment: 1 } } }),
          prisma.usedCode.create({ data: { userId: telegramId, codeId: gift.id } })
        ]);

        return NextResponse.json({ success: true, newPoints: result[0].points, amount: gift.points });
      } catch (e) {
        return NextResponse.json({ success: false, message: 'خطأ أثناء التحديث' });
      }
    }

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
      return NextResponse.json({ success: true, newCount: updated.adsCount, points: updated.points })
    }

    if (body.action === 'purchase_product') {
      if (user.points < body.price) return NextResponse.json({ success: false, message: 'رصيد غير كافٍ' }, { status: 400 });
      const updated = await prisma.user.update({
        where: { telegramId },
        data: { points: { decrement: body.price } }
      })
      return NextResponse.json({ success: true, newPoints: updated.points })
    }

    return NextResponse.json(user)
  } catch (e) {
    return NextResponse.json({ error: 'خطأ داخلي' }, { status: 500 })
  }
}
