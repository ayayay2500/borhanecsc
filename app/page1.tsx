'use client'

import { useEffect, useState } from 'react'
import { WebApp } from '@twa-dev/types'
import './styles.css' 

declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp
    }
  }
}

// قائمة محددة مسبقًا من الحسابات
const ACCOUNTS_LIST = [
  { id: 'AD1001', username: 'user1', password: 'pass123' },
  { id: 'AD1002', username: 'user2', password: 'pass456' },
  { id: 'AD1003', username: 'user3', password: 'pass789' },
  // يمكنك إضافة المزيد من الحسابات هنا
]

type Product = {
  id: string;
  name: string;
  price: number;
  credentials: {
    username: string;
    password: string;
  };
  purchasedAt: Date | null;
};

export default function DailyProduct() {
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [lastPurchase, setLastPurchase] = useState<Date | null>(null)
  const [availableAccounts, setAvailableAccounts] = useState(ACCOUNTS_LIST)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()

      const initDataUnsafe = tg.initDataUnsafe || {}

      if (initDataUnsafe.user) {
        fetchUserData(initDataUnsafe.user)
      } else {
        setError('لا توجد بيانات مستخدم متاحة')
      }
    } else {
      setError('الرجاء فتح البوت عبر Telegram')
    }
  }, [])

  const fetchUserData = async (tgUser: any) => {
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tgUser),
      })
      const data = await res.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setUser(data)
        if (data.lastPurchase) {
          setLastPurchase(new Date(data.lastPurchase))
        }
        // جلب الحسابات المستخدمة بالفعل لتحديد المتاحة
        if (data.purchasedAccounts) {
          const usedAccounts = data.purchasedAccounts.map((acc: any) => acc.id)
          setAvailableAccounts(
            ACCOUNTS_LIST.filter(acc => !usedAccounts.includes(acc.id))
          )
        }
      }
    } catch (err) {
      setError('فشل في تحميل بيانات المستخدم')
    }
  }

  const handlePurchase = async () => {
    if (!user || isLoading || availableAccounts.length === 0) return
    if (user.points < 100) {
      setError('رصيدك غير كافي لشراء هذا المنتج')
      return
    }

    // التحقق من آخر عملية شراء
    const today = new Date()
    if (lastPurchase && isSameDay(lastPurchase, today)) {
      setError('لقد قمت بشراء هذا المنتج اليوم بالفعل')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // اختيار أول حساب متاح
      const selectedAccount = availableAccounts[0]
      
      const res = await fetch('/api/purchase-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          telegramId: user.telegramId,
          price: 100,
          product: {
            id: selectedAccount.id,
            name: "Auto Delivery Account",
            credentials: {
              username: selectedAccount.username,
              password: selectedAccount.password
            },
            purchasedAt: new Date()
          }
        }),
      })

      const data = await res.json()
      
      if (data.success) {
        setUser({ ...user, points: data.newPoints })
        setProduct(data.product)
        setLastPurchase(new Date())
        setAvailableAccounts(availableAccounts.slice(1))
        setNotification('تم شراء المنتج بنجاح!')
      } else {
        setError(data.error || 'فشل في عملية الشراء')
      }
    } catch (err) {
      setError('حدث خطأ أثناء عملية الشراء')
    } finally {
      setIsLoading(false)
    }
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  const canPurchaseToday = () => {
    if (!lastPurchase) return true
    const today = new Date()
    return !isSameDay(lastPurchase, today)
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-red-500 text-center py-4">{error}</div>
        <button
          onClick={() => setError(null)}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          المحاولة مرة أخرى
        </button>
      </div>
    )
  }

  if (!user) {
    return <div className="container mx-auto p-4 text-center">...جاري التحميل</div>
  }

  return (
    <div className="container mx-auto p-4 bg-dark-background text-white rounded-lg shadow-3xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Auto Delivery Account</h2>
        <p className="text-gray-300">سعر المنتج: 100 نقطة</p>
        <p className="text-gray-300">(مسموح بشراء واحدة يومياً)</p>
        <p className="text-gray-300 mt-2">
          الحسابات المتاحة: {availableAccounts.length}/{ACCOUNTS_LIST.length}
        </p>
      </div>

      <div className="mb-6">
        <p className="text-center">
          رصيدك الحالي: <span className="text-blue-300 font-semibold">{user.points}</span> نقطة
        </p>
      </div>

      {product ? (
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-3">تفاصيل حسابك:</h3>
          <div className="space-y-2">
            <p><span className="font-medium">معرف الحساب:</span> {product.id}</p>
            <p><span className="font-medium">اسم المستخدم:</span> {product.credentials.username}</p>
            <p><span className="font-medium">كلمة المرور:</span> {product.credentials.password}</p>
            <p className="text-sm text-gray-400 mt-3">
              تم الشراء في: {new Date(product.purchasedAt || '').toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 p-4 rounded-lg mb-6 text-center">
          <p>لم تقم بشراء أي منتج بعد</p>
        </div>
      )}

      <button
        onClick={handlePurchase}
        disabled={!canPurchaseToday() || user.points < 100 || isLoading || availableAccounts.length === 0}
        className={`w-full py-3 px-4 rounded-full font-bold shadow-lg transition
          ${(!canPurchaseToday() || user.points < 100 || availableAccounts.length === 0) 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600'}
          ${isLoading ? 'opacity-70' : ''}
        `}
      >
        {isLoading ? 'جاري المعالجة...' : 
         availableAccounts.length === 0 ? 'لا توجد حسابات متاحة' :
         'شراء المنتج (100 نقطة)'}
      </button>

      {notification && (
        <div className="mt-4 p-3 bg-green-600 text-white rounded-md text-center">
          {notification}
        </div>
      )}
    </div>
  )
}
