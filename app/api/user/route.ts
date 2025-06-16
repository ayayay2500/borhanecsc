import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const userData = await req.json()

        if (!userData || !userData.id) {
            return NextResponse.json({ error: 'Invalid user data' }, { status: 400 })
        }

        let user = await prisma.user.findUnique({
            where: { telegramId: userData.id }
        })

        // التحقق من الحظر إذا كان المستخدم موجوداً
        if (user?.status === 1) {
            return NextResponse.json(
                { 
                    error: 'Your account is banned',
                    banned: true
                },
                { status: 403 }
            )
        }

        if (!user) {
            user = await prisma.user.create({
                data: {
                    telegramId: userData.id,
                    username: userData.username || '',
                    firstName: userData.first_name || '',
                    lastName: userData.last_name || '',
                    status: 0 // قيمة افتراضية غير محظور
                }
            })
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error processing user data:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
