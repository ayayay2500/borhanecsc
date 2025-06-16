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
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState('')
  const [nextClaimTime, setNextClaimTime] = useState<number | null>(null)
  const [canClaim, setCanClaim] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // التحقق من localStorage لمعرفة آخر وقت تم فيه المطالبة بالجائزة
    const lastClaimTime = localStorage.getItem('lastClaimTime')
    if (lastClaimTime) {
      const now = new Date().getTime()
      const timeDiff = now - parseInt(lastClaimTime)
      const hoursDiff = timeDiff / (1000 * 60 * 60)

      if (hoursDiff < 24) {
        setCanClaim(false)
        const nextClaim = parseInt(lastClaimTime) + 24 * 60 * 60 * 1000
        setNextClaimTime(nextClaim)
      }
    }
  }, [])

  const handleClaimReward = () => {
    setIsLoading(true)
    
    // محاكاة إرسال الطلب إلى الخادم
    setTimeout(() => {
      const now = new Date().getTime()
      localStorage.setItem('lastClaimTime', now.toString())
      
      setNotification('مبروك! لقد حصلت على جائزتك اليومية 🎁')
      setTimeout(() => setNotification(''), 3000)
      
      setCanClaim(false)
      const nextClaim = now + 24 * 60 * 60 * 1000
      setNextClaimTime(nextClaim)
      
      setIsLoading(false)
    }, 1000)
  }

  const formatTimeRemaining = () => {
    if (!nextClaimTime) return ''

    const now = new Date().getTime()
    const diff = nextClaimTime - now
    
    if (diff <= 0) {
      setCanClaim(true)
      return ''
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return `متاح بعد: ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500 text-center">{error}</div>
  }

  return (
    <div className="container mx-auto p-4 bg-gradient-to-b from-purple-900 to-indigo-900 text-white rounded-lg shadow-3xl text-center">
      <h1 className="text-4xl font-bold mb-6 text-yellow-300">🎁 المكافأة اليومية 🎁</h1>
      
      <div className="bg-white bg-opacity-10 p-6 rounded-xl mb-8">
        <p className="text-xl mb-4">احصل على نقطة مجانية كل 24 ساعة!</p>
        <p className="text-sm text-gray-300">اضغط على الزر أدناه لتحصل على جائزتك اليومية</p>
      </div>

      {notification && (
        <div className="mt-4 p-3 bg-green-600 text-white rounded-md shadow-md animate-bounce">
          {notification}
        </div>
      )}

      <button
        onClick={handleClaimReward}
        disabled={!canClaim || isLoading}
        className={`${canClaim 
          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700' 
          : 'bg-gray-500 cursor-not-allowed'
        } text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition duration-300 hover:scale-105 mt-6 text-xl relative overflow-hidden`}
      >
        {isLoading ? (
          'جار التحميل...'
        ) : canClaim ? (
          '🎁 احصل على جائزتك الآن!'
        ) : (
          <span className="text-sm">{formatTimeRemaining()}</span>
        )}
      </button>

      <div className="mt-8 text-sm text-gray-300">
        <p>تعود الجائزة بعد 24 ساعة من آخر مرة حصلت فيها عليها</p>
      </div>
    </div>
  )
}
