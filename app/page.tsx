:root {
  --primary-color: #6c5ce7;
  --primary-hover: #5649c0;
  --secondary-color: #a29bfe;
  --success-color: #00b894;
  --danger-color: #d63031;
  --warning-color: #fdcb6e;
  --info-color: #0984e3;
  --dark-bg: #121212;
  --darker-bg: #0a0a0a;
  --card-bg: #1e1e1e;
  --text-color: #f5f5f5;
  --text-muted: #b0b0b0;
  --border-radius: 16px;
  --box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  --transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  --glow-effect: 0 0 20px rgba(108, 92, 231, 0.3);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background-color: var(--dark-bg);
  color: var(--text-color);
  line-height: 1.7;
  min-height: 100vh;
}

.main-container {
  max-width: 1200px;
  padding: 20px;
  margin: 0 auto;
}

/* رأس الصفحة - تصميم فخم */
.user-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 25px;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  animation: fadeIn 0.8s ease-out;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--primary-color);
  box-shadow: var(--glow-effect);
  transition: var(--transition);
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(108, 92, 231, 0.5);
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-color);
  letter-spacing: 0.5px;
  margin-bottom: 5px;
}

.user-name span {
  color: var(--primary-color);
  text-shadow: 0 0 15px rgba(108, 92, 231, 0.5);
}

.user-username {
  font-size: 1.1rem;
  color: var(--text-muted);
  font-weight: 300;
  letter-spacing: 0.5px;
}

/* بطاقة الرصيد - تصميم ثلاثي الأبعاد */
.balance-card {
  background: linear-gradient(135deg, var(--primary-color), #8c7ae6);
  color: var(--text-color);
  padding: 30px;
  border-radius: var(--border-radius);
  margin-bottom: 30px;
  box-shadow: var(--box-shadow), var(--glow-effect);
  text-align: center;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.balance-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%);
  transform: rotate(30deg);
  z-index: -1;
  transition: var(--transition);
}

.balance-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(108, 92, 231, 0.5);
}

.balance-card:hover::before {
  transform: rotate(45deg) translate(10px, 10px);
}

.balance-label {
  font-size: 1.3rem;
  margin-bottom: 15px;
  opacity: 0.9;
  font-weight: 500;
  letter-spacing: 1px;
}

.balance-amount {
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: 1px;
  margin: 15px 0;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.balance-amount span {
  font-size: 1.5rem;
  font-weight: 600;
  margin-left: 5px;
}

/* تبويبات التنقل - تصميم أنيق */
.tabs-container {
  display: flex;
  justify-content: center;
  margin: 30px 0;
  gap: 15px;
  flex-wrap: wrap;
}

.tab-button {
  padding: 16px 35px;
  border: none;
  border-radius: 50px;
  background-color: var(--card-bg);
  color: var(--text-muted);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  font-size: 1.1rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.tab-button::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--primary-color);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.4s cubic-bezier(0.65, 0, 0.35, 1);
}

.tab-button.active {
  color: var(--text-color);
  background-color: rgba(108, 92, 231, 0.2);
}

.tab-button.active::after {
  transform: scaleX(1);
  transform-origin: left;
}

.tab-button:not(.active):hover {
  color: var(--text-color);
  background-color: rgba(255, 255, 255, 0.05);
}

/* شبكة المنتجات - تصميم فاخر */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.product-card {
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
  transition: var(--transition);
  cursor: pointer;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.product-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(108, 92, 231, 0.1) 0%, rgba(108, 92, 231, 0) 100%);
  opacity: 0;
  transition: var(--transition);
}

.product-card:hover {
  transform: translateY(-10px) scale(1.03);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), var(--glow-effect);
}

.product-card:hover::before {
  opacity: 1;
}

.product-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1/1;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.product-card:hover .product-image {
  transform: scale(1.1);
}

.product-badge {
  position: absolute;
  bottom: 15px;
  left: 15px;
  background-color: var(--primary-color);
  color: var(--text-color);
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.product-info {
  padding: 20px;
}

.product-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--primary-color);
  display: flex;
  align-items: center;
}

/* قائمة الوسطاء - تصميم مميز */
.brokers-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-bottom: 40px;
}

.broker-card {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 25px;
  display: flex;
  gap: 25px;
  box-shadow: var(--box-shadow);
  transition: var(--transition);
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
}

.broker-card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.5);
  border-color: rgba(108, 92, 231, 0.3);
}

.broker-avatar-container {
  position: relative;
  flex-shrink: 0;
}

.broker-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--primary-color);
  transition: var(--transition);
  box-shadow: var(--glow-effect);
}

.broker-card:hover .broker-avatar {
  transform: scale(1.1);
  box-shadow: 0 0 30px rgba(108, 92, 231, 0.7);
}

.online-status {
  position: absolute;
  bottom: 5px;
  right: 5px;
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.online-status.online {
  background-color: var(--success-color);
  color: var(--text-color);
  animation: pulse 2s infinite;
}

.online-status.offline {
  background-color: var(--secondary-color);
  color: var(--text-color);
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(0, 184, 148, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(0, 184, 148, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 184, 148, 0); }
}

.broker-info {
  flex-grow: 1;
}

.broker-name {
  margin: 0 0 10px 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.verified-badge {
  color: var(--primary-color);
  font-size: 1.2rem;
}

.broker-username {
  font-size: 1rem;
  color: var(--text-muted);
  font-weight: 400;
  letter-spacing: 0.5px;
}

.broker-description {
  margin: 15px 0 20px;
  font-size: 1.05rem;
  color: var(--text-muted);
  line-height: 1.6;
  font-weight: 300;
}

.contact-broker-button {
  background: linear-gradient(135deg, var(--primary-color), #8c7ae6);
  color: var(--text-color);
  border: none;
  border-radius: 50px;
  padding: 12px 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  letter-spacing: 0.5px;
  box-shadow: 0 5px 20px rgba(108, 92, 231, 0.3);
  position: relative;
  overflow: hidden;
}

.contact-broker-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: 0.5s;
}

.contact-broker-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(108, 92, 231, 0.5);
}

.contact-broker-button:hover::before {
  left: 100%;
}

/* حالات التحميل والخطأ - تصميم متحرك */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  text-align: center;
  animation: fadeIn 1s ease-out;
}

.loading-spinner {
  width: 70px;
  height: 70px;
  border: 6px solid rgba(108, 92, 231, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
  margin-bottom: 30px;
  box-shadow: 0 0 25px rgba(108, 92, 231, 0.3);
}

.loading-text {
  font-size: 1.5rem;
  color: var(--text-color);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.error-icon {
  font-size: 5rem;
  margin-bottom: 30px;
  color: var(--danger-color);
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-30px); }
  60% { transform: translateY(-15px); }
}

.error-message {
  font-size: 1.5rem;
  color: var(--text-color);
  margin-bottom: 30px;
  max-width: 80%;
  line-height: 1.6;
}

.retry-button {
  background: linear-gradient(135deg, var(--primary-color), #8c7ae6);
  color: var(--text-color);
  border: none;
  border-radius: 50px;
  padding: 16px 35px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  letter-spacing: 0.5px;
  box-shadow: 0 5px 25px rgba(108, 92, 231, 0.3);
}

.retry-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 35px rgba(108, 92, 231, 0.5);
}

/* تذييل الصفحة - تصميم أنيق */
.footer {
  text-align: center;
  padding: 40px 0;
  color: var(--text-muted);
  font-size: 1.1rem;
  letter-spacing: 0.5px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  margin-top: 50px;
}

.footer span {
  color: var(--primary-color);
  font-weight: 700;
  text-shadow: 0 0 15px rgba(108, 92, 231, 0.5);
}

/* تأثيرات النقر */
button:active, .product-card:active, .broker-card:active {
  transform: scale(0.98);
}

/* تأثيرات الحركة */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.products-grid, .brokers-list {
  animation: fadeIn 0.8s ease-out;
}

/* تصميم متجاوب */
@media (max-width: 992px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 20px;
  }
  
  .user-header {
    padding: 20px;
    flex-direction: column;
    text-align: center;
  }
  
  .user-avatar {
    width: 100px;
    height: 100px;
  }
  
  .broker-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .broker-avatar {
    width: 120px;
    height: 120px;
    margin-bottom: 20px;
  }
  
  .contact-broker-button {
    max-width: 250px;
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .tab-button {
    padding: 12px 25px;
    font-size: 1rem;
  }
  
  .balance-amount {
    font-size: 2.5rem;
  }
  
  .broker-card {
    padding: 20px;
  }
  
  .broker-avatar {
    width: 90px;
    height: 90px;
  }
  
  .broker-name {
    font-size: 1.3rem;
  }
}
