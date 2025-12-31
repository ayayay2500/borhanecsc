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

    // تحديث أو إنشاء المستخدم
    const user = await prisma.user.upsert({
      where: { telegramId },
      update: { username: body.username, firstName: body.first_name || body.firstName },
      create: { telegramId, username: body.username, firstName: body.first_name || body.firstName, points: 0, adsCount: 0, status: 0 }
    })

    if (user.status === 1) return NextResponse.json({ error: 'محظور', status: 1 }, { status: 403 })

    // --- منطق استرداد كود الهدايا (جديد) ---
    if (body.action === 'redeem_code') {
      const inputCode = body.code.trim().toUpperCase();

      // 1. البحث عن الكود في قاعدة البيانات
      const gift = await prisma.giftCode.findUnique({
        where: { code: inputCode },
        include: { usedBy: true }
      });

      if (!gift) return NextResponse.json({ success: false, message: 'الكود غير صحيح' });

      // 2. التحقق من صلاحية الكود (العدد الإجمالي للاستخدامات)
      if (gift.currentUses >= gift.maxUses) {
        return NextResponse.json({ success: false, message: 'انتهت صلاحية هذا الكود' });
      }

      // 3. التحقق مما إذا كان المستخدم استخدمه مسبقاً
      const alreadyUsed = await prisma.usedCode.findUnique({
        where: {
          userId_codeId: { userId: telegramId, codeId: gift.id }
        }
      });

      if (alreadyUsed) {
        return NextResponse.json({ success: false, message: 'لقد استخدمت هذا الكود مسبقاً' });
      }

      // 4. تنفيذ العملية (زيادة النقاط وتحديث عداد الكود وتسجيل الاستخدام)
      const [updatedUser] = await prisma.$transaction([
        prisma.user.update({
          where: { telegramId },
          data: { points: { increment: gift.points } }
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
        newPoints: updatedUser.points, 
        amount: gift.points 
      });
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

    // --- منطق شراء المنتجات ---
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
    console.error(e)
    return NextResponse.json({ error: 'خطأ داخلي' }, { status: 500 })
  }
}
