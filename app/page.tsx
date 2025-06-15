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

type Product = {
  id: number
  title: string
  price: number
  imageUrl: string
  category: string
}

type Broker = {
  id: number
  username: string
  firstName: string
  photoUrl: string
  description: string
  isOnline: boolean
  lastSeen?: string
}

type BannedUser = {
  telegramId: number
  reason: string
}

type AdminUser = {
  telegramId: number
  firstName: string
  username?: string
  role: 'admin' | 'moderator' | 'superModerator'
  lastActive: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [activeTab, setActiveTab] = useState<'products' | 'brokers'>('products')
  const [loading, setLoading] = useState(true)
  const [isBanned, setIsBanned] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showBannedList, setShowBannedList] = useState(false)
  const [showAdminSheet, setShowAdminSheet] = useState(false)

  const bannedUsers: BannedUser[] = [
    { telegramId: 5149849049, reason: "Admin Test Ban" },
    { telegramId: 987654321, reason: "إرسال رسائل مزعجة" },
  ]

  useEffect(() => {
    const handleContextMenu = (e: Event) => e.preventDefault()
    const handleSelectStart = (e: Event) => e.preventDefault()
    const handleLongPress = (e: TouchEvent) => {
      if (e.target instanceof HTMLElement && e.target.tagName === 'IMG') {
        e.preventDefault()
      }
    }
    
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('selectstart', handleSelectStart)
    document.addEventListener('touchstart', handleLongPress, { passive: false })
    document.addEventListener('touchmove', handleLongPress, { passive: false })
    document.addEventListener('touchend', handleLongPress, { passive: false })
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('selectstart', handleSelectStart)
      document.removeEventListener('touchstart', handleLongPress)
      document.removeEventListener('touchmove', handleLongPress)
      document.removeEventListener('touchend', handleLongPress)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()

      const initDataUnsafe = tg.initDataUnsafe || {}
      
      if (initDataUnsafe.user) {
        checkIfBanned(initDataUnsafe.user.id)
        
        if (!isBanned) {
          fetchUserData(initDataUnsafe.user)
          fetchProducts()
          fetchBrokers()
          fetchAdmins()
        }
      } else {
        setError('لا توجد بيانات مستخدم متاحة')
      }
    } else {
      setError('الرجاء فتح البوت عبر Telegram')
    }
  }, [])

  const checkIfBanned = (telegramId: number) => {
    const bannedUser = bannedUsers.find(user => user.telegramId === telegramId)
    if (bannedUser) {
      setIsBanned(true)
      setBanReason(bannedUser.reason)
    }
  }

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

  const fetchProducts = async () => {
    try {
      const mockProducts: Product[] = [
        {
          id: 1,
          title: "حساب جواهر 5000 اندرويد",
          price: 1.70,
          imageUrl: "https://i.postimg.cc/4d0Vdzhy/New-Project-40-C022-BBD.png",
          category: "باونتي"
        },
        {
          id: 2,
          title: "حساب جواهر 5000 ايفون",
          price: 1.70,
          imageUrl: "https://i.postimg.cc/k51fQRb3/New-Project-40-321-E54-A.png",
          category: "باونتي"
        },
        {
          id: 3,
          title: "حساب جواهر + كوزان اندرويد",
          price: 2.00,
          imageUrl: "https://i.postimg.cc/fL1CF4C8/New-Project-40-FE9627-F.png",
          category: "باونتي"
        },
        {
          id: 4,
          title: "تحويل فليكسي",
          price: 0,
          imageUrl: "https://i.postimg.cc/9Q1p2w1R/New-Project-40-90-F0-A70.png",
          category: "تحويل"
        },
        {
          id: 5,
          title: "عضوية شهرية ",
          price: 6.00,
          imageUrl: "https://i.postimg.cc/DzZcwfYC/New-Project-40-8383-F74.png",
          category: "شحن"
        },
        {
          id: 6,
          title: "لايوجد منتج",
          price: 99999,
          imageUrl: "",
          category: "لايوجد"
        }
      ]
      
      setProducts(mockProducts)
    } catch (err) {
      setError('فشل في تحميل المنتجات')
    }
  }

  const fetchBrokers = async () => {
    try {
      const mockBrokers: Broker[] = [
        {
          id: 1,
          username: "Kharwaydo",
          firstName: "Borhane San",
          photoUrl: "https://i.postimg.cc/JzZkhSCY/Screenshot-2025-05-08-20-30-56-49-50ef9f5a0f3fc24b6f0ffc8843167fe4.jpg",
          description: "تاجر حسابات جواهر + وسيط ",
          isOnline: false
        },
      ]
      
      setBrokers(mockBrokers)
      setLoading(false)
    } catch (err) {
      setError('فشل في تحميل بيانات الوسطاء')
      setLoading(false)
    }
  }

  const fetchAdmins = async () => {
    try {
      const mockAdmins: AdminUser[] = [
        {
          telegramId: 5149849049,
          firstName: "Borhane",
          username: "Kharwaydo",
          role: "admin",
          lastActive: new Date().toISOString()
        },
        {
          telegramId: 2047274737,
          firstName: "Seidmmf",
          username: "Seif 🍖BBQ",
          role: "moderator",
          lastActive: new Date(Date.now() - 3600000).toISOString()
        }
      ]
      setAdminUsers(mockAdmins)
    } catch (err) {
      console.error('Failed to fetch admins', err)
    }
  }

  const handleProductClick = (product: Product) => {
    if (window.Telegram?.WebApp) {
      const message = `مرحباً، أنا مهتم بشراء ${product.title} بسعر ${product.price.toLocaleString()} دولار. هل لا يزال متوفراً؟`
      window.Telegram.WebApp.openTelegramLink(`https://t.me/Kharwaydo?text=${encodeURIComponent(message)}`)
    }
  }

  const handleBrokerClick = (broker: Broker) => {
    if (window.Telegram?.WebApp) {
      const message = `مرحباً ${broker.firstName}، أنا مهتم بالتعامل معك كوسيط موثوق. هل يمكنك مساعدتي؟`
      window.Telegram.WebApp.openTelegramLink(`https://t.me/${broker.username}?text=${encodeURIComponent(message)}`)
    }
  }

  const toggleAdminPanel = () => setShowAdminPanel(!showAdminPanel)
  const toggleBannedList = () => setShowBannedList(!showBannedList)
  const toggleAdminSheet = () => setShowAdminSheet(!showAdminSheet)

  const isAdmin = adminUsers.some(admin => 
    admin.telegramId === user?.telegramId && admin.role
  )

  const renderAdminBadge = (role: 'admin' | 'moderator' | 'superModerator') => {
    switch(role) {
      case 'admin':
        return <span className="admin-badge admin">مسؤول</span>
      case 'superModerator':
        return <span className="admin-badge super-moderator">مشرف رئيسي</span>
      case 'moderator':
        return <span className="admin-badge moderator">مشرف</span>
      default:
        return null
    }
  }

  if (isBanned) {
    return (
      <div className="banned-container">
        <div className="banned-icon">🚫</div>
        <h1 className="banned-title">لقد تم حظرك</h1>
        <div className="banned-reason-box">
          <p className="banned-reason">السبب: {banReason}</p>
        </div>
        <p className="banned-contact">للاستفسار يمكنك التواصل مع المسؤول</p>
      </div>
    )
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

  if (!user || loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">لا تقلق يولد 🤣</div>
      </div>
    )
  }

  return (
    <div className="main-container">
      <div className="user-header">
        <img
          src={user.photoUrl || '/default-avatar.png'}
          alt={`${user.firstName}'s profile`}
          className="user-avatar"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/default-avatar.png'
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

      <div className="balance-card">
        <div className="balance-label">رصيدك الحالي</div>
        <div className="balance-amount">
          {user.points.toLocaleString()} <span>XP</span>
        </div>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          المنتجات
        </button>
        <button 
          className={`tab-button ${activeTab === 'brokers' ? 'active' : ''}`}
          onClick={() => setActiveTab('brokers')}
        >
          وسطاء موثوقون
        </button>
      </div>

      {activeTab === 'products' ? (
        <div className="products-grid">
          {products.map(product => (
            <div 
              key={product.id} 
              className="product-card"
              onClick={() => handleProductClick(product)}
            >
              <div className="product-image-container">
                <img 
                  src={product.imageUrl} 
                  alt={product.title}
                  className="product-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/product-placeholder.png'
                  }}
                />
                <div className="product-badge">{product.category}</div>
              </div>
              <div className="product-info">
                <h3 className="product-title">{product.title}</h3>
                <div className="product-price">{product.price.toLocaleString()} $</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="brokers-list">
          {brokers.map(broker => (
            <div 
              key={broker.id} 
              className="broker-card"
              onClick={() => handleBrokerClick(broker)}
            >
              <div className="broker-avatar-container">
                <img
                  src={broker.photoUrl || '/default-avatar.png'}
                  alt={`${broker.firstName}'s profile`}
                  className="broker-avatar"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-avatar.png'
                  }}
                />
                <div className={`online-status ${broker.isOnline ? 'online' : 'offline'}`}>
                  {broker.isOnline ? 'متصل' : broker.lastSeen || 'غير متصل'}
                </div>
              </div>
              <div className="broker-info">
                <h3 className="broker-name">
                  {broker.firstName}
                  <span className="broker-username">@{broker.username}</span>
                </h3>
                <p className="broker-description">{broker.description}</p>
                <button className="contact-broker-button">
                  التواصل مع الوسيط
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <div className="admin-panel">
          <button 
            className="admin-button"
            onClick={toggleAdminPanel}
          >
            لوحة الإدارة ⚙️
          </button>

          {showAdminPanel && (
            <div className="admin-dropdown">
              <button onClick={toggleBannedList}>قائمة المحظورين</button>
              <button onClick={toggleAdminSheet}>واجهة الإدارة</button>
            </div>
          )}
        </div>
      )}

      {showBannedList && (
        <div className="modal-overlay">
          <div className="banned-users-modal">
            <div className="modal-header">
              <h3>قائمة المحظورين</h3>
              <button className="close-modal" onClick={toggleBannedList}>×</button>
            </div>
            <div className="banned-list">
              {bannedUsers.map((user, index) => (
                <div key={index} className="banned-user-item">
                  <div className="banned-user-id">ID: {user.telegramId}</div>
                  <div className="banned-reason">السبب: {user.reason}</div>
                  <button className="unban-button">إلغاء الحظر</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAdminSheet && (
        <div className="modal-overlay">
          <div className="admin-sheet-modal">
            <div className="modal-header">
              <h3>واجهة الإدارة</h3>
              <button className="close-modal" onClick={toggleAdminSheet}>×</button>
            </div>
            <div className="admin-list">
              <h4>قائمة الإداريين</h4>
              {adminUsers.map((admin, index) => (
                <div key={index} className="admin-item">
                  <div className="admin-info">
                    <span className="admin-name">{admin.firstName}</span>
                    <span className="admin-username">@{admin.username}</span>
                    {renderAdminBadge(admin.role)}
                  </div>
                  <div className="admin-last-active">
                    آخر نشاط: {new Date(admin.lastActive).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="footer">
        <p>Developed By <span>Borhane San</span></p>
      </div>
    </div>
  )
}
