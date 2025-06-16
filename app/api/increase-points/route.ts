import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { telegramId, price, product } = await req.json()

        if (!telegramId || !price || !product) {
            return NextResponse.json({ error: 'بيانات غير كاملة' }, { status: 400 })
        }

        // 1. التحقق من رصيد المستخدم
        const user = await prisma.user.findUnique({
            where: { telegramId },
            include: { purchasedProducts: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
        }

        // 2. التحقق من أن المستخدم لديه رصيد كافي
        if (user.points < price) {
            return NextResponse.json({ error: 'رصيدك غير كافي' }, { status: 400 })
        }

        // 3. التحقق من أن المستخدم لم يشترِ اليوم
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const lastPurchase = user.lastPurchase ? new Date(user.lastPurchase) : null
        if (lastPurchase && lastPurchase >= today) {
            return NextResponse.json({ error: 'لقد قمت بالشراء اليوم بالفعل' }, { status: 400 })
        }

        // 4. التحقق من أن الحساب لم يسبق بيعه
        const existingProduct = await prisma.product.findUnique({
            where: { id: product.id }
        })

        if (existingProduct) {
            return NextResponse.json({ error: 'هذا الحساب تم بيعه مسبقاً' }, { status: 400 })
        }

        // 5. تنفيذ عملية الشراء
        const [updatedUser, newProduct] = await prisma.$transaction([
            prisma.user.update({
                where: { telegramId },
                data: { 
                    points: { decrement: price },
                    lastPurchase: new Date()
                }
            }),
            prisma.product.create({
                data: {
                    id: product.id,
                    name: product.name,
                    username: product.credentials.username,
                    password: product.credentials.password,
                    purchasedAt: new Date(),
                    userId: user.id
                }
            })
        ])

        return NextResponse.json({ 
            success: true, 
            newPoints: updatedUser.points,
            product: {
                id: newProduct.id,
                name: newProduct.name,
                credentials: {
                    username: newProduct.username,
                    password: newProduct.password
                },
                purchasedAt: newProduct.purchasedAt
            }
        })

    } catch (error) {
        console.error('خطأ في عملية الشراء:', error)
        return NextResponse.json({ error: 'خطأ داخلي في الخادم' }, { status: 500 })
    }
}
