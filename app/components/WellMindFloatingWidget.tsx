"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function WellMindFloatingWidget({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Only auto-scroll when new messages are added
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]); // Changed from [messages] to [messages.length]

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message immediately
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      // Add assistant response
      setMessages([...newMessages, { 
        role: "assistant" as const, 
        content: data.reply || data.message || "I'm here to help with your wellness." 
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([...newMessages, {
        role: "assistant" as const,
        content: "I apologize, I'm having trouble connecting right now. Please try again in a moment.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!open || !mounted) return null;

  const content = (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
          zIndex: 9998,
          animation: "fadeIn 0.2s ease-out",
        }}
      />

      {/* Chat Modal */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "480px",
          height: "680px",
          maxHeight: "calc(100vh - 40px)",
          borderRadius: "12px",
          overflow: "hidden",
          zIndex: 9999,
          background: "white",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.3s ease-out",
          border: "1px solid #e0e0e0",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            background: "white",
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "20px",
                color: "#525252",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
              }}
            >
              ←
            </button>
            <h3 style={{ margin: 0, fontWeight: 600, fontSize: "16px", color: "#161616" }}>
              Preview
            </h3>
          </div>
          <button
            style={{
              background: "#0f62fe",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              color: "white",
              padding: "6px 14px",
              borderRadius: "4px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "16px" }}>🤖</span>
            AI
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 20px",
            background: "#f4f4f4",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {messages.length === 0 && (
            <div style={{ textAlign: "left", color: "#161616" }}>
              <div style={{ fontSize: "13px", color: "#525252", marginBottom: "12px" }}>
                9:13 PM
              </div>
              <div style={{ 
                background: "white",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                marginBottom: "20px",
              }}>
                <h4 style={{ margin: "0 0 12px 0", color: "#161616", fontSize: "18px", fontWeight: 400, lineHeight: "1.4" }}>
                  Hi there, I'm here to support your well-being at work. If you're feeling stressed, overwhelmed, demo
                </h4>
                <p style={{ margin: 0, fontSize: "13px", color: "#525252", lineHeight: "1.5" }}>
                  Accuracy of generated answers may vary. Please double-check responses.
                </p>
              </div>
              
              {/* Suggestion Cards */}
              <div 
                className="suggestion-cards-container"
                style={{ 
                  display: "flex", 
                  gap: "12px",
                  overflowX: "auto",
                  paddingBottom: "8px",
                }}
              >
                <button
                  onClick={() => setInput("I just want to talk about my day")}
                  style={{
                    minWidth: "200px",
                    padding: "16px",
                    background: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#161616",
                    textAlign: "left",
                    transition: "all 0.2s",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#0f62fe";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e0e0e0";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.04)";
                  }}
                >
                  <div>I just want to talk about my day</div>
                  <div style={{ marginTop: "8px", color: "#0f62fe", fontSize: "18px" }}>→</div>
                </button>
                
                <button
                  onClick={() => setInput("I'm having trouble focusing")}
                  style={{
                    minWidth: "200px",
                    padding: "16px",
                    background: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#161616",
                    textAlign: "left",
                    transition: "all 0.2s",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#0f62fe";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e0e0e0";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.04)";
                  }}
                >
                  <div>I'm having trouble focusing</div>
                  <div style={{ marginTop: "8px", color: "#0f62fe", fontSize: "18px" }}>→</div>
                </button>

                <button
                  onClick={() => setInput("I need advice about balancing my workload")}
                  style={{
                    minWidth: "200px",
                    padding: "16px",
                    background: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#161616",
                    textAlign: "left",
                    transition: "all 0.2s",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#0f62fe";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e0e0e0";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.04)";
                  }}
                >
                  <div>I need advice about balancing my workload</div>
                  <div style={{ marginTop: "8px", color: "#0f62fe", fontSize: "18px" }}>→</div>
                </button>
              </div>

              {/* Pagination */}
              <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center",
                gap: "16px",
                marginTop: "20px",
                fontSize: "13px",
                color: "#525252",
              }}>
                <button style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#525252",
                  fontSize: "16px",
                }}>←</button>
                <span>1/2</span>
                <button style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#525252",
                  fontSize: "16px",
                }}>→</button>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx}>
              {idx === 0 && (
                <div style={{ fontSize: "13px", color: "#525252", marginBottom: "12px" }}>
                  {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  animation: "messageSlide 0.3s ease-out",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "14px 16px",
                    borderRadius: "8px",
                    background: msg.role === "user" ? "#0f62fe" : "white",
                    color: msg.role === "user" ? "white" : "#161616",
                    boxShadow: msg.role === "user" 
                      ? "0 2px 6px rgba(15, 98, 254, 0.2)"
                      : "0 2px 6px rgba(0,0,0,0.06)",
                    wordWrap: "break-word",
                    lineHeight: "1.5",
                    fontSize: "14px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "8px",
                  background: "white",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                  display: "flex",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#8d8d8d",
                    animation: "bounce 1.4s infinite ease-in-out both",
                    animationDelay: "0s",
                  }}
                />
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#8d8d8d",
                    animation: "bounce 1.4s infinite ease-in-out both",
                    animationDelay: "0.16s",
                  }}
                />
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#8d8d8d",
                    animation: "bounce 1.4s infinite ease-in-out both",
                    animationDelay: "0.32s",
                  }}
                />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: "16px 20px",
            background: "white",
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type something..."
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px 14px",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              fontSize: "14px",
              outline: "none",
              transition: "border-color 0.2s",
              opacity: loading ? 0.6 : 1,
              color: "#161616",
              background: loading ? "#f4f4f4" : "white",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#0f62fe")}
            onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
          />
          <button
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              color: "#525252",
              fontSize: "20px",
            }}
          >
            🎤
          </button>
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              padding: "8px 16px",
              background: loading || !input.trim() ? "#e0e0e0" : "#0f62fe",
              color: loading || !input.trim() ? "#8d8d8d" : "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              fontSize: "18px",
              fontWeight: 500,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              if (!loading && input.trim()) {
                e.currentTarget.style.background = "#0050e6";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && input.trim()) {
                e.currentTarget.style.background = "#0f62fe";
              }
            }}
          >
            ▶
          </button>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes messageSlide {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-8px); }
          }

          /* Custom scrollbar for suggestion cards */
          .suggestion-cards-container::-webkit-scrollbar {
            height: 6px;
          }
          .suggestion-cards-container::-webkit-scrollbar-track {
            background: #e0e0e0;
            border-radius: 3px;
          }
          .suggestion-cards-container::-webkit-scrollbar-thumb {
            background: #8d8d8d;
            border-radius: 3px;
          }
          .suggestion-cards-container::-webkit-scrollbar-thumb:hover {
            background: #525252;
          }
        `}</style>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
