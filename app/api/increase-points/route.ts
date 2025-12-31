import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MAX_ADS = 3;

// --- دالة GET لجلب بيانات المستخدم ---
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

// --- دالة POST لمعالجة العمليات (إعلانات، أكواد، شراء) ---
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

    if (user.status === 1) return NextResponse.json({ error: 'محظور' }, { status: 403 })

    // 1. منطق استرداد الكود (النسخة الرقمية الذكية)
    if (body.action === 'redeem_code') {
      const inputCodeNumeric = parseInt(String(body.code).replace(/\s+/g, ''));

      if (isNaN(inputCodeNumeric)) {
        return NextResponse.json({ success: false, message: 'يجب إدخال أرقام فقط' });
      }

      // جلب الأكواد للفحص (Debug Mode)
      const allCodes = await prisma.giftCode.findMany();
      if (allCodes.length === 0) {
        return NextResponse.json({ success: false, message: 'قاعدة الأكواد فارغة' });
      }

      // البحث عن المطابقة
      const gift = allCodes.find(g => Number(g.code) === inputCodeNumeric);

      if (!gift) {
        // رسالة تشخيصية ستظهر لك في التليجرام
        return NextResponse.json({ 
          success: false, 
          message: `الكود ${inputCodeNumeric} غير موجود. الموجود هو: ${allCodes[0].code}` 
        });
      }

      if (gift.currentUses >= gift.maxUses) {
        return NextResponse.json({ success: false, message: 'انتهت صلاحية الكود' });
      }

      const alreadyUsed = await prisma.usedCode.findFirst({
        where: { userId: telegramId, codeId: gift.id }
      });

      if (alreadyUsed) return NextResponse.json({ success: false, message: 'استخدمته مسبقاً' });

      const result = await prisma.$transaction([
        prisma.user.update({ where: { telegramId }, data: { points: { increment: Number(gift.points) } } }),
        prisma.giftCode.update({ where: { id: gift.id }, data: { currentUses: { increment: 1 } } }),
        prisma.usedCode.create({ data: { userId: telegramId, codeId: gift.id } })
      ]);

      return NextResponse.json({ success: true, newPoints: result[0].points, amount: gift.points });
    }

    // 2. منطق مشاهدة الإعلانات
    if (body.action === 'watch_ad') {
      const now = new Date();
      const lastAdDate = user.lastAdDate ? new Date(user.lastAdDate) : new Date(0);
      const isNewDay = now.toDateString() !== lastAdDate.toDateString();
      let currentCount = isNewDay ? 0 : (user.adsCount || 0);

      if (currentCount >= MAX_ADS) return NextResponse.json({ success: false, message: 'انتهت محاولات اليوم' });

      const updated = await prisma.user.update({
        where: { telegramId },
        data: { points: { increment: 1 }, adsCount: currentCount + 1, lastAdDate: now }
      })
      return NextResponse.json({ success: true, newCount: updated.adsCount, points: updated.points })
    }

    // 3. منطق شراء المنتجات
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
    console.error("API Error:", e);
    return NextResponse.json({ success: false, message: "خطأ: " + e.message }, { status: 500 });
  }
}
