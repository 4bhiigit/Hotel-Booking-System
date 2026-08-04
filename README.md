# Grand Hotel & Resort - Full Stack Hotel Booking System

A production-grade, highly polished, zero-error **Hotel Booking System** built with **FastAPI (Python)**, **MongoDB**, **React 18 (Vite)**, and **Tailwind CSS**. 

Designed to meet and exceed all specifications outlined in the project requirements PDF, including full user authentication, role-based access control (RBAC), room search & filtering, direct reservations, live analytics dashboard, PDF invoice generation, check-in QR code passes, and native AWS deployment guidelines.

---

## 🌟 Key Features

### 🔐 User & Security
- **JWT Authentication:** Secure user registration & login with JSON Web Tokens.
- **Password Encryption:** Bcrypt hashing via `passlib`.
- **Role-Based Access Control (RBAC):** Customer vs Admin permissions.
- **Profile Management:** Update personal info and change password.

### 🏨 Room Search & Catalog
- **Advanced Filtering:** Filter by room type (Single, Double, Deluxe, Suite, Presidential), price range slider, guest capacity, and search keywords.
- **Sorting Options:** Price low-to-high, high-to-low, highest rated, newly added.
- **Wishlist:** Save favorite luxury rooms to personal wishlist.
- **Detailed Suite Views:** Multi-photo gallery, amenities list, and instant price calculator.

### 📅 Booking & Check-In
- **Conflict Prevention:** Automatic date overlap validation preventing double bookings.
- **PDF Invoice Generation:** Instant downloadable PDF invoice with hotel letterhead and itemized costs via ReportLab.
- **QR Code Pass:** Instant Base64 QR code generation for digital front-desk check-in validation.
- **Demo Payment Modal:** Instant checkout workflow simulation.

### 📊 Admin Control Center
- **Analytics Overview:** Real-time metrics for total revenue, occupancy rate, total reservations, and active user count.
- **Revenue Visualization:** Monthly revenue progress charts and status breakdown.
- **Inventory Management (CRUD):** Add new rooms, edit prices/amenities, toggle availability, and delete listings.
- **Guest Reservations Management:** Approve bookings, check-in guests, check-out guests, or cancel reservations.

---

## 🛠️ Technology Stack

- **Backend:** FastAPI, Python 3.10+, Motor (Async MongoDB Driver), PyJWT / python-jose, Passlib (Bcrypt), ReportLab (PDF), Qrcode.
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React Icons, Axios, React Router v6.
- **Database:** MongoDB (Local or MongoDB Atlas).

---

## 📂 Project Structure

```
FSWP/
├── backend/
│   ├── app/
│   │   ├── config/          # Configuration & settings
│   │   ├── database/        # Async Motor connection & seed script
│   │   ├── models/          # MongoDB document helpers
│   │   ├── schemas/         # Pydantic request & response schemas
│   │   ├── services/        # Authentication & dependency logic
│   │   ├── utils/           # Security, PDF generator & QR generator
│   │   └── routes/          # REST API endpoints (Auth, Rooms, Bookings, Wishlist, Analytics)
│   ├── main.py              # FastAPI app entry point
│   ├── requirements.txt     # Python backend dependencies
│   └── .env.example         # Environment template
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Navbar, Footer, RoomCard, FilterBar, BookingModal, Toast, etc.)
│   │   ├── context/         # AuthContext & ThemeContext
│   │   ├── hooks/           # useAuth & useToast
│   │   ├── layouts/         # MainLayout & AdminLayout
│   │   ├── pages/           # Home, Rooms, RoomDetail, Login, Register, Profile, UserBookings, Wishlist, Admin pages
│   │   ├── services/        # Axios API instance
│   │   ├── App.jsx          # Route declarations
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- MongoDB running locally on `mongodb://localhost:27017` OR MongoDB Atlas connection string.

### 1. Backend Setup
```bash
cd backend

# Create virtual environment (optional)
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI Uvicorn dev server
uvicorn main:app --reload --port 8000
```
- Interactive API Documentation (Swagger UI): `http://localhost:8000/docs`

> **Note:** On server startup, MongoDB auto-seeds sample luxury hotel rooms, default admin credentials (`admin@grandhotel.com` / `Admin@123`), and sample customer account (`user@example.com` / `User@123`).

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
- Open `http://localhost:5173` in your browser.

---

## ☁️ Industry-Level AWS Deployment Guide

To deploy this application natively to AWS EC2:

### Step 1: Launch an AWS EC2 Instance
1. Launch an Ubuntu 22.04 LTS instance on AWS EC2 (t3.small or t3.medium recommended).
2. Configure Security Group inbound rules:
   - Port 22 (SSH)
   - Port 80 (HTTP)
   - Port 443 (HTTPS)
   - Port 8000 (FastAPI API, optional if proxied through Nginx)

### Step 2: Server Dependencies Installation
Connect via SSH and install Python, Node.js, and Nginx:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv nginx git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Step 3: Configure Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Obtain connection URI: `mongodb+srv://<username>:<password>@cluster.mongodb.net/hotel_db?retryWrites=true&w=majority`.
3. Set environment variable in `backend/.env`:
   ```env
   MONGODB_URL="your-mongodb-atlas-uri"
   JWT_SECRET_KEY="your-production-secret-key"
   ```

### Step 4: Setup Backend Systemd Service
Create systemd service `/etc/systemd/system/hotel-backend.service`:
```ini
[Unit]
Description=Hotel Booking FastAPI Backend Service
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/FSWP/backend
ExecStart=/home/ubuntu/FSWP/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
```
Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable hotel-backend
sudo systemctl start hotel-backend
```

### Step 5: Build Frontend & Configure Nginx Reverse Proxy
1. Build static production assets:
   ```bash
   cd /home/ubuntu/FSWP/frontend
   npm run build
   ```
2. Configure Nginx `/etc/nginx/sites-available/default`:
   ```nginx
   server {
       listen 80;
       server_name your-domain-or-ec2-ip;

       # Serve React Frontend Build
       location / {
           root /home/ubuntu/FSWP/frontend/dist;
           index index.html;
           try_files $uri $uri/ /index.html;
       }

       # Proxy API requests to FastAPI
       location /api/ {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```
3. Restart Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Step 6: Enable HTTPS with SSL (Certbot)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🏆 Viva & Demonstration Checklist
- [x] **User Registration & Login:** JWT Token generation & encrypted password hashing.
- [x] **Role-Based Control:** Separate Customer & Admin privileges.
- [x] **Dynamic Search & Filtering:** Filter by category, guest capacity, price range, and search keyword.
- [x] **PDF Invoices:** Downloadable reservation invoices with QR validation code.
- [x] **Admin Analytics:** Live revenue chart & room inventory CRUD management.
- [x] **Zero Errors:** Production build verified with Vite and FastAPI OpenAPI standard.
