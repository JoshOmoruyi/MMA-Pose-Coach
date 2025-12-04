# 🥊 MMA Pose Coach – Real-Time Combat Form Analyzer & Shadowboxing Trainer

MMA Pose Coach is a real-time computer vision project built with **TensorFlow.js**, **MoveNet**, and **React**.  
It analyzes combat stances, tracks joints, scores technique, detects punches, and provides a fully animated shadowboxing training mode with dynamic on-screen targets and punch trails.

This project is designed as both:
- A **technical portfolio project** demonstrating ML + real-time WebGL pose tracking  
- A **training tool** for fighters learning proper guard, rotation, and punch mechanics  

---

## 🚀 Features

### 🧠 **Coach Mode (Real-Time Form Analysis)**
- Shoulder rotation scoring  
- Hip rotation scoring  
- Elbow angle tracking  
- Guard & stance stability  
- Neon-style skeletal overlay  
- Responsive feedback panel  
- Smooth angle + pose filtering  

### 🥊 **Shadowboxing Mode**
- Tracks punch velocity for both wrists  
- Detects Jabs, Crosses, Hooks (basic classifier)  
- Dynamic punch trails (blue/orange gradients)  
- Impact sparks & hit effects  
- Optional animated 3D opponent dummy (Three.js)  
- Clean screen (no skeleton overlays)  
- Auto-scoring based on punch intensity  

### 🎨 Visual Effects
- Neon skeleton (coach mode)  
- Dynamic glow joints  
- Punch velocity trails  
- Contact sparks  
- Target zones (head/body/leg – optional)  

### 🏗️ Built With
- **React + Vite**
- **TensorFlow.js**
- **MoveNet Thunder**
- **Three.js** (for animated dummy)
- **TailwindCSS**
- **WebGL backend**

---

## 📸 Demo Preview

(*Add GIF or screenshots here once you push them to GitHub*)

---

## 🛠️ Installation

### 1. Clone the repo
```bash
git clone https://github.com/JoshOmoruyi/MMA-Pose-Coach.git
cd MMA-Pose-Coach
2. Install dependencies
bash
Copy code
npm install
3. Start development server
bash
Copy code
npm run dev
🧩 Project Structure
arduino
Copy code
/src
  ├── PoseCamera.jsx
  ├── poseAnalysis.js
  ├── PoseDetector.js
  ├── drawAngles.js
  ├── drawRotation.js
  ├── punchTracker.js
  ├── punchClassifier.js
  ├── shadowboxingEngine.js
  ├── ThreeDummy.jsx (optional 3D opponent)
  └── App.jsx
🔍 Technical Highlights (Deep-Dive)
✨ Real-Time Pose Estimation
Movenet Thunder with EMA smoothing

Per-frame keypoint interpolation

Stable angle calculations (NaN-safe)

✨ Form Analysis Engine
Computes biomechanical angles

Scores user’s posture

Multi-level conditional feedback system

✨ Punch Detection System
Calculates wrist velocity

Identifies punch type from:

Wrist direction vector

Shoulder/hip alignment

Angular change per frame

Supports future extension → hooks, uppercuts, kicks

✨ Shadowboxing Rendering Layer
GPU-accelerated canvas

Animated trails

Hit spark particle system

📝 Roadmap (Planned Features)
AI opponent with movement

Combo detection (jab–cross–hook chains)

Round timer + scoring system

Mobile version

Pose correction heatmaps

📄 License
MIT License

