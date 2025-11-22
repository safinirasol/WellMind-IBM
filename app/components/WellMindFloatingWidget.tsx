"use client";

import { useEffect, useState } from "react";

export default function WellMindFloatingWidget({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [isOpen, setIsOpen] = useState(open);
  const [isLoading, setIsLoading] = useState(true);

  // Preload the Watson script on component mount
  useEffect(() => {
    const preloadScript = () => {
      if ((window as any).wxoLoader) {
        setIsLoading(false);
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://ap-southeast-1.dl.watson-orchestrate.ibm.com/wxochat/wxoLoader.js?embed=true";
      script.async = true;

      script.onload = () => {
        setIsLoading(false);
      };

      script.onerror = () => {
        console.error("Failed to load Watson Agent script");
        setIsLoading(false);
      };

      document.head.appendChild(script);
    };

    preloadScript();
  }, []);

  // Initialize agent when widget opens
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);

    (window as any).wxOConfiguration = {
      orchestrationID:
        "20251122-1414-1898-608f-76b80d3d94bb_20251122-1415-2862-203e-820f3992862f",
      hostURL: "https://ap-southeast-1.dl.watson-orchestrate.ibm.com",
      rootElementID: "wxo-floating-panel",
      chatOptions: {
        agentId: "b0018750-9021-43a6-b70f-cf7a41e89aa9",
      },
    };

    const initAgent = () => {
      if ((window as any).wxoLoader) {
        (window as any).wxoLoader.init();
        setIsLoading(false);
      } else {
        setTimeout(initAgent, 100);
      }
    };

    initAgent();
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.35)",
          zIndex: 9998,
        }}
        onClick={onClose}
      />

      {/* Watson Agent Chat Panel */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "380px",
          height: "520px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0px 8px 20px rgba(0,0,0,0.25)",
          overflow: "hidden",
          zIndex: 9999,
          animation: "fadeIn 0.3s ease-out",
        }}
      >
        {isLoading ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f8fafc",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "4px solid #e2e8f0",
                  borderTop: "4px solid #2563eb",
                  borderRadius: "50%",
                  margin: "0 auto 12px",
                  animation: "spin 1s linear infinite",
                }}
              />
              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Loading WellMind Agent...
              </p>
            </div>
          </div>
        ) : (
          <div id="wxo-floating-panel" style={{ width: "100%", height: "100%" }} />
        )}

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </>
  );
}
