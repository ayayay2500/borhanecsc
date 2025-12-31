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
        setError('يرجى الدخول من تليجرام')
        setIsLoading(false)
      }
    }
  }, [])

  const fetchStatus = async (telegramId: number) => {
    try {
      const res = await fetch(`/api/increase-points?telegramId=${telegramId}`)
      if (!res.ok) throw new Error('Error')
      const data = await res.json()
      if (data.success || data.telegramId) {
        setAdsCount(data.count || 0)
        setError(null)
      }
    } catch (err) {
      setError('فشل الاتصال بالسيرفر')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWatchAd = async () => {
    if (!user || adsCount >= MAX_ADS || isLoading) return

    // التحقق من تحميل مكتبة Adsgram
    // @ts-ignore
    if (!window.Adsgram) {
      alert("جاري تحميل نظام الإعلانات... يرجى المحاولة بعد لحظات");
      return;
    }

    try {
      // 1. تهيئة الإعلان باستخدام الـ Block ID الخاص بك
      // @ts-ignore
      const AdController = window.Adsgram.init({ blockId: "int-20305" });
      
      // 2. إظهار الإعلان للمستخدم
      const result = await AdController.show();

      // 3. إذا انتهى الإعلان بنجاح (result.done)
      if (result.done) {
        setIsLoading(true)
        const res = await fetch('/api/increase-points', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: user.id, action: 'watch_ad' }),
        })
        
        const data = await res.json()
        if (data.success) {
          setAdsCount(data.newCount)
          setNotification('🎉 أحسنت! حصلت على 1 XP')
          
          // تحديث الرصيد في الصفحة الرئيسية يتطلب إعادة تحميل بسيطة أو الانتقال بين التبويبات
          setTimeout(() => setNotification(''), 3000)
        }
      } else {
        // إذا أغلق المستخدم الإعلان قبل النهاية
        alert("يجب مشاهدة الإعلان كاملاً للحصول على المكافأة");
      }
    } catch (err) {
      console.error("Ad error:", err);
      alert("لا توجد إعلانات متوفرة حالياً، حاول مرة أخرى لاحقاً");
    } finally {
      setIsLoading(false)
    }
  }

  if (error && !adsCount) return <div className="reward-container"><p>{error}</p></div>

  return (
    <div className="reward-container">
      <h1 className="reward-title">🎁 هدايا يومية</h1>
      <div className="reward-card">
        <div className="ads-counter-info">
          <span>التقدم اليومي:</span>
          <span>{adsCount} / {MAX_ADS}</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${(adsCount / MAX_ADS) * 100}%` }}></div>
        </div>
      </div>

      {notification && <div className="notification-toast">{notification}</div>}

      <button 
        onClick={handleWatchAd} 
        disabled={adsCount >= MAX_ADS || isLoading} 
        className={`claim-btn ${adsCount >= MAX_ADS ? 'disabled' : ''}`}
      >
        {isLoading ? (
          <div className="loading-spinner" style={{width: '20px', height: '20px'}}></div>
        ) : adsCount >= MAX_ADS ? (
          '✅ اكتملت مهام اليوم'
        ) : (
          '📺 شاهد إعلان لتربح 1 XP'
        )}
      </button>

      {adsCount >= MAX_ADS && (
        <p style={{marginTop: '15px', fontSize: '0.8rem', opacity: 0.6}}>
          عد غداً للمزيد من الجوائز!
        </p>
      )}
    </div>
  )
}
