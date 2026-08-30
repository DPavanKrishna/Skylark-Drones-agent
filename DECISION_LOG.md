# Decision Log: Skylark BI Agent

---

## 1. Key Assumptions Made

- **Single Source of Truth**: Assumed Monday.com serves as the primary live database for both **Deals** (sales pipeline) and **Work Orders** (operations & execution).
- **Data Inconsistency & Noise**: Assumed raw Monday.com column values contain data quality issues, such as currency formatting (`₹`, `$`), trailing spaces, column header names in data rows, inconsistent status casing (`"Billed"`, `"billed"`, `"not billable"`), and missing values.
- **Leadership Focus**: Assumed founders and C-level executives prioritize high-level synthesis (pipeline health, leading revenue sectors, accounts receivable, and top sales rep performance) over raw tabular dumps.
- **Read-Only Requirement**: Assumed zero write back to Monday.com was allowed, focusing purely on dynamic query execution and analytical reporting.

---

## 2. Technical Decisions & Trade-Offs Chosen

### A. Dynamic Monday.com GraphQL API vs. Static/Local CSV Cache
- **Choice**: Direct, real-time GraphQL API queries (`https://api.monday.com/v2`).
- **Rationale**: Complies strictly with the requirement of live dynamic data fetching without hardcoding CSV data. Ensures leadership metrics reflect live board state.
- **Trade-Off**: Real-time API requests introduce network latency compared to local database caching. In a high-traffic production system, an in-memory Redis cache with short TTL (e.g. 60 seconds) would be added.

### B. Deterministic Mathematical BI Engine vs. Pure LLM Wrapper
- **Choice**: Custom deterministic analytical engine in `Analytics.js` + rule-assisted intent parsing in `biAgentService.js`.
- **Rationale**: LLMs frequently hallucinate mathematical calculations (e.g. summing pipeline totals or calculating completion percentages). Our custom BI engine guarantees **100% mathematical accuracy**, zero latency overhead, offline execution resilience, and zero external API costs.
- **Trade-Off**: Requires explicit intent mappings for question patterns.

### C. Decoupled Express API & React Chat Interface
- **Choice**: Separate Node.js/Express backend service and React (Vite) frontend application.
- **Rationale**: Ensures separation of concerns. The backend handles API token security, Monday.com communication, and data normalization, while the frontend provides a clean, responsive chat experience.

---

## 3. How "Leadership Updates" Was Interpreted & Implemented

The **Leadership Update** feature was designed specifically to serve board members and C-level executives who require an instant 360-degree company health pulse.

When a user asks **"Give me a leadership update"** or **"What should leadership know?"**, the BI agent synthesizes cross-board metrics into a structured executive brief containing:

1. **Pipeline Pulse**: Total deals count, total pipeline value formatted in `₹`, and an overall pipeline health rating (**Strong**, **Moderate**, or **Needs Attention** based on high-probability deal ratios).
2. **Top Sales Owner**: Identifies the top performing rep by pipeline ownership and open deal volume.
3. **Sector Dominance**: Highlights which industry sector accounts for the largest deal volume.
4. **Operations & Fulfillment**: Displays completed vs. total work order count and completion percentage.
5. **Cash Flow & Receivables**: Highlights total outstanding receivable amount (`amountReceivable`).
6. **Data Quality Note**: Explicitly highlights records with missing key fields (missing sector, missing owner, missing deal value) so leadership knows the data confidence level.

---

## 4. What We Would Do Differently With More Time

1. **Hybrid LLM Function Calling (OpenAI / Gemini)**:
   - Integrate an LLM function-calling layer (e.g. OpenAI GPT-4o or Gemini Pro) to parse arbitrary conversational queries while routing math calculations through our deterministic engine.
2. **Interactive Visual Charts**:
   - Add Recharts / Chart.js components in the React interface to visualize sector distribution and monthly revenue trends alongside text responses.
3. **Multi-Board Relationship Graphing**:
   - Automatically link Work Orders directly to their parent Deals via deal code matching to display end-to-end deal fulfillment efficiency.
4. **Automated PDF / Email Export**:
   - Allow executives to download the Leadership Brief as a formatted PDF or send it via email/Slack automatically.
