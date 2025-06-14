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
  id: number
  firstName: string
  lastName?: string
  username?: string
  balance: number
  photoUrl?: string
}

type Product = {
  id: number
  name: string
  price: number
  imageUrl: string
  description: string
  category: string
}

type Mediator = {
  id: number
  username: string
  name: string
  photoUrl: string
  rating: number
  specialty: string
  description: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'mediators' | 'products'>('mediators')
  const [products, setProducts] = useState<Product[]>([])
  const [mediators, setMediators] = useState<Mediator[]>([])
  const [loading, setLoading] = useState(true)
  const [purchaseStatus, setPurchaseStatus] = useState<{success: boolean, message: string} | null>(null)

  // تحميل البيانات الأولية
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()

      const initDataUnsafe = tg.initDataUnsafe || {}
      
      if (initDataUnsafe.user) {
        fetchUserData(initDataUnsafe.user)
        loadMediators()
        loadProducts()
      } else {
        setError('لا توجد بيانات مستخدم متاحة')
      }
    } else {
      setError('الرجاء فتح البوت عبر Telegram')
    }
  }, [])

  const fetchUserData = useCallback(async (tgUser: any) => {
    try {
      // في الواقع ستكون هذه استجابة من الخادم
      setUser({
        id: tgUser.id,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        username: tgUser.username,
        balance: 5000, // رصيد افتراضي
        photoUrl: tgUser.photo_url
      })
      setLoading(false)
    } catch (err) {
      setError('فشل في تحميل بيانات المستخدم')
      setLoading(false)
    }
  }, [])

  const loadMediators = async () => {
    // بيانات وهمية للوسطاء
    const mockMediators: Mediator[] = [
      {
        id: 1,
        username: "Kharwaydo",
        name: "بورحان الدين",
        photoUrl: "https://randomuser.me/api/portraits/men/1.jpg",
        rating: 4.9,
        specialty: "وسيط معتمد",
        description: "وسيط معتمد في مجال العقارات والتجارة الإلكترونية بخبرة 5 سنوات"
      },
      {
        id: 2,
        username: "Mediator2",
        name: "أحمد محمد",
        photoUrl: "https://randomuser.me/api/portraits/men/2.jpg",
        rating: 4.7,
        specialty: "وسيط سياحي",
        description: "متخصص في حجوزات الفنادق والطيران بأسعار مميزة"
      },
      {
        id: 3,
        username: "Mediator3",
        name: "سارة علي",
        photoUrl: "https://randomuser.me/api/portraits/women/1.jpg",
        rating: 4.8,
        specialty: "وسيط تجاري",
        description: "وسيط معتمد لشراء وبيع المنتجات التجارية بضمان"
      }
    ]
    setMediators(mockMediators)
  }

  const loadProducts = async () => {
    // بيانات وهمية للمنتجات
    const mockProducts: Product[] = [
      {
        id: 1,
        name: "دورة التسويق الإلكتروني",
        price: 2000,
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        description: "دورة متكاملة لتعلم أساسيات التسويق الإلكتروني وكسب المال",
        category: "تعليمي"
      },
      {
        id: 2,
        name: "برنامج إدارة المحتوى",
        price: 1500,
        imageUrl: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        description: "برنامج متكامل لإدارة المحتوى والتخطيط للنشر",
        category: "برمجيات"
      },
      {
        id: 3,
        name: "قوالب موقع إلكتروني",
        price: 1000,
        imageUrl: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        description: "مجموعة قوالب جاهزة لمواقع إلكترونية متنوعة",
        category: "تصميم"
      }
    ]
    setProducts(mockProducts)
  }

  const contactMediator = (mediatorUsername: string) => {
    if (window.Telegram?.WebApp) {
      const message = `مرحباً، أنا مهتم بالتعامل معك كوسيط. هل يمكنك مساعدتي؟`
      window.Telegram.WebApp.openTelegramLink(`https://t.me/${mediatorUsername}?text=${encodeURIComponent(message)}`)
    }
  }

  const purchaseProduct = async (product: Product) => {
    if (!user) return
    
    // التحقق من الرصيد الكافي
    if (user.balance < product.price) {
      setPurchaseStatus({success: false, message: "رصيدك غير كافي لشراء هذا المنتج"})
      setTimeout(() => setPurchaseStatus(null), 3000)
      return
    }
    
    try {
      // هنا سيتم إرسال طلب الشراء للخادم
      // وفي الواقع ستكون هذه استجابة من الخادم
      const newBalance = user.balance - product.price
      setUser({...user, balance: newBalance})
      
      setPurchaseStatus({
        success: true, 
        message: `تم خصم ${product.price} دينار من رصيدك لشراء ${product.name}`
      })
      setTimeout(() => setPurchaseStatus(null), 3000)
      
      // إرسال إشعار للمستخدم
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert(`تمت عملية الشراء بنجاح! ستستلم ${product.name} قريباً`)
      }
    } catch (err) {
      setPurchaseStatus({success: false, message: "حدث خطأ أثناء عملية الشراء"})
      setTimeout(() => setPurchaseStatus(null), 3000)
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
          <div className="user-balance">
            رصيدك: <span>{user.balance.toLocaleString()} DA</span>
          </div>
        </div>
      </div>

      {/* أقسام التطبيق */}
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'mediators' ? 'active' : ''}`}
          onClick={() => setActiveTab('mediators')}
        >
          الوسطاء المتاحين
        </button>
        <button 
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          منتجاتي الرقمية
        </button>
      </div>

      {/* قسم الوسطاء */}
      {activeTab === 'mediators' && (
        <div className="mediators-list">
          {mediators.map(mediator => (
            <div key={mediator.id} className="mediator-card">
              <div className="mediator-header">
                <img
                  src={mediator.photoUrl}
                  alt={mediator.name}
                  className="mediator-avatar"
                />
                <div className="mediator-info">
                  <h3 className="mediator-name">{mediator.name}</h3>
                  <div className="mediator-username">@{mediator.username}</div>
                  <div className="mediator-rating">
                    <span className="stars">{"★".repeat(Math.floor(mediator.rating))}</span>
                    <span className="rating-value">{mediator.rating}</span>
                  </div>
                  <div className="mediator-specialty">{mediator.specialty}</div>
                </div>
              </div>
              <div className="mediator-description">
                {mediator.description}
              </div>
              <button 
                className="contact-button"
                onClick={() => contactMediator(mediator.username)}
              >
                طلب الوسيط
              </button>
            </div>
          ))}
        </div>
      )}

      {/* قسم المنتجات */}
      {activeTab === 'products' && (
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="product-image"
                />
                <div className="product-price">{product.price.toLocaleString()} DA</div>
              </div>
              <div className="product-details">
                <h3 className="product-name">{product.name}</h3>
                <div className="product-category">{product.category}</div>
                <p className="product-description">{product.description}</p>
                <button 
                  className="buy-button"
                  onClick={() => purchaseProduct(product)}
                  disabled={user.balance < product.price}
                >
                  شراء الآن
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* رسالة حالة الشراء */}
      {purchaseStatus && (
        <div className={`purchase-message ${purchaseStatus.success ? 'success' : 'error'}`}>
          {purchaseStatus.message}
        </div>
      )}

      {/* تذييل الصفحة */}
      <div className="footer">
        <p>نظام الوسطاء والمنتجات الرقمية</p>
        <p>Developed By <span>Borhane</span></p>
      </div>
    </div>
  )
}
