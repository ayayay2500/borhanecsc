'use client'

import { useEffect, useState, useCallback } from 'react'
import { WebApp } from '@twa-dev/types'
import './styles.css'
import Page1 from './page1'

declare global {
  interface Window {
    Telegram?: { WebApp: WebApp }
  }
}

type User = {
  telegramId: number
  firstName: string
  points: number
  photoUrl?: string
  username?: string
  status?: number
  banReason?: string
}

type Product = {
  id: number; 
  title: string; 
  price: number; 
  imageUrl: string; 
  category: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [activeTab, setActiveTab] = useState<'products' | 'tasks'>('products')
  const [loading, setLoading] = useState(true)
  const [isBanned, setIsBanned] = useState(false)

  // دالة جلب بيانات المستخدم من السيرفر
  const fetchUserData = useCallback(async (tgUser: any) => {
    try {
      setLoading(true);
      const res = await fetch('/api/increase-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tgUser),
      });

      if (!res.ok) throw new Error('فشل استجابة السيرفر');

      const data = await res.json();
      
      if (data.status === 1) {
        setIsBanned(true);
        setUser({ 
          telegramId: tgUser.id, 
          firstName: tgUser.first_name, 
          points: data.points || 0, 
          status: 1, 
          banReason: data.banReason 
        });
      } else {
        setUser({
          telegramId: tgUser.id,
          firstName: tgUser.first_name,
          username: tgUser.username,
          points: data.points || 0,
          photoUrl: tgUser.photo_url
        });
        fetchProducts();
      }
    } catch (err) {
      console.error("Fetch User Error:", err);
      setError('فشل الاتصال بالسيرفر. تأكد من إعدادات قاعدة البيانات.');
    } finally {
      // ضمان إيقاف التحميل مهما كانت النتيجة
      setLoading(false);
    }
  }, []);

  const fetchProducts = () => {
    const mockProducts: Product[] = [
      { id: 1, title: "حساب جواهر 5000 اندرويد", price: 170, imageUrl: "https://i.postimg.cc/4d0Vdzhy/New-Project-40-C022-BBD.png", category: "باونتي" },
      { id: 2, title: "حساب جواهر 5000 ايفون", price: 170, imageUrl: "https://i.postimg.cc/k51fQRb3/New-Project-40-321-E54-A.png", category: "باونتي" },
      { id: 3, title: "حساب جواهر + كوزان اندرويد", price: 200, imageUrl: "https://i.postimg.cc/fL1CF4C8/New-Project-40-FE9627-F.png", category: "باونتي" },
      { id: 4, title: "تحويل فليكسي", price: 50, imageUrl: "https://i.postimg.cc/9Q1p2w1R/New-Project-40-90-F0-A70.png", category: "تحويل" },
      { id: 5, title: "عضوية شهرية ", price: 600, imageUrl: "https://i.postimg.cc/DzZcwfYC/New-Project-40-8383-F74.png", category: "شحن" }
    ];
    setProducts(mockProducts);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      if (tg.initDataUnsafe?.user) {
        fetchUserData(tg.initDataUnsafe.user);
      } else {
        // في حال التجربة من المتصفح العادي وليس تليجرام
        setLoading(false);
        setError('يرجى فتح البوت من تطبيق تليجرام');
      }
    } else {
      setLoading(false);
    }
  }, [fetchUserData]);

  const handlePurchase = async (product: Product) => {
    const tg = window.Telegram?.WebApp;
    if (!user || !tg) return;

    if (user.points < product.price) {
      tg.showAlert(`رصيدك غير كافٍ! تحتاج إلى ${product.price} XP.`);
      return;
    }

    tg.showConfirm(`هل تود شراء ${product.title} مقابل ${product.price} XP؟`, async (confirmed) => {
      if (confirmed) {
        try {
          const res = await fetch('/api/increase-points', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              telegramId: user.telegramId, 
              action: 'purchase_product', 
              price: product.price 
            }),
          });
          const data = await res.json();

          if (data.success) {
            setUser(prev => prev ? { ...prev, points: data.newPoints } : null);
            tg.showAlert('✅ تم الخصم بنجاح! تواصل مع الإدارة لاستلام طلبك.');
            window.open(`https://t.me/Kharwaydo`, '_blank');
          } else {
            tg.showAlert('❌ فشل الخصم: ' + (data.message || 'خطأ غير معروف'));
          }
        } catch (e) {
          tg.showAlert('❌ حدث خطأ في الاتصال بالسيرفر');
        }
      }
    });
  };

  // شاشة الحظر
  if (isBanned) return <div className="banned-container">🚫 أنت محظور من استخدام المتجر. السبب: {user?.banReason}</div>;

  // شاشة التحميل (لن تظل عالقة بفضل finally)
  if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>جاري التحميل...</p></div>;

  return (
    <div className="main-container">
      {/* عرض الخطأ إن وجد */}
      {error && <div className="error-banner">{error}</div>}

      <div className="user-header">
        <img src={user?.photoUrl || 'https://via.placeholder.com/55'} className="user-avatar" alt="profile" />
        <div className="user-info">
          <h1 className="user-name">مرحباً، <span>{user?.firstName}</span>!</h1>
          <p className="user-username">@{user?.username || 'user'}</p>
        </div>
      </div>

      <div className="balance-card">
        <div className="balance-label">رصيدك الحالي</div>
        <div className="balance-amount">{user?.points.toLocaleString() || 0} <span>XP</span></div>
      </div>

      <div className="tabs-container">
        <button className={`tab-button ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>المنتجات</button>
        <button className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>الهدية اليومية</button>
      </div>

      {activeTab === 'products' ? (
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card" onClick={() => handlePurchase(product)}>
              <div className="product-image-container">
                <img src={product.imageUrl} alt={product.title} className="product-image" />
                <div className="product-badge">{product.category}</div>
              </div>
              <div className="product-info">
                <h3 className="product-title">{product.title}</h3>
                <div className="product-price">{product.price} XP</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Page1 />
      )}

      <div className="footer"><p>Developed By <span>Borhane San</span></p></div>
    </div>
  )
}
