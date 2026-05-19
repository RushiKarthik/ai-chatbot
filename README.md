# AI Chat - Full Stack AI SaaS Application

A modern AI-powered chatbot platform similar to ChatGPT with JWT authentication, email OTP verification, image analysis, and chat history. Built for portfolio and placement projects.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, React Router, Context API, CSS |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT, Email OTP, bcrypt |
| AI | Google Gemini API, Gemini Vision |

## Features

- **Authentication**: Register, Login, Email OTP verification, Forgot/Reset password
- **AI Chat**: ChatGPT-like UI, markdown responses, chat history, sidebar, copy button
- **Image Analysis**: Upload/drag-drop images, Gemini Vision analysis
- **Profile**: View and update user profile

## Project Structure

```
AICHATBOT/
├── backend/
│   ├── config/          # DB config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, upload, error handling
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── services/        # Gemini & email services
│   ├── utils/           # Helpers
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth context
│   │   ├── pages/       # All pages
│   │   ├── styles/      # CSS files
│   │   └── utils/       # API helpers
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Google Gemini API key
- Gmail account with App Password (for OTP emails)

---

## Setup Instructions

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. MongoDB Setup

**Option A - Local MongoDB:**
```bash
MONGO_URI=mongodb://localhost:27017/aichatbot
```

**Option B - MongoDB Atlas:**
1. Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Get connection string and set `MONGO_URI` in backend `.env`

### 3. Google Gemini API

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create an API key
3. Add to backend `.env` as `GEMINI_API_KEY`

### 4. Gmail OTP Setup

1. Enable 2FA on your Gmail account
2. Generate App Password: Google Account → Security → App passwords
3. Add to backend `.env`:
   ```
   EMAIL_USER=your@gmail.com
   EMAIL_PASS=your_16_char_app_password
   ```

### 5. Environment Files

**Backend** (`backend/.env`):
```env
MONGO_URI=mongodb://localhost:27017/aichatbot
JWT_SECRET=your_super_secret_jwt_key_change_this
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

Copy from example files:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

---

## Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs at `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
App opens at `http://localhost:5173`

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/resend-otp` | Resend OTP |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Send reset OTP |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/profile` | Get profile (protected) |
| PUT | `/api/auth/profile` | Update profile (protected) |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chats` | Get all chats |
| POST | `/api/chats` | Create chat |
| GET | `/api/chats/:id` | Get chat messages |
| DELETE | `/api/chats/:id` | Delete chat |
| POST | `/api/chats/:id/message` | Send text message |
| POST | `/api/chats/:id/image` | Send image message |

---

## Authentication Flow

1. **Register** → User enters name, email, password → OTP sent to email
2. **Verify OTP** → User enters 6-digit code → JWT token issued
3. **Login** → Email + password → JWT token stored in localStorage
4. **Protected Routes** → Token sent in `Authorization: Bearer` header
5. **Forgot Password** → OTP sent → User resets password with OTP

---

## Pages

1. **Home** - Landing page with features
2. **Login** - Email/password login
3. **Register** - Create account
4. **Verify OTP** - Email verification
5. **Forgot Password** - Request reset OTP
6. **Reset Password** - Set new password
7. **Dashboard** - User dashboard
8. **Chat** - Main AI chat interface
9. **Profile** - User profile settings
10. **404** - Not found page

---

## Interview Talking Points

- **JWT Auth**: Token stored in localStorage, sent via Authorization header
- **Protected Routes**: React Router wrapper checks auth context
- **OTP Flow**: 6-digit code generated, stored with expiry, sent via Nodemailer
- **Gemini Integration**: Text chat uses conversation history; Vision API for image analysis
- **MongoDB**: User and Chat collections with embedded message arrays
- **bcrypt**: Passwords hashed before storing in database

---

## License

MIT - Free to use for portfolio and learning.
