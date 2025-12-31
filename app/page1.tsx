'use client'

import { useEffect, useState } from 'react'
import './task.css'

export default function DailyReward() {
  const [user, setUser] = useState<any>(null)
  const [adsCount, setAdsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [notification, setNotification] = useState('')
  const [error, setError] = useState<string | null>(null)
  const MAX_ADS = 7

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      const initDataUnsafe = tg.initDataUnsafe || {}
      
      if (initDataUnsafe.user) {
        setUser(initDataUnsafe.user)
        fetchStatus(initDataUnsafe.user.id)
      } else {
        setError('يرجى فتح التطبيق من تليجرام')
        setIsLoading(false)
      }
    }
  }, [])

  const fetchStatus = async (telegramId: number) => {
    try {
      // نستخدم المسار الموحد مع تمرير الـ ID كـ Query Parameter
      const res = await fetch(`/api/user?telegramId=${telegramId}`)
      const data = await res.json()
      if (data.success) {
        setAdsCount(data.count)
      }
    } catch (err) {
      setError('فشل الاتصال بالسيرفر')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWatchAd = async () => {
    if (!user || adsCount >= MAX_ADS || isLoading) return

    setIsLoading(true)
    
    try {
      // إرسال طلب "مشاهدة إعلان" إلى السيرفر الموحد
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: user.id, 
          action: 'watch_ad' 
        }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        setAdsCount(data.newCount)
        setNotification('🎉 أحسنت! حصلت على نقطة XP إضافية')
        
        // تحديث النقاط في الصفحة الرئيسية (اختياري، يفضل إعادة تحميل الصفحة أو استخدام State Management)
        setTimeout(() => setNotification(''), 3000)
      } else {
        setError(data.message || 'انتهت محاولات اليوم')
      }
    } catch (err) {
      setError('حدث خطأ أثناء التحديث')
    } finally {
      setIsLoading(false)
    }
  }

  if (error) return <div className="error-container"><p>{error}</p></div>

  return (
    <div className="reward-container">
      <h1 className="reward-title">🎁 هدايا يومية</h1>
      
      <div className="reward-card">
        <p style={{ marginBottom: '15px' }}>شاهد إعلانات لربح نقاط XP وشراء العروض</p>
        <div className="ads-counter-info">
          <span>التقدم اليومي:</span>
          <span>{adsCount} / {MAX_ADS}</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${(adsCount / MAX_ADS) * 100}%` }}
          ></div>
        </div>
      </div>

      {notification && <div className="notification-toast">{notification}</div>}

      <button
        onClick={handleWatchAd}
        disabled={adsCount >= MAX_ADS || isLoading}
        className={`claim-btn ${adsCount >= MAX_ADS ? 'disabled' : ''}`}
      >
        {isLoading ? (
          <div className="loading-spinner" style={{width: '20px', height: '20px', borderTopColor: '#000'}}></div>
        ) : adsCount >= MAX_ADS ? (
          '✅ اكتملت إعلانات اليوم'
        ) : (
          '📺 شاهد إعلان لتربح (1 XP)'
        )}
      </button>

      {adsCount >= MAX_ADS && (
        <p className="reset-info">يتجدد العداد تلقائياً عند منتصف الليل</p>
      )}
    </div>
  )
}
