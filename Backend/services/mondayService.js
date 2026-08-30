const axios = require("axios");

const MONDAY_API_URL = "https://api.monday.com/v2";

async function fetchBoard(boardId) {
  try {
    const query = `
      query {
        boards(ids: ${boardId}) {
          id
          name
          columns {
            id
            title
            type
          }
          items_page(limit: 500) {
            items {
              id
              name
              column_values {
                id
                text
                value
              }
            }
          }
        }
      }
    `;

    const response = await axios.post(
      MONDAY_API_URL,
      { query },
      {
        headers: {
          Authorization: process.env.MONDAY_API_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    // Check for GraphQL errors
    if (response.data.errors) {
      throw new Error(
        response.data.errors.map((error) => error.message).join(", ")
      );
    }

    return response.data.data.boards[0];
  } catch (error) {
    console.error("Monday API Error:", error.message);

    throw new Error(
      "Failed to fetch data from monday.com. Please check your API token and board ID."
    );
  }
}

async function fetchDealsBoard() {
  return fetchBoard(process.env.DEALS_BOARD_ID);
}

async function fetchWorkOrdersBoard() {
  return fetchBoard(process.env.WORK_ORDERS_BOARD_ID);
}

module.exports = {
  fetchDealsBoard,
  fetchWorkOrdersBoard,
};