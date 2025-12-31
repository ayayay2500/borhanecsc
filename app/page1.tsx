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
    // التأكد من أن الكود يعمل داخل المتصفح وأن مكتبة تليجرام جاهزة
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      
      const initDataUnsafe = tg.initDataUnsafe || {}
      
      if (initDataUnsafe.user) {
        setUser(initDataUnsafe.user)
        fetchStatus(initDataUnsafe.user.id)
      } else {
        setError('يرجى فتح التطبيق من تليجرام مباشرة')
        setIsLoading(false)
      }
    }
  }, [])

  const fetchStatus = async (telegramId: number) => {
    try {
      setIsLoading(true)
      // طلب البيانات من المسار الموحد /api/user
      const res = await fetch(`/api/user?telegramId=${telegramId}`)
      
      if (!res.ok) {
        throw new Error('Server response was not ok')
      }

      const data = await res.json()
      
      // تحديث العداد بناءً على البيانات القادمة من السيرفر
      // نتحقق من وجود count أو نضع 0 كقيمة افتراضية
      if (data.success !== undefined || data.telegramId) {
        setAdsCount(data.count || 0)
        setError(null)
      }
    } catch (err) {
      console.error("Fetch Error:", err)
      setError('فشل الاتصال بالسيرفر')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWatchAd = async () => {
    if (!user || adsCount >= MAX_ADS || isLoading) return

    setIsLoading(true)
    setError(null)
    
    try {
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
        setNotification('🎉 أحسنت! حصلت على 1 XP')
        
        // إخفاء التنبيه بعد 3 ثوانٍ
        setTimeout(() => setNotification(''), 3000)
      } else {
        setError(data.message || 'انتهت محاولات اليوم')
      }
    } catch (err) {
      setError('حدث خطأ أثناء تحديث النقاط')
    } finally {
      setIsLoading(false)
    }
  }

  if (error && !adsCount) {
    return (
      <div className="reward-container">
        <div className="error-container">
          <p>{error}</p>
          <button className="retry-button" onClick={() => user && fetchStatus(user.id)}>
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="reward-container">
      <h1 className="reward-title">🎁 هدايا يومية</h1>
      
      <div className="reward-card">
        <p style={{ marginBottom: '15px', fontSize: '0.9rem', opacity: 0.9 }}>
          شاهد الإعلانات لجمع نقاط XP واستبدالها بالجوائز
        </p>
        
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
          <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
        ) : adsCount >= MAX_ADS ? (
          '✅ اكتملت مهام اليوم'
        ) : (
          '📺 شاهد إعلان لتربح XP'
        )}
      </button>

      {adsCount >= MAX_ADS && (
        <p className="reset-info">يتم تصغير العداد تلقائياً كل 24 ساعة</p>
      )}
    </div>
  )
}
