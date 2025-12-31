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

    // التأكد من وجود المستخدم أو إنشائه
    const user = await prisma.user.upsert({
      where: { telegramId },
      update: { username: body.username, firstName: body.first_name || body.firstName },
      create: { telegramId, username: body.username, firstName: body.first_name || body.firstName, points: 0, adsCount: 0, status: 0 }
    })

    if (user.status === 1) return NextResponse.json({ error: 'محظور', status: 1 }, { status: 403 })

    // --- منطق استرداد الكود (تم تحسينه للهاتف) ---
    if (body.action === 'redeem_code') {
      const inputCode = body.code.trim(); // البحث بدون تحويل قسري لحالة الأحرف أولاً

      // البحث عن الكود - جرب البحث كما هو أو بحروف كبيرة
      const gift = await prisma.giftCode.findFirst({
        where: {
          OR: [
            { code: inputCode },
            { code: inputCode.toUpperCase() }
          ]
        }
      });

      if (!gift) {
        return NextResponse.json({ success: false, message: 'كود غير صالح' });
      }

      // التحقق من عدد مرات الاستخدام الكلية
      if (Number(gift.currentUses) >= Number(gift.maxUses)) {
        return NextResponse.json({ success: false, message: 'انتهت صلاحية الكود' });
      }

      // التحقق من استخدام المستخدم لهذا الكود مسبقاً
      const alreadyUsed = await prisma.usedCode.findFirst({
        where: {
          userId: telegramId,
          codeId: gift.id
        }
      });

      if (alreadyUsed) {
        return NextResponse.json({ success: false, message: 'استخدمت الكود مسبقاً' });
      }

      // تنفيذ العملية بنظام Transaction لضمان الأمان
      try {
        const result = await prisma.$transaction([
          prisma.user.update({
            where: { telegramId },
            data: { points: { increment: Number(gift.points) } }
          }),
          prisma.giftCode.update({
            where: { id: gift.id },
            data: { currentUses: { increment: 1 } }
          }),
          prisma.usedCode.create({
            data: { userId: telegramId, codeId: gift.id }
          })
        ]);

        return NextResponse.json({ 
          success: true, 
          newPoints: result[0].points, 
          amount: gift.points 
        });
      } catch (err) {
        console.error("Redeem Transaction Error:", err);
        return NextResponse.json({ success: false, message: 'خطأ في تحديث البيانات' });
      }
    }

    // --- منطق مشاهدة الإعلانات ---
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

    // --- منطق الشراء ---
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
    console.error("API Route Error:", e);
    return NextResponse.json({ error: 'خطأ داخلي' }, { status: 500 })
  }
}
