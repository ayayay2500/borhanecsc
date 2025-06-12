'use client'

import { useEffect, useState, useCallback } from 'react'
import { WebApp } from '@twa-dev/types'
import './styles.css'

declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp
    }
  }
}

type User = {
  telegramId: number
  firstName: string
  lastName?: string
  username?: string
  points: number
  photoUrl?: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState('')
  const [isTapping, setIsTapping] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const [combo, setCombo] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  // تحميل بيانات المستخدم
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()

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

  const fetchUserData = useCallback(async (tgUser: any) => {
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
        setUser({
          telegramId: tgUser.id,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          username: tgUser.username,
          points: data.points || 0,
          photoUrl: tgUser.photo_url
        })
      }
    } catch (err) {
      setError('فشل في تحميل بيانات المستخدم')
    }
  }, [])

  // زيادة النقاط مع تأثيرات كومبو
  const handleIncreasePoints = useCallback(async () => {
    if (!user) return

    setIsTapping(true)
    setTapCount(prev => prev + 1)
    setCombo(prev => prev + 1)

    // إعادة تعيين الكومبو بعد ثانية
    setTimeout(() => setCombo(0), 1000)

    try {
      const res = await fetch('/api/increase-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          telegramId: user.telegramId,
          combo: combo > 3 ? combo : 0 // إرسال الكومبو إذا كان أكثر من 3
        }),
      })

      const data = await res.json()
      
      if (data.success) {
        setUser(prev => prev ? { ...prev, points: data.points } : null)
        
        // تأثيرات خاصة عند وصول الكومبو لمستوى معين
        if (combo >= 5) {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 2000)
          setNotification(`كومبو رهيب! +${combo * 2} نقطة`)
        } else if (combo >= 3) {
          setNotification(`كومبو! +${combo} نقطة`)
        } else {
          setNotification('+1 نقطة!')
        }
        
        setTimeout(() => setNotification(''), 2000)
      } else {
        setError(data.error || 'فشل في إضافة النقاط')
      }
    } catch (err) {
      setError('حدث خطأ أثناء تحديث النقاط')
    } finally {
      setTimeout(() => setIsTapping(false), 100)
    }
  }, [user, combo])

  // تأثيرات الاهتزاز عند النقر
  const handleTap = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
    }
    handleIncreasePoints()
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <div className="error-message">{error}</div>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          حاول مرة أخرى
        </button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">جاري التحميل...</div>
        <div className="loading-hint">لا تقلق، البيانات تأخذ بعض الوقت</div>
      </div>
    )
  }

  return (
    <div className={`main-container ${showConfetti ? 'confetti-active' : ''}`}>
      {/* تأثير الكونفيتي */}
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="confetti-piece"></div>
          ))}
        </div>
      )}

      {/* رأس الصفحة */}
      <div className="user-header">
        <img
          src={user.photoUrl || '/icon2.png'}
          alt={`${user.firstName}'s profile`}
          className="user-avatar"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/icon2.png'
          }}
        />
        <div className="user-info">
          <h1 className="user-name">
            مرحباً، <span>{user.firstName}</span>!
          </h1>
          {user.username && (
            <p className="user-username">@{user.username}</p>
          )}
        </div>
      </div>

      {/* بطاقة الرصيد */}
      <div className="balance-card">
        <div className="balance-label">رصيدك الحالي</div>
        <div className="balance-amount">
          {user.points.toLocaleString()} <span>نقطة</span>
        </div>
        <div className="balance-stats">
          <div className="stat-item">
            <span>النقرات اليوم</span>
            <span>{tapCount}</span>
          </div>
          {combo > 0 && (
            <div className="combo-indicator">
              كومبو x{combo}!
            </div>
          )}
        </div>
      </div>

      {/* زر النقر الرئيسي */}
      <button
        onClick={handleTap}
        className={`main-button ${isTapping ? 'tapping' : ''} ${combo >= 3 ? 'combo-active' : ''}`}
        disabled={isTapping}
      >
        {combo >= 5 ? 'استمر! 🔥' : 
         combo >= 3 ? 'أنت على 🔥' : 
         'اضغط هنا!'}
      </button>

      {/* الإشعارات */}
      {notification && (
        <div className={`notification ${combo >= 5 ? 'combo-notification' : ''}`}>
          {notification}
        </div>
      )}

      {/* معلومات إضافية */}
      <div className="hint-text">
        كل نقرة = +1 نقطة | الكومبو يعطيك نقاط إضافية!
      </div>
    </div>
  )
}
