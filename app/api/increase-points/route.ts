export async function POST(req: Request) {
  const body = await req.json()
  const telegramId = Number(body.id || body.telegramId)

  try {
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
        status: 0 // التأكد من أنه غير محظور عند الإنشاء
      }
    })

    // 🛑 الجزء المسؤول عن الحظر (أضف هذا الشرط هنا)
    if (user.status === 1) {
      return NextResponse.json({ 
        error: 'حسابك محظور', 
        status: 1, 
        banReason: user.banReason || 'تم حظر حسابك لمخالفة القوانين' 
      }, { status: 403 })
    }

    // إذا كان الطلب قادماً من صفحة الإعلانات لزيادة النقاط
    if (body.action === 'watch_ad') {
        const now = new Date()
        const lastAdDate = user.lastAdDate ? new Date(user.lastAdDate) : new Date(0)
        const isNewDay = now.toDateString() !== lastAdDate.toDateString()
        let currentCount = isNewDay ? 0 : (user.adsCount || 0)

        if (currentCount >= 7) return NextResponse.json({ success: false, message: 'انتهت محاولات اليوم' })

        const updated = await prisma.user.update({
            where: { telegramId },
            data: { points: { increment: 1 }, adsCount: currentCount + 1, lastAdDate: now }
        })
        return NextResponse.json({ success: true, newCount: updated.adsCount, points: updated.points })
    }

    return NextResponse.json(user)
  } catch (e) { 
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 }) 
  }
}
