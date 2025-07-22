<!-- BEGIN TALKMATE FRONTEND README -->

# 🎨 TalkMate Frontend

TalkMate Frontend is the **React + Vite + Tailwind** user interface for the TalkMate platform. It offers **live audio/video rooms**, real-time chat, subscription management, and an **admin dashboard** with charts and KPIs. Designed with **glassmorphism, dark mode, and responsive layouts** to make language learning **immersive and interactive**.

---

## 🚀 Elevator Pitch
TalkMate is a **futuristic language exchange platform** where users can join **live audio/video rooms** to practice speaking with real people. The frontend provides:

- Real-time **audio/video grid UI** (up to 6 participants in mesh mode).
- **Premium features**: private rooms, video calls, and user XP stats.
- **Subscription management** (Razorpay integration).
- **Modern admin dashboards** with charts, user management, and reports.

---

## 🛠 Features
- **Real-time Rooms:** Connect to Django Channels WebSockets for signaling.
- **WebRTC Audio/Video:** Mesh peer connections (planned upgrade to MediaSoup SFU).
- **Chat System:** Live chat with message persistence.
- **Premium Gate:** Video & private room access only for premium users.
- **Admin Panel:** Charts (Chart.js), user & room management, subscriptions.
- **Authentication:** JWT handling with Redux Persist + Google OAuth.
- **Responsive UI:** Built with Tailwind CSS and Radix UI components.
- **Animations:** Smooth transitions using Framer Motion.

---

## 🧰 Tech Stack
- **Framework:** React 19 + Vite
- **UI/Styling:** Tailwind CSS 3 + Tailwind Merge + Radix UI
- **State Management:** Redux Toolkit + Redux Persist
- **Forms & Validation:** React Hook Form + Zod
- **Charts:** Chart.js + react-chartjs-2
- **Animations:** Framer Motion
- **Auth:** JWT & Google OAuth
- **HTTP Client:** Axios
- **PDF Export:** jsPDF + jsPDF Autotable
- **Icons:** Lucide React
- **WebRTC:** Native `getUserMedia` + RTCPeerConnection

---

## 📊 Project Status
**In active development.**  
- **Video calls:** Working with WebRTC mesh (up to 6 participants).  
- **Hand raise toggle:** Bug fixes pending.  
- **Future plan:** Switch to MediaSoup SFU for better scalability.

---

## 📁 Project Structure
```
TALKMATE-FRONTEND/
├── public/                # Static files
├── src/
│   ├── components/        # UI components
│   ├── pages/             # Route-based pages
│   ├── features/          # Redux slices & state logic
│   ├── services/          # API services (Axios clients)
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Helper functions
│   ├── App.jsx            # Root app component
│   ├── main.jsx           # Entry point
│   └── styles/            # Global styles
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── README.md
```
## 🔗 Related Repositories
- [TalkMate Backend](https://github.com/Aswin1819/TALKMATE-BACKEND)

---

## ⚡ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Aswin1819/FTALKMATE.git
cd FTALKMATE
```

### 2. Install dependencies
```bash
npm install
```

---

### 3. Environment Variables
Copy `.env.example` to `.env` and fill the required values:

```bash
cp .env.example .env
```

**Example `.env.example`:**
```dotenv
# ============================
# TalkMate Frontend .env.example
# ============================

VITE_API_BASE_URL=http://localhost:8000/api/
VITE_WS_URL=ws://localhost:8000/ws/
VITE_GOOGLE_CLIENT_ID=todo.apps.googleusercontent.com
VITE_RAZORPAY_KEY_ID=rzp_test_todo
VITE_APP_ENV=development

# Optional:
VITE_CLOUDINARY_CLOUD_NAME=todo
VITE_ANALYTICS_KEY=todo
```
<!-- TODO: Add any additional environment variables required for dev/prod. -->

---

### 4. Run in development mode
```bash
npm run dev
```
The frontend will be available at:
```
http://localhost:5173
```

---

### 5. Build for production
```bash
npm run build
```
The compiled files will be in the `dist/` directory.

---

## 🔑 Key Features (UI Highlights)
- **Live Room UI:** Responsive video/audio grid with central audio cards.
- **Admin Dashboard:** KPIs, premium user stats, and subscription lists.
- **Theme:** Dark + neon purple gradients for a modern look.
- **Animations:** Smooth transitions (Framer Motion).

<!-- TODO: Add screenshot placeholders here (e.g., ![Live Room Screenshot](./screenshots/room.png)) -->

---

## 🧪 Tests
**Coming soon.**  
Planned test stack:
- React Testing Library
- Vitest or Jest
- Cypress for E2E testing

---

## 🎨 Design Notes
- **Radix UI:** Used for accessible components (dialogs, dropdowns).
- **Framer Motion:** Animates chat panels, video grid transitions.
- **Tailwind + Custom Colors:** Purple/Neon palettes aligned with TalkMate brand.

---

## 🤝 Contributing
Contributions welcome!  
1. Fork the repository.
2. Create a feature branch: `feature/<short-name>`.
3. Commit and push changes.
4. Open a Pull Request.

---

## 🚀 Deployment
**Planned:**  
- **Hosting:** Vercel (planned for production).  
- **Domain:** `https://talkmate.app` (to be confirmed).  

**Placeholder for manual deploy steps:**
- Configure `VITE_API_BASE_URL` to point to the live backend.
- Run `npm run build` and deploy the `dist/` folder to Vercel.

---

## 📬 Contact
Questions or feedback: **aswinachumathra@gmail.com**

---

## 📜 License
<!-- TODO: Choose license (MIT/Apache-2.0/etc.) -->
_If unsure, MIT is a good permissive default._

---

<!-- END TALKMATE FRONTEND README -->

