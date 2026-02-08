<div align="center">

# 🌊 Tidalense

### Global Tides. Personal Lens.

<p align="center">
  <b>Real-Time Water Quality Analysis & Global Monitoring System</b>
</p>

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Deployment](#deployment)

---

</div>

## 🚀 Overview

**Tidalense** is a cutting-edge platform designed to bring clarity to water quality at every scale. Whether you're tracking ocean currents across the globe or verifying the safety of the water bottle in your hand, Tidalense provides instant, AI-powered insights.

Our mission is to empower individuals and organizations with actionable data to make informed decisions about water safety and environmental health.

## ✨ Features

### 🌍 Global Water Map
Interactive, real-time visualization of water bodies worldwide.
- **Live Monitoring:** Track algae blooms, pollution levels, and temperature changes.
- **Data Integrations:** Seamlessly pulls data from trusted environmental APIs.
- **Predictive Analytics:** AI-driven forecasts for potential risks.

### 🔍 MicroScan AI
Your personal water quality detective.
- **Instant Analysis:** Point your camera at any water bottle or container.
- **AI Verification:** Advanced computer vision (OpenCV + TensorFlow) detects contaminants and verifies brand authenticity.
- **Safety Score:** Get an immediate "Safe" or "Unsafe" rating with detailed breakdowns.

### ⚡ Real-Time Risk Engine
The brain behind the operation.
- **Dynamic Scoring:** Calculates risk based on multiple factors (location, visual data, historical trends).
- **Alert System:** proactive notifications for detected hazards.

## 🛠️ Tech Stack

Built with a modern, high-performance stack for speed and scalability.

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![React](https://img.shields.io/badge/React-19-blue) | fast, server-side rendered UI. |
| **Styling** | ![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC) ![Shadcn](https://img.shields.io/badge/Shadcn-UI-000000) | Beautiful, accessible components. |
| **Maps** | ![Mapbox](https://img.shields.io/badge/Mapbox-GL-blueviolet) | High-performance interactive maps. |
| **Backend** | ![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688) | High-performance Python API. |
| **Database** | ![MongoDB](https://img.shields.io/badge/MongoDB-Motor-47A248) | Scalable NoSQL storage for geospatial data. |
| **AI / ML** | ![Gemini](https://img.shields.io/badge/Google-Gemini-4285F4) ![OpenCV](https://img.shields.io/badge/OpenCV-Computer_Vision-5C3EE8) | Advanced image processing and generative AI. |

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js** (v18+ recommended)
- **Python** (v3.10+)
- **MongoDB** (Local or Atlas URI)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/tidalense.git
    cd tidalense
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```

3.  **Setup Frontend**
    ```bash
    cd ../frontend
    npm install
    ```

4.  **Environment Variables**
    Create a `.env` file in `backend/` and `.env.local` in `frontend/` with your API keys (Mapbox, Gemini, MongoDB URI).

### Running Locally

**Start the Backend Server:**
```bash
# In /backend terminal
uvicorn app.main:app --reload
```
*Server running at http://localhost:8000*

**Start the Frontend Client:**
```bash
# In /frontend terminal
npm run dev
```
*Client running at http://localhost:3000*

## 📦 Deployment

### Frontend (Vercel)
The easiest way to deploy the Next.js frontend is to use the [Vercel Platform](https://vercel.com/new).
1. Push your code to GitHub.
2. Import the project into Vercel.
3. Add your environment variables.
4. Deploy!

### Backend (Render/Railway/Heroku)
Deploy the FastAPI backend to any cloud provider supporting Python.
- **Render/Railway:** Connect your repo, set the build command to `pip install -r requirements.txt` and start command to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

---

<div align="center">

Made with ❤️ by the Tidalense Team

</div>
