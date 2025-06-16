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

export default function DailyReward() {
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState('')
  const [canClaim, setCanClaim] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()

      const initDataUnsafe = tg.initDataUnsafe || {}
      
      if (initDataUnsafe.user) {
        setUser(initDataUnsafe.user)
        checkClaimStatus(initDataUnsafe.user.id)
      } else {
        setError('يجب تسجيل الدخول أولاً')
        setIsLoading(false)
      }
    } else {
      setError('الرجاء فتح البوت عبر Telegram')
      setIsLoading(false)
    }
  }, [])

  const checkClaimStatus = async (telegramId: number) => {
    try {
      const res = await fetch(`/api/increase-points?telegramId=${telegramId}`)
      const data = await res.json()
      
      if (data.success) {
        setCanClaim(data.canClaim)
        if (!data.canClaim && data.nextClaimTime) {
          startCountdown(data.nextClaimTime)
        }
      } else {
        setError(data.message || 'فشل التحقق من الجائزة')
        if (data.nextClaimTime) {
          startCountdown(data.nextClaimTime)
        }
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم')
    } finally {
      setIsLoading(false)
    }
  }

  const startCountdown = (endTime: string) => {
    const updateTimer = () => {
      const now = new Date()
      const end = new Date(endTime)
      const diff = end.getTime() - now.getTime()

      if (diff <= 0) {
        setCanClaim(true)
        setTimeLeft('')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(`${hours} س ${minutes} د ${seconds} ث`)
      setTimeout(updateTimer, 1000)
    }

    updateTimer()
  }

  const handleClaimReward = async () => {
    if (!user || !canClaim || isLoading) return

    setIsLoading(true)
    
    try {
      const res = await fetch('/api/increase-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId: user.id }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        setNotification('🎉 حصلت على جائزتك اليومية!')
        setCanClaim(false)
        startCountdown(data.nextClaimTime)
      } else {
        setError(data.message || 'فشل في المطالبة')
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="reward-container">
      <h1 className="reward-title">🎁 المكافأة اليومية</h1>
      
      <div className="reward-card">
        <p>احصل على نقطة مجانية كل 24 ساعة</p>
        <small>اضغط لتحصل على جائزتك اليومية</small>
      </div>

      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}

      <button
        onClick={handleClaimReward}
        disabled={!canClaim || isLoading}
        className={`claim-btn ${!canClaim ? 'disabled' : ''}`}
      >
        {isLoading ? 'جاري التحميل...' : 
         canClaim ? '🎁 احصل على جائزتك' : 
         `الوقت المتبقي: ${timeLeft}`}
      </button>
    </div>
  )
}
