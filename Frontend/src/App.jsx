import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hello! 👋 I am your Skylark BI Agent.\n\nAsk me anything about pipeline value, top sales owners, sector dominance, work order completions, or receivables. You can also click any suggested question below!",
    },
  ]);
  const [asking, setAsking] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    { label: "📊 Pipeline Value", query: "What is our total pipeline value?" },
    { label: "🏆 Top Sales Owner", query: "Which sales owner has the strongest pipeline?" },
    { label: "🏢 Top Sector", query: "Which sector has the most deals?" },
    { label: "⚡ Operations Health", query: "How are operations performing?" },
    { label: "💰 Receivables", query: "What is the total amount receivable?" },
    { label: "📑 Leadership Brief", query: "Give me a leadership update" },
  ];

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, asking]);

  const askQuestion = async (customQuery) => {
    const userQuestion = (customQuery || question).trim();

    if (!userQuestion || asking) {
      return;
    }

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: userQuestion,
      },
    ]);

    if (!customQuery) {
      setQuestion("");
    }

    setAsking(true);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${API_BASE}/api/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userQuestion,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to get an answer.");
      }

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: data.answer,
          data: data.data,
        },
      ]);
    } catch (error) {
      console.error("BI Agent Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: `Sorry, something went wrong: ${error.message}`,
          error: true,
        },
      ]);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="app">
      {/* HEADER */}
      <header className="chat-header">
        <div className="header-brand">
          <div className="logo-badge">
            <span className="logo-icon">🚀</span>
          </div>
          <div>
            <h1>Skylark BI Agent</h1>
            <p>Executive Business Intelligence Assistant</p>
          </div>
        </div>

        <div className="header-status">
          <span className="status-dot green"></span>
          <span className="status-text">Connected to Monday.com</span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="chat-container">
        {/* MESSAGES VIEW */}
        <div className="messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.type} animate-fade-in`}
            >
              <div className="message-avatar">
                {message.type === "user" ? "👤" : "🤖"}
              </div>

              <div
                className={
                  message.error
                    ? "message-content error-message"
                    : "message-content"
                }
              >
                <div className="message-header-row">
                  <span className="message-name">
                    {message.type === "user" ? "You" : "Skylark BI Agent"}
                  </span>
                  <span className="message-time">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="message-text">
                  {message.text}
                </div>
              </div>
            </div>
          ))}

          {/* THINKING INDICATOR */}
          {asking && (
            <div className="message bot animate-fade-in">
              <div className="message-avatar">🤖</div>
              <div className="message-content thinking-bubble">
                <div className="message-header-row">
                  <span className="message-name">Skylark BI Agent</span>
                </div>
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <span className="typing-text"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* QUICK SUGGESTIONS CHIPS */}
        <div className="suggestions-container">
          <span className="suggestions-title">Quick Insights:</span>
          <div className="suggestions-chips">
            {suggestedQuestions.map((chip, idx) => (
              <button
                key={idx}
                className="chip-btn"
                onClick={() => askQuestion(chip.query)}
                disabled={asking}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT CONTAINER */}
        <div className="chat-input-container">
          <input
            type="text"
            placeholder="Ask a question about pipeline, sectors, work orders, or receivables..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                askQuestion();
              }
            }}
            disabled={asking}
          />

          <button
            onClick={() => askQuestion()}
            disabled={asking || !question.trim()}
            className="send-btn"
          >
            {asking ? "..." : "Send"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;