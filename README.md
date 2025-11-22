## Burnout Detector — Next.js + Python Backend Starter

This template is designed for building an AI-powered Employee Burnout Detection platform integrated with Hedera. It includes a Next.js frontend and a Python Flask backend.

## What’s included

* Next.js (App Router + TypeScript)
* Tailwind CSS
* API routes for prediction and Hedera interactions
* Optional Python Flask backend for real AI processing
* Mock predictor (used only if backend is not running)

---

## Quick Start

### 1. Frontend Setup (Next.js)

From the project root:

```bash
pip install -r requirements.txt
npm install
npm run dev
```

The frontend runs on:

```
http://localhost:3000
```

---

### 2. Backend Setup (Python Flask)

Open another terminal:

```bash
cd backend
py -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
py app.py
```

The backend runs on:

```
http://localhost:5000
```

---

### 3. Environment Variables

Create a `.env` file in the project root and paste the values provided in the additional info @ remarks you were given.

Ensure the file contains the correct environment variables for:

* FLASK_ENV
Controls Flask environment mode (development/production).

* FLASK_DEBUG
Enables or disables debug mode.

* DATABASE_URL
Connection string for the SQLite or other database.

* HEDERA_ACCOUNT_ID
Your Hedera Testnet account ID.

* HEDERA_PRIVATE_KEY
Private key for signing Hedera transactions.

* HEDERA_TOPIC_ID
Topic ID for message publishing on Hedera.

* API_URL
Backend URL used by the frontend (example: http://localhost:5000).

* GEMINI_API_KEY
API key used for the AI chatbot.

GMAIL_APP_PASSWORD
App password for Gmail SMTP email service.

Example structure:

```
# VorteX WellMind Environment Configuration
# Copy this to .env and fill in your credentials

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True

# Database
DATABASE_URL=sqlite:///wellmind.db


# Hedera Hashgraph (Testnet)
HEDERA_ACCOUNT_ID=0.0.7301840
HEDERA_PRIVATE_KEY=302e020100300506032b6570042204208e69ca93167c35bc45ab43cc23c1b31756dc1a645108da14357eeabc5d******
HEDERA_TOPIC_ID=0.0.7301961

# Frontend
REACT_APP_API_URL=http://localhost:5000

#AI CHATBOT
GEMINI_API_KEY = AIzaSyDy_ZqXxkbyUDAj1Hwfv4j89LVf6226***


#EMAIL SERVICE
GMAIL_APP_PASSWORD=mjlrwyafztopp***.
```
