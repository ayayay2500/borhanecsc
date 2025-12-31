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
      const res = await fetch(`/api/increase-points?telegramId=${telegramId}`)
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
      // هنا يمكنك استدعاء كود شركة الإعلانات فعلياً
      // بعد نجاح الإعلان، نقوم بتحديث النقاط:
      const res = await fetch('/api/increase-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: user.id }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        setAdsCount(data.newCount)
        setNotification('🎉 أحسنت! حصلت على نقطة إضافية')
        setTimeout(() => setNotification(''), 3000)
      } else {
        setError(data.message)
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
        <p>شاهد إعلانات لربح نقاط XP</p>
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
          <div className="spinner-small"></div>
        ) : adsCount >= MAX_ADS ? (
          '✅ اكتملت إعلانات اليوم'
        ) : (
          '📺 شاهد إعلان لتربح'
        )}
      </button>

      {adsCount >= MAX_ADS && (
        <p className="reset-info">يتجدد العداد تلقائياً كل يوم</p>
      )}
    </div>
  )
}
