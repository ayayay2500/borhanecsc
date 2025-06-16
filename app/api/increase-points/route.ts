import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { telegramId } = await req.json()

        if (!telegramId) {
            return NextResponse.json({ error: 'Invalid telegramId' }, { status: 400 })
        }

        // البحث عن المستخدم مع آخر وقت مطالبة
        const user = await prisma.user.findUnique({
            where: { telegramId },
            select: {
                points: true,
                lastClaimed: true
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const now = new Date()
        const twentyFourHours = 24 * 60 * 60 * 1000 // 24 ساعة بالميلي ثانية

        // إذا كان هناك وقت مطالبة سابق
        if (user.lastClaimed) {
            const lastClaimed = new Date(user.lastClaimed)
            const timeDiff = now.getTime() - lastClaimed.getTime()

            // إذا لم تمر 24 ساعة بعد
            if (timeDiff < twentyFourHours) {
                const nextClaimTime = new Date(lastClaimed.getTime() + twentyFourHours)
                return NextResponse.json({
                    success: false,
                    message: 'يمكنك المطالبة بنقطة واحدة كل 24 ساعة',
                    nextClaimTime: nextClaimTime.toISOString(),
                    canClaim: false
                }, { status: 200 })
            }
        }

        // إذا مرت 24 ساعة أو أول مرة يطالب
        const updatedUser = await prisma.user.update({
            where: { telegramId },
            data: { 
                points: { increment: 1 },
                lastClaimed: now.toISOString()
            }
        })

        // حساب وقت المطالبة التالي
        const nextClaimTime = new Date(now.getTime() + twentyFourHours)

        return NextResponse.json({ 
            success: true, 
            points: updatedUser.points,
            nextClaimTime: nextClaimTime.toISOString(),
            canClaim: true
        })
    } catch (error) {
        console.error('Error increasing points:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
