const express = require("express");
const cors = require("cors");
require("dotenv").config();


// ========================================
// IMPORT MONDAY.COM SERVICES
// ========================================

const {
  fetchDealsBoard,
  fetchWorkOrdersBoard,
} = require("./services/mondayService");


// ========================================
// IMPORT DATA PROCESSING SERVICES
// ========================================

const {
  normalizeWorkOrder,
  normalizeDeal,
  removeNullValues,
} = require("./services/dataProcessor");


// ========================================
// IMPORT ANALYTICS SERVICES
// ========================================

const {
  getDealsAnalytics,
  getWorkOrdersAnalytics,
} = require("./services/Analytics");


// ========================================
// IMPORT BI AGENT SERVICE
// ========================================

const {
  processQuestion,
} = require("./services/biAgentService");


// ========================================
// CREATE EXPRESS APP
// ========================================

const app = express();


// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());

app.use(express.json());


// ========================================
// PORT
// ========================================

const PORT = process.env.PORT || 5000;


// ========================================
// BASIC TEST ROUTE
// ========================================

app.get("/", (req, res) => {

  res.json({
    message: "Skylark BI Agent Backend is running!",
  });

});


// ========================================
// HEALTH CHECK ROUTE
// ========================================

app.get("/api/health", (req, res) => {

  res.json({
    status: "healthy",
  });

});


// ========================================
// GET NORMALIZED DEALS DATA
// ========================================

app.get("/api/deals", async (req, res) => {

  try {

    // Fetch Deals Board from Monday.com

    const board =
      await fetchDealsBoard();


    // Normalize all deals

    const normalizedDeals =
      board.items_page.items.map((item) => {

        const normalizedDeal =
          normalizeDeal(item);

        return removeNullValues(
          normalizedDeal
        );

      });


    // Send response

    res.json({

      success: true,

      boardName: board.name,

      totalItems:
        normalizedDeals.length,

      data:
        normalizedDeals,

    });

  } catch (error) {

    console.error(
      "Error fetching Deals:",
      error.message
    );

    res.status(500).json({

      success: false,

      error: error.message,

    });

  }

});


// ========================================
// GET NORMALIZED WORK ORDERS DATA
// ========================================

app.get("/api/work-orders", async (req, res) => {

  try {

    // Fetch Work Orders Board

    const board =
      await fetchWorkOrdersBoard();


    // Normalize all work orders

    const normalizedWorkOrders =
      board.items_page.items.map((item) => {

        const normalizedWorkOrder =
          normalizeWorkOrder(item);

        return removeNullValues(
          normalizedWorkOrder
        );

      });


    // Send response

    res.json({

      success: true,

      boardName: board.name,

      totalItems:
        normalizedWorkOrders.length,

      data:
        normalizedWorkOrders,

    });

  } catch (error) {

    console.error(
      "Error fetching Work Orders:",
      error.message
    );

    res.status(500).json({

      success: false,

      error: error.message,

    });

  }

});


// ========================================
// BUSINESS INTELLIGENCE ANALYTICS
// ========================================

app.get("/api/analytics", async (req, res) => {

  try {

    // ====================================
    // FETCH BOTH BOARDS
    // ====================================

    const dealsBoard =
      await fetchDealsBoard();

    const workOrdersBoard =
      await fetchWorkOrdersBoard();


    // ====================================
    // NORMALIZE DEALS
    // ====================================

    const deals =
      dealsBoard.items_page.items.map((item) => {

        const normalizedDeal =
          normalizeDeal(item);

        return removeNullValues(
          normalizedDeal
        );

      });


    // ====================================
    // NORMALIZE WORK ORDERS
    // ====================================

    const workOrders =
      workOrdersBoard.items_page.items.map((item) => {

        const normalizedWorkOrder =
          normalizeWorkOrder(item);

        return removeNullValues(
          normalizedWorkOrder
        );

      });


    // ====================================
    // GENERATE DEAL ANALYTICS
    // ====================================

    const dealsAnalytics =
      getDealsAnalytics(deals);


    // ====================================
    // GENERATE WORK ORDER ANALYTICS
    // ====================================

    const workOrdersAnalytics =
      getWorkOrdersAnalytics(workOrders);


    // ====================================
    // SEND COMPLETE BI ANALYTICS
    // ====================================

    res.json({

      success: true,

      generatedAt:
        new Date().toISOString(),

      deals:
        dealsAnalytics,

      workOrders:
        workOrdersAnalytics,

    });

  } catch (error) {

    console.error(
      "Analytics Error:",
      error.message
    );

    res.status(500).json({

      success: false,

      error: error.message,

    });

  }

});


// ========================================
// BI AGENT - ASK A QUESTION
// ========================================

app.post("/api/ask", async (req, res) => {

  try {

    // ====================================
    // GET QUESTION FROM USER
    // ====================================

    const { question } =
      req.body;


    // ====================================
    // VALIDATE QUESTION
    // ====================================

    if (
      !question ||
      typeof question !== "string" ||
      question.trim() === ""
    ) {

      return res.status(400).json({

        success: false,

        error:
          "Please provide a valid question.",

      });

    }


    // ====================================
    // FETCH DEALS BOARD
    // ====================================

    const dealsBoard =
      await fetchDealsBoard();


    // ====================================
    // FETCH WORK ORDERS BOARD
    // ====================================

    const workOrdersBoard =
      await fetchWorkOrdersBoard();


    // ====================================
    // NORMALIZE DEALS
    // ====================================

    const deals =
      dealsBoard.items_page.items.map((item) => {

        const normalizedDeal =
          normalizeDeal(item);

        return removeNullValues(
          normalizedDeal
        );

      });


    // ====================================
    // NORMALIZE WORK ORDERS
    // ====================================

    const workOrders =
      workOrdersBoard.items_page.items.map((item) => {

        const normalizedWorkOrder =
          normalizeWorkOrder(item);

        return removeNullValues(
          normalizedWorkOrder
        );

      });


    // ====================================
    // GENERATE DEAL ANALYTICS
    // ====================================

    const dealsAnalytics =
      getDealsAnalytics(deals);


    // ====================================
    // GENERATE WORK ORDER ANALYTICS
    // ====================================

    const workOrdersAnalytics =
      getWorkOrdersAnalytics(
        workOrders
      );


    // ====================================
    // COMBINE ANALYTICS
    // ====================================

    const analytics = {

      deals:
        dealsAnalytics,

      workOrders:
        workOrdersAnalytics,

    };


    // ====================================
    // PROCESS QUESTION USING BI AGENT
    // ====================================

    const result =
      processQuestion(
        question,
        analytics
      );


    // ====================================
    // SEND BI AGENT RESPONSE
    // ====================================

    res.json({

      success: true,

      question,

      generatedAt:
        new Date().toISOString(),

      ...result,

    });

  } catch (error) {

    console.error(
      "BI Agent Error:",
      error.message
    );

    res.status(500).json({

      success: false,

      error: error.message,

    });

  }

});


// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {

  console.log(
    `🚀 Server running at http://localhost:${PORT}`
  );

});

module.exports = app;