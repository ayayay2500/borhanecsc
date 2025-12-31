'use client'

import { useEffect, useState, useCallback } from 'react'
import './styles.css'
import Page1 from './page1'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'products' | 'tasks'>('products')
  const [loading, setLoading] = useState(true)
  
  // حالات نظام الأكواد
  const [showGiftModal, setShowGiftModal] = useState(false)
  const [giftCode, setGiftCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchUserData = useCallback(async (tgUser: any) => {
    try {
      const res = await fetch('/api/increase-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tgUser),
      })
      const data = await res.json()
      setUser({ ...tgUser, points: data.points || 0 })
    } catch (err) {
      console.error("Error fetching user");
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      if (tg.initDataUnsafe?.user) {
        fetchUserData(tg.initDataUnsafe.user)
      }
    }
  }, [fetchUserData])

  // وظيفة استرداد الكود
  const handleRedeemCode = async () => {
    if (!giftCode.trim() || isSubmitting) return
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/increase-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: user.id, 
          action: 'redeem_code', 
          code: giftCode.trim() 
        }),
      })
      const data = await res.json()

      if (data.success) {
        setUser((prev: any) => ({ ...prev, points: data.newPoints }))
        alert(`✅ تم الاسترداد بنجاح! حصلت على ${data.amount} XP`)
        setShowGiftModal(false)
        setGiftCode('')
      } else {
        alert(`❌ فشل: ${data.message || 'كود غير صالح'}`)
      }
    } catch (e) {
      alert("❌ حدث خطأ في الاتصال")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div></div>

  return (
    <div className="main-container">
      {/* الواجهة العلوية */}
      <div className="user-header">
        <div className="user-top-actions">
           {/* زر Top Up الجديد */}
           <button className="topup-btn" onClick={() => setShowGiftModal(true)}>
             + Top Up
           </button>
        </div>
        
        <div className="user-profile-info">
          <div className="user-info">
            <h1 className="user-name">مرحباً، <span>{user?.first_name || 'Smart'}</span>!</h1>
            <p className="user-username">@{user?.username || 'smartserevrfox'}</p>
          </div>
          <img src={user?.photo_url || 'https://via.placeholder.com/55'} className="user-avatar" alt="profile" />
        </div>
      </div>

      {/* الرصيد والتبويبات والمنتجات (نفس الكود القديم لديك) */}
      <div className="balance-card">
        <p>رصيدك الحالي</p>
        <h2>{user?.points || 0} <span>XP</span></h2>
      </div>

      <div className="tabs-container">
        <button className={activeTab === 'products' ? 'tab-button active' : 'tab-button'} onClick={() => setActiveTab('products')}>المنتجات</button>
        <button className={activeTab === 'tasks' ? 'tab-button active' : 'tab-button'} onClick={() => setActiveTab('tasks')}>الهدية اليومية</button>
      </div>

      {activeTab === 'products' ? (
        <div className="products-grid">
           {/* المنتجات هنا */}
        </div>
      ) : (
        <Page1 />
      )}

      {/* --- نافذة استرداد الكود (Modal) --- */}
      {showGiftModal && (
        <div className="modal-overlay">
          <div className="gift-modal">
            <h3>استرداد كود الهدايا 🎁</h3>
            <p>أدخل الكود الخاص بك للحصول على نقاط XP مجانية</p>
            
            <input 
              type="text" 
              placeholder="مثال: GIFT2025" 
              value={giftCode}
              onChange={(e) => setGiftCode(e.target.value)}
              className="gift-input"
            />
            
            <div className="modal-buttons">
              <button 
                className="redeem-confirm-btn" 
                onClick={handleRedeemCode}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'جاري التحقق...' : 'استرداد الآن'}
              </button>
              <button className="modal-close-btn" onClick={() => setShowGiftModal(false)}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
