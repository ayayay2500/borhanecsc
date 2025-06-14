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

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [activeTab, setActiveTab] = useState<'products' | 'brokers'>('products')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()

      const initDataUnsafe = tg.initDataUnsafe || {}
      
      if (initDataUnsafe.user) {
        fetchUserData(initDataUnsafe.user)
        fetchProducts()
        fetchBrokers()
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
      // بيانات وهمية للوسطاء
      const mockBrokers: Broker[] = [
        {
          id: 1,
          username: "@Kharwaydo",
          firstName: "Borhane San",
          photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
          description: "تاجر حسابات جواهر + وسيط ",
          isOnline: true
        },
        {
      ]
      
      setBrokers(mockBrokers)
      setLoading(false)
    } catch (err) {
      setError('فشل في تحميل بيانات الوسطاء')
      setLoading(false)
    }
  }

  const handleProductClick = (product: Product) => {
    if (window.Telegram?.WebApp) {
      const message = `مرحباً، أنا مهتم بشراء ${product.title} بسعر ${product.price.toLocaleString()} دينار. هل لا يزال متوفراً؟`
      window.Telegram.WebApp.openTelegramLink(`https://t.me/Kharwaydo?text=${encodeURIComponent(message)}`)
    }
  }

  const handleBrokerClick = (broker: Broker) => {
    if (window.Telegram?.WebApp) {
      const message = `مرحباً ${broker.firstName}، أنا مهتم بالتعامل معك كوسيط موثوق. هل يمكنك مساعدتي؟`
      window.Telegram.WebApp.openTelegramLink(`https://t.me/${broker.username}?text=${encodeURIComponent(message)}`)
    }
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
        <div className="loading-text">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="main-container">
      {/* رأس الصفحة */}
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

      {/* بطاقة الرصيد */}
      <div className="balance-card">
        <div className="balance-label">رصيدك الحالي</div>
        <div className="balance-amount">
          {user.points.toLocaleString()} <span>XP</span>
        </div>
      </div>

      {/* تبويبات التنقل */}
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

      {/* محتوى التبويب النشط */}
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

      {/* تذييل الصفحة */}
      <div className="footer">
        <p>Developed By <span>Borhane</span></p>
      </div>
    </div>
  )
}
