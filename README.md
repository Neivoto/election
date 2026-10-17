# 🗳️ Fast & Mobile-First Student Election Web App

A clean, responsive online voting application designed for student elections (200-300 voters), hosted on **Vercel** with zero-database setup required using **Vercel KV (Redis)**.

---

## ⚡ Features

- 📱 **Mobile-First Voter Portal**: Clean UI optimized for smartphones & QR code scanning.
- 🔒 **One Vote Per Student ID**: Strict verification preventing duplicate voting per student ID.
- 🛠️ **Admin Panel**: Manage positions, candidates, and live election status (Start/Pause/End).
- 📊 **Live Results & CSV Export**: Real-time tally visualization with instant CSV export.
- 📲 **Instant QR Code**: Auto-generated shareable QR code for students to scan and vote.
- 🚀 **Concurrency-Safe**: Built on Next.js serverless and Vercel KV to handle simultaneous voting spikes.

---

## 🚀 Quick Setup & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env.local` file in the root folder:
```env
ADMIN_PASSWORD="admin" # Set your preferred admin password
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Vercel (Production)

1. Push this project folder to your **GitHub repository**.
2. Go to [Vercel.com](https://vercel.com) and click **Add New Project** -> Import your GitHub repo.
3. In the Vercel Dashboard for your project, go to the **Storage** tab.
4. Click **Create Database** -> Select **KV (Redis)** -> Connect to your project.
5. In **Environment Variables**, add:
   - `ADMIN_PASSWORD`: Your secret admin password (e.g. `admin123`).
6. Click **Deploy**!
