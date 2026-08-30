# Skylark BI Agent

An intelligent, conversational Business Intelligence (BI) assistant for founders and leadership teams. Skylark BI Agent connects dynamically to **Monday.com** GraphQL APIs (Deals and Work Orders boards), normalizes noisy or incomplete data, computes key operational & financial metrics, and provides an executive chat interface to answer natural-language business questions.

---

## 🌟 Key Features

1. **Live Monday.com Integration**:
   - Queries live GraphQL endpoints for Deals and Work Orders boards.
   - Zero hardcoded CSV files.

2. **Resilient Data Normalization**:
   - Automatic null value filtering and safe default fallbacks.
   - Normalizes text, dates (`YYYY-MM-DD`), currency values (`₹`), and inconsistent billing statuses.
   - Detects header rows and missing record fields.

3. **Conversational BI Chatbot**:
   - Natural language query processor supporting leadership questions on pipeline value, top sales owners, sector performance, completed work orders, and accounts receivable.
   - Provides clear text answers, formatted figures, and structured metric objects.

4. **Executive Dashboard API & Interface**:
   - Clean React (Vite) interface with conversational speech bubbles, avatar indicators, and interactive message flow.
   - Backend Express API exposing endpoints for health checks, normalized board data, full BI analytics, and natural language Q&A.

---

## 🏗️ Architecture Overview

```
skylark-bi-agent/
├── Backend/
│   ├── services/
│   │   ├── mondayService.js      # Monday.com GraphQL API integration
│   │   ├── dataProcessor.js      # Data cleaning, parsing & normalization
│   │   ├── Analytics.js          # Core BI analytics calculations
│   │   ├── analyticsService.js   # Analytics service bridge
│   │   └── biAgentService.js     # Natural language query processing engine
│   ├── server.js                 # Express server & API routes
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── App.jsx               # Main React chat component
│   │   ├── App.css               # Responsive modern styling
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── DECISION_LOG.md               # Leadership decision log & architecture trade-offs
├── README.md                     # Documentation & setup guide
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Monday.com API Key** and Board IDs for Deals & Work Orders

---

### Backend Setup

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   MONDAY_API_TOKEN=your_monday_api_token_here
   DEALS_BOARD_ID=your_deals_board_id
   WORK_ORDERS_BOARD_ID=your_work_orders_board_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The backend server will run at `http://localhost:5000`.

---

### Frontend Setup

1. Navigate to the `Frontend` directory in a new terminal:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend app will run at `http://localhost:5173`.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Basic server check |
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/deals` | Fetches and returns normalized Deals board data |
| `GET` | `/api/work-orders` | Fetches and returns normalized Work Orders board data |
| `GET` | `/api/analytics` | Generates complete BI summary across both boards |
| `POST` | `/api/ask` | Accepts `{ "question": "..." }` and returns natural language answer + JSON payload |

---

## 💬 Example Leadership Queries

Try asking the Skylark BI Agent these queries in the chat:
- `"What is our total pipeline value?"`
- `"Which sales owner has the strongest pipeline?"`
- `"Which sector has the most deals?"`
- `"How many work orders are completed?"`
- `"What is the total amount receivable?"`
- `"Give me a leadership update"`
