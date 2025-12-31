'use client'

import { useEffect, useState } from 'react'
import './task.css'

export default function DailyReward() {
  const [user, setUser] = useState<any>(null)
  const [adsCount, setAdsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [notification, setNotification] = useState('')
  const MAX_ADS = 7

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user)
        fetchStatus(tg.initDataUnsafe.user.id)
      }
    }
  }, [])

  const fetchStatus = async (telegramId: number) => {
    try {
      const res = await fetch(`/api/increase-points?telegramId=${telegramId}`)
      const data = await res.json()
      setAdsCount(data.count || 0)
    } catch (err) {
      console.error("Fetch error");
    } finally {
      setIsLoading(false)
    }
  }

  const handleWatchAd = async () => {
    if (!user || adsCount >= MAX_ADS || isLoading) return
    // @ts-ignore
    if (!window.Adsgram) return alert("جاري تحميل الإعلانات...");

    try {
      // @ts-ignore
      const AdController = window.Adsgram.init({ blockId: "int-20305" });
      const result = await AdController.show();

      if (result.done) {
        setIsLoading(true)
        const res = await fetch('/api/increase-points', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: user.id, action: 'watch_ad' }),
        })
        const data = await res.json()
        setAdsCount(data.newCount)
        setNotification('🎉 حصلت على 1 XP')
        setTimeout(() => setNotification(''), 3000)
      }
    } catch (err) {
      alert("لا توجد إعلانات حالياً");
    } finally {
      setIsLoading(false)
    }
  }

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
      <button onClick={handleWatchAd} disabled={adsCount >= MAX_ADS || isLoading} className="claim-btn">
        {isLoading ? 'انتظر...' : adsCount >= MAX_ADS ? '✅ اكتملت المهام' : '📺 شاهد إعلان (1 XP)'}
      </button>
    </div>
  )
}
