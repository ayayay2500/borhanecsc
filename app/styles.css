/* أساسيات الصفحة */
:root {
  --primary-color: #4a6bff;
  --secondary-color: #ff7e5f;
  --dark-color: #2c3e50;
  --light-color: #f5f7fa;
  --success-color: #2ecc71;
  --warning-color: #f39c12;
  --danger-color: #e74c3c;
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background-color: #f9f9f9;
  color: #333;
  line-height: 1.6;
}

.main-container {
  max-width: 100%;
  padding: 20px;
  margin: 0 auto;
}

/* رأس الصفحة */
.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  animation: fadeIn 0.8s ease;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--primary-color);
  box-shadow: var(--shadow);
}

.user-info {
  margin-left: 15px;
}

.user-name {
  font-size: 1.4rem;
  color: var(--dark-color);
  font-weight: 700;
}

.user-name span {
  color: var(--primary-color);
}

.user-username {
  font-size: 0.9rem;
  color: #777;
  margin-top: 2px;
}

/* بطاقة الرصيد */
.balance-card {
  background: linear-gradient(135deg, var(--primary-color), #6a5acd);
  color: white;
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 30px;
  box-shadow: var(--shadow);
  transition: var(--transition);
  animation: slideUp 0.6s ease;
}

.balance-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(74, 107, 255, 0.3);
}

.balance-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 5px;
}

.balance-amount {
  font-size: 2rem;
  font-weight: 700;
}

.balance-amount span {
  font-size: 1rem;
  opacity: 0.8;
}

/* شبكة المنتجات */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: var(--transition);
  cursor: pointer;
  animation: fadeIn 0.8s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.product-image-container {
  position: relative;
  width: 100%;
  height: 140px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition);
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
}

.product-info {
  padding: 12px;
}

.product-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: var(--dark-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--primary-color);
}

/* تذييل الصفحة */
.footer {
  text-align: center;
  padding: 20px 0;
  color: #777;
  font-size: 0.9rem;
  border-top: 1px solid #eee;
  margin-top: 20px;
}

.footer span {
  color: var(--primary-color);
  font-weight: 600;
}

/* الرسائل والتحميل */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 20px;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  color: var(--danger-color);
}

.error-message {
  font-size: 1.1rem;
  margin-bottom: 20px;
  color: var(--dark-color);
}

.retry-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.retry-button:hover {
  background-color: #3a5bed;
  transform: translateY(-2px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-text {
  font-size: 1.1rem;
  color: var(--dark-color);
}

/* تأثيرات الحركة */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* تأثيرات اللمس للهواتف */
@media (hover: none) {
  .product-card:hover {
    transform: none;
    box-shadow: var(--shadow);
  }
  
  .balance-card:hover {
    transform: none;
    box-shadow: var(--shadow);
  }
}
