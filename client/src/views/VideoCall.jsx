// views/VideoCall.jsx
import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

const VideoCall = () => {
  const jitsiContainerRef = useRef(null);
  const { bookingId } = useParams(); // ✅ Get unique Room ID from URL
  const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const domain = "meet.jit.si";
    const options = {
      roomName: bookingId ? `MindMend-Session-${bookingId}` : "MindMendTherapyRoom" + Date.now(),
      parentNode: jitsiContainerRef.current,
      width: "100%",
      height: 600,
      userInfo: {
        displayName: user?.name || "User"
      },
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: true,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
      }
    };
    const api = new window.JitsiMeetExternalAPI(domain, options);

    return () => api?.dispose?.(); // Clean up on component unmount
  }, [bookingId]);

  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          🎥 Live Therapy Session
        </h2>
        <span className="bg-red-100 text-red-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
          ● Recording
        </span>
      </div>
      <div ref={jitsiContainerRef} className="rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900/5" />
    </div>
  );
};

export default VideoCall;
