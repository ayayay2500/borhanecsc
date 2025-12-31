'use client'

import { useEffect, useState } from 'react'
import './styles.css'
import Page1 from './page1'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'products' | 'tasks'>('products')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initApp = async () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        tg.ready()
        tg.expand()

        const userData = tg.initDataUnsafe?.user
        if (userData) {
          try {
            const res = await fetch('/api/increase-points', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userData),
            })
            const data = await res.json()
            setUser({ ...userData, points: data.points || 0 })
          } catch (e) {
            setUser({ ...userData, points: 0 })
          }
        }
      }
      setLoading(false)
    }
    initApp()
  }, [])

  const products = [
    { id: 1, title: "حساب جواهر 5000 اندرويد", price: 170, imageUrl: "https://i.postimg.cc/4d0Vdzhy/New-Project-40-C022-BBD.png", category: "باونتي" },
    { id: 2, title: "حساب جواهر 5000 ايفون", price: 170, imageUrl: "https://i.postimg.cc/k51fQRb3/New-Project-40-321-E54-A.png", category: "باونتي" },
    { id: 3, title: "تحويل فليكسي", price: 50, imageUrl: "https://i.postimg.cc/9Q1p2w1R/New-Project-40-90-F0-A70.png", category: "تحويل" },
  ]

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div></div>

  return (
    <div className="main-container">
      <div className="user-header">
        <div className="user-avatar-container">
            <img src={user?.photo_url || 'https://via.placeholder.com/55'} className="user-avatar" alt="profile" />
        </div>
        <div className="user-info">
          <h1 className="user-name">مرحباً، <span>{user?.first_name || 'User'}</span>!</h1>
          <p className="user-username">@{user?.username || 'Guest'}</p>
        </div>
      </div>

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
          {products.map(p => (
            <div key={p.id} className="product-card">
              <div className="product-image-container">
                <img src={p.imageUrl} className="product-image" />
                <span className="product-badge">{p.category}</span>
              </div>
              <div className="product-info">
                <h3>{p.title}</h3>
                <p>{p.price} XP</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Page1 />
      )}
    </div>
  )
}
