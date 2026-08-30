import { useState } from "react";
import "./App.css";

function App() {
  // ========================================
  // CHAT STATES
  // ========================================

  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hello! 👋 I am your Skylark BI Agent. Ask me anything about deals, pipeline value, sectors, work orders, and receivables.",
    },
  ]);

  const [asking, setAsking] = useState(false);


  // ========================================
  // ASK QUESTION
  // ========================================

  const askQuestion = async () => {
    const userQuestion = question.trim();

    // Don't allow empty questions
    if (!userQuestion || asking) {
      return;
    }

    // Add user question to chat
    setMessages((previousMessages) => [
      ...previousMessages,
      {
        type: "user",
        text: userQuestion,
      },
    ]);

    // Clear input immediately
    setQuestion("");

    setAsking(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/ask",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            question: userQuestion,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to get an answer."
        );
      }

      // Add BI Agent answer
      setMessages((previousMessages) => [
        ...previousMessages,
        {
          type: "bot",
          text: data.answer,
        },
      ]);

    } catch (error) {
      console.error("BI Agent Error:", error);

      // Add error message to chat
      setMessages((previousMessages) => [
        ...previousMessages,
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


  // ========================================
  // UI
  // ========================================

  return (
    <div className="app">

      {/* HEADER */}

      <header className="chat-header">

        <div className="logo">
          🤖
        </div>

        <div>
          <h1>Skylark BI Agent</h1>

          <p>
            Your Business Intelligence Assistant
          </p>
        </div>

      </header>


      {/* CHAT CONTAINER */}

      <main className="chat-container">


        {/* CHAT MESSAGES */}

        <div className="messages">

          {messages.map((message, index) => (

            <div
              key={index}
              className={`message ${message.type}`}
            >

              <div className="message-avatar">

                {message.type === "user"
                  ? "👤"
                  : "🤖"
                }

              </div>


              <div
                className={
                  message.error
                    ? "message-content error-message"
                    : "message-content"
                }
              >

                <div className="message-name">

                  {message.type === "user"
                    ? "You"
                    : "Skylark BI Agent"
                  }

                </div>

                <div className="message-text">

                  {message.text}

                </div>

              </div>

            </div>

          ))}


          {/* THINKING MESSAGE */}

          {asking && (

            <div className="message bot">

              <div className="message-avatar">
                🤖
              </div>

              <div className="message-content">

                <div className="message-name">
                  Skylark BI Agent
                </div>

                <div className="message-text thinking">
                  Thinking...
                </div>

              </div>

            </div>

          )}

        </div>


        {/* INPUT AREA */}

        <div className="chat-input-container">

          <input
            type="text"

            placeholder="Ask a question about your business..."

            value={question}

            onChange={(event) =>
              setQuestion(event.target.value)
            }

            onKeyDown={(event) => {
              if (event.key === "Enter") {
                askQuestion();
              }
            }}

            disabled={asking}
          />


          <button
            onClick={askQuestion}
            disabled={asking || !question.trim()}
          >

            {asking ? "..." : "Send"}

          </button>

        </div>

      </main>

    </div>
  );
}

export default App;