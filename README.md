# ⚡ AirLink Files

![Project Status](https://img.shields.io/badge/Status-Production-success)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%2014%20|%20WebRTC%20|%20Supabase-blue)
![License](https://img.shields.io/badge/License-MIT-purple)

**AirLink Files** is a high-performance, Peer-to-Peer (P2P) file sharing application that allows users to send files of **unlimited size** directly between devices without storing them on a server.

It features a modern glassmorphism UI, a real-time "Whisper Chat" for secure communication, and a robust mobile-first architecture that works even on strict 4G/5G networks.

🔗 **Live Demo:** https://airlink-files.vercel.app/ 

---

## ✨ Key Features

- **🚀 Serverless P2P Transfer:** Files stream directly from Sender to Receiver using WebRTC. No intermediate storage means no file size limits and $0 storage costs.
- **📱 Mobile-First Architecture:** Custom responsive layout with a "Slide-Over" menu for mobile, featuring QR Code scanning for instant pairing.
- **🔐 End-to-End Privacy:** Data never touches a database. Chat history and file logs vanish on refresh.
- **💬 Whisper Chat:** Integrated real-time messaging using ephemeral Data Channels (no database required).
- **🌐 Network Traversal:** Implements STUN/TURN servers (via Metered.ca) to bypass strict corporate firewalls and CGNAT (Mobile Data).
- **📜 Local History:** Persists transfer logs (Sent/Received) using LocalStorage so users can track their activity.
- **🎨 Modern UI:** Built with Tailwind CSS, Framer Motion animations, and Sonner toast notifications.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Framer Motion
- **Core Protocol:** WebRTC (RTCPeerConnection & RTCDataChannel)
- **Signaling Server:** Supabase Realtime (WebSockets)
- **NAT Traversal:** Metered.ca (TURN Server)
- **Icons:** Lucide React
- **Deployment:** Vercel

---

## ⚙️ Architecture

AirLink uses a **Mesh Networking** approach:

1.  **Signaling (The Handshake):** Two clients connect to a `Supabase` channel to exchange "Offer" and "Answer" SDP (Session Description Protocol) packets.
2.  **Traversal (The Path):** Google STUN servers identify public IPs. If Direct P2P fails (e.g., on 4G), a TURN relay handles the traffic.
3.  **Data Channel (The Pipe):** Once connected, Supabase disconnects. A direct `RTCDataChannel` opens.
4.  **Streaming:** Files are sliced into **16KB chunks** and streamed sequentially to prevent browser memory overflow (Backpressure handling included).

---

