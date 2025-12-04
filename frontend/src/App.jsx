// src/App.jsx
import { useRef, useState } from "react";
import PoseCamera from "./PoseCamera";
import { getStats } from "./punchStats";
import ThreeDummy from "./ThreeDummy";

export default function App() {
  const videoRef = useRef(null);
  const [mode, setMode] = useState("coach");
  const [feedback, setFeedback] = useState("Waiting for pose...");
  const [scores, setScores] = useState({
    overall: 0,
    guard: 0,
    elbows: 0,
    stance: 0,
  });

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error starting webcam:", err);
      setFeedback("Could not access camera. Check permissions.");
    }
  };

  const stopWebcam = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const scoreToColor = (value) => {
    if (value >= 80) return "bg-green-500";
    if (value >= 60) return "bg-yellow-400";
    return "bg-red-500";
  };

  const ScoreBar = ({ label, value }) => (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-100 font-semibold">
          {Math.round(value)} / 100
        </span>
      </div>
      <div className="w-full h-2.5 bg-[#1b1d24] rounded-full overflow-hidden">
        <div
          className={`h-2.5 ${scoreToColor(value)} transition-all duration-300`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05060a] text-gray-100 flex flex-col items-center py-8 px-4">
      
      {/* Header */}
      <header className="w-full max-w-6xl text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-[0.25em] text-[#39ff14] drop-shadow-[0_0_14px_rgba(57,255,20,0.4)]">
          MMA POSE COACH
        </h1>

        <p className="mt-3 text-sm sm:text-base text-gray-400">
          Real-time analysis • Guard tracking • Shadowboxing AI
        </p>

        {/* Mode Switch */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => setMode("coach")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
              mode === "coach"
                ? "bg-[#39ff14] text-black"
                : "bg-[#111] border border-[#1b1d24] text-gray-400"
            }`}
          >
            Coach Mode
          </button>

          <button
            onClick={() => setMode("shadowboxing")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
              mode === "shadowboxing"
                ? "bg-[#39ff14] text-black"
                : "bg-[#111] border border-[#1b1d24] text-gray-400"
            }`}
          >
            Shadowboxing Mode
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="mt-8 w-full max-w-6xl flex flex-col lg:flex-row gap-6 items-stretch">

        {/* LEFT FEEDBACK */}
        <section className="lg:w-64 w-full bg-[#080a10] border border-[#1b1d24] rounded-2xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.9)] flex flex-col">
          <h2 className="text-sm font-semibold text-[#39ff14] tracking-wide uppercase">
            {mode === "coach" ? "Tracking" : "Shadowboxing"}
          </h2>

          <div className="mt-2 text-sm text-gray-300 min-h-[4rem] leading-relaxed">
            {feedback}
          </div>
        </section>

        {/* CENTER CAMERA */}
        <section className="flex-1 flex flex-col items-center">
          <div className="w-full bg-[#05060a] rounded-2xl shadow-[0_0_40px_rgba(0,0,0,1)] border border-[#151824] overflow-hidden">
            <PoseCamera
              videoRef={videoRef}
              mode={mode}
              setFeedback={setFeedback}
              setScores={setScores}
            />
          </div>

          {/* Controls */}
          <div className="mt-4 flex gap-4 justify-center">
            <button
              onClick={startWebcam}
              className="px-6 py-2.5 rounded-xl bg-[#15803d] hover:bg-[#16a34a] text-sm font-semibold shadow-lg shadow-green-900/30 transition"
            >
              Start Camera
            </button>

            <button
              onClick={stopWebcam}
              className="px-6 py-2.5 rounded-xl bg-[#b91c1c] hover:bg-[#dc2626] text-sm font-semibold shadow-lg shadow-red-900/30 transition"
            >
              Stop Camera
            </button>
          </div>
        </section>

        {/* RIGHT PANEL (COACH or SHADOWBOXING) */}
        {mode === "shadowboxing" ? (
          <aside className="lg:w-80 w-full h-[500px] bg-[#080a10] border border-[#1b1d24] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.9)]">
            <ThreeDummy active={true} />
          </aside>
        ) : (
          <aside className="lg:w-64 w-full bg-[#080a10] border border-[#1b1d24] rounded-2xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.9)] flex flex-col">
            <h2 className="text-sm font-semibold text-[#39ff14] tracking-wide uppercase">
              Form Scores
            </h2>
            <div className="mt-4">
              <ScoreBar label="Overall" value={scores.overall} />
              <ScoreBar label="Guard" value={scores.guard} />
              <ScoreBar label="Elbows" value={scores.elbows} />
              <ScoreBar label="Stance" value={scores.stance} />
            </div>
          </aside>
        )}

      </main>
    </div>
  );
}
