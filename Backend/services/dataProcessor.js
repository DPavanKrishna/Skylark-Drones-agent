// ==========================================
// DATA CLEANING AND NORMALIZATION UTILITIES
// ==========================================


// ------------------------------------------
// Clean Text
// ------------------------------------------
function cleanText(value) {

  if (value === null || value === undefined) {
    return null;
  }

  const cleaned = String(value).trim();

  if (cleaned === "") {
    return null;
  }

  return cleaned;
}


// ------------------------------------------
// Normalize Text
// Used for comparisons/searching
// ------------------------------------------
function normalizeText(value) {

  const cleaned = cleanText(value);

  if (!cleaned) {
    return null;
  }

  return cleaned.replace(/\s+/g, " ");
}


// ------------------------------------------
// Check Whether Value Is a Header
// ------------------------------------------
function isHeaderValue(value, headers = []) {

  const cleaned = normalizeText(value);

  if (!cleaned) {
    return false;
  }

  return headers.some(
    (header) =>
      cleaned.toLowerCase() === header.toLowerCase()
  );
}


// ------------------------------------------
// Normalize Billing Status
// ------------------------------------------
function normalizeBillingStatus(value) {

  const cleaned = normalizeText(value);

  if (!cleaned) {
    return null;
  }

  const normalized = cleaned.toLowerCase();

  const billingStatusMap = {

    "billed": "Billed",
    "partially billed": "Partially Billed",
    "not billable": "Not Billable",
    "update required": "Update Required",
    "stuck": "Stuck",
    "not billed yet": "Not Billed Yet",

  };

  return billingStatusMap[normalized] || cleaned;
}


// ------------------------------------------
// Clean / Normalize Number
// ------------------------------------------
function cleanNumber(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const cleaned = String(value)
    .replace(/,/g, "")
    .replace(/[₹$]/g, "")
    .replace(/[^\d.-]/g, "")
    .trim();

  if (cleaned === "") {
    return null;
  }

  const number = parseFloat(cleaned);

  return isNaN(number)
    ? null
    : number;
}


function normalizeNumber(value) {
  return cleanNumber(value);
}


// ------------------------------------------
// Clean / Normalize Date
// Converts dates to YYYY-MM-DD
// ------------------------------------------
function cleanDate(value) {

  const cleaned = cleanText(value);

  if (!cleaned) {
    return null;
  }

  const date = new Date(cleaned);

  if (isNaN(date.getTime())) {
    return null;
  }

  return date
    .toISOString()
    .split("T")[0];
}


function normalizeDate(value) {
  return cleanDate(value);
}


// ------------------------------------------
// Convert Column Values To Object
// ------------------------------------------
function columnValuesToObject(item) {

  const data = {};

  if (
    !item.column_values ||
    !Array.isArray(item.column_values)
  ) {
    return data;
  }

  item.column_values.forEach((column) => {

    const value = cleanText(column.text);

    if (value !== null) {
      data[column.id] = value;
    }

  });

  return data;
}


// ==========================================
// NORMALIZE WORK ORDER
// ==========================================
function normalizeWorkOrder(item) {

  const columns = {};

  if (
    item.column_values &&
    Array.isArray(item.column_values)
  ) {

    item.column_values.forEach((column) => {

      columns[column.id] =
        cleanText(column.text);

    });

  }


  // ------------------------------------------
  // Clean Sector
  // ------------------------------------------
  const sector = normalizeText(
    columns["text_mm6q11p3"]
  );


  return {

    id: item.id,


    // ------------------------------------------
    // Basic Information
    // ------------------------------------------

    name: normalizeText(item.name),

    customerCode:
      normalizeText(columns["text_mm6qarnf"]),

    dealCode:
      normalizeText(columns["text_mm6qex5v"]),

    natureOfWork:
      normalizeText(columns["text_mm6qynjp"]),

    lastExecutedMonth:
      normalizeText(columns["text_mm6qzjtr"]),

    executionStatus:
      normalizeText(columns["text_mm6qk1q8"]),


    // ------------------------------------------
    // Dates
    // ------------------------------------------

    dataDeliveryDate:
      cleanDate(columns["text_mm6qq2y"]),

    poLoiDate:
      cleanDate(columns["text_mm6qase9"]),

    probableStartDate:
      cleanDate(columns["text_mm6qqtz6"]),

    probableEndDate:
      cleanDate(columns["text_mm6q8g52"]),


    // ------------------------------------------
    // Business Information
    // ------------------------------------------

    documentType:
      normalizeText(columns["text_mm6qy8p6"]),

    ownerCode:
      normalizeText(columns["text_mm6qpw4y"]),

    sector,

    typeOfWork:
      normalizeText(columns["text_mm6q24dn"]),

    softwarePlatformIncluded:
      normalizeText(columns["text_mm6q7cnq"]),


    // ------------------------------------------
    // Invoice Information
    // ------------------------------------------

    lastInvoiceDate:
      cleanDate(columns["text_mm6qmm0x"]),

    latestInvoiceNumber:
      normalizeText(columns["text_mm6q9hgq"]),


    // ------------------------------------------
    // Financial Information
    // ------------------------------------------

    amountExclGST:
      cleanNumber(columns["text_mm6q1e2a"]),

    amountInclGST:
      cleanNumber(columns["text_mm6q77w7"]),

    billedValueExclGST:
      cleanNumber(columns["text_mm6qbeth"]),

    billedValueInclGST:
      cleanNumber(columns["text_mm6q2c0y"]),

    collectedAmountInclGST:
      cleanNumber(columns["text_mm6qnr1x"]),

    amountToBeBilledExclGST:
      cleanNumber(columns["text_mm6qnhn"]),

    amountToBeBilledInclGST:
      cleanNumber(columns["text_mm6qp08n"]),

    amountReceivable:
      cleanNumber(columns["text_mm6qv9ps"]),

    arPriorityAccount:
      normalizeText(columns["text_mm6q57s3"]),


    // ------------------------------------------
    // Quantity Information
    // ------------------------------------------

    quantityByOps:
      normalizeText(columns["text_mm6qeprd"]),

    quantityAsPerPO:
      normalizeText(columns["text_mm6qt0xm"]),

    quantityBilled:
      normalizeText(columns["text_mm6q3azp"]),

    balanceQuantity:
      normalizeText(columns["text_mm6qedna"]),


    // ------------------------------------------
    // Status
    // ------------------------------------------

    invoiceStatus:
      normalizeText(columns["text_mm6q7jx3"]),

    expectedBillingMonth:
      normalizeText(columns["text_mm6qe2tf"]),

    actualBillingMonth:
      normalizeText(columns["text_mm6qvmp0"]),

    actualCollectionMonth:
      normalizeText(columns["text_mm6q9qam"]),

    workOrderBillingStatus:
      normalizeText(columns["text_mm6qj6ef"]),

    collectionStatus:
      normalizeText(columns["text_mm6qsyka"]),

    collectionDate:
      cleanDate(columns["text_mm6qaz02"]),


    // Normalize inconsistent billing status
    billingStatus:
      normalizeBillingStatus(
        columns["text_mm6q56rd"]
      ),

  };
}


// ==========================================
// NORMALIZE DEAL
// ==========================================
function normalizeDeal(item) {

  const data = columnValuesToObject(item);


  // ------------------------------------------
  // Clean Deal Stage
  // ------------------------------------------
  let dealStage = normalizeText(
    data["color_mm6qkeq5"]
  );

  if (
    isHeaderValue(
      dealStage,
      [
        "Deal Stage",
        "Stage",
      ]
    )
  ) {
    dealStage = null;
  }


  // ------------------------------------------
  // Clean Sector
  // ------------------------------------------
  let sector = normalizeText(
    data["text_mm6q478a"]
  );

  if (
    isHeaderValue(
      sector,
      [
        "Sector/service",
        "Sector",
        "Service",
      ]
    )
  ) {
    sector = null;
  }


  return removeNullValues({

    id: item.id,


    // ------------------------------------------
    // Item Name
    // ------------------------------------------

    name:
      normalizeText(item.name),


    // ------------------------------------------
    // Deal Priority
    // ------------------------------------------

    dealPriority:
      normalizeText(
        data["color_mm6qweff"]
      ),


    // ------------------------------------------
    // Closing Date
    // ------------------------------------------

    closingDate:
      normalizeDate(
        data["date_mm6qvzv7"]
      ),


    // ------------------------------------------
    // Deal Stage
    // ------------------------------------------

    dealStage,


    // ------------------------------------------
    // Client Company
    // ------------------------------------------

    clientCompany:
      normalizeText(
        data["text_mm6qwzrf"]
      ),


    // ------------------------------------------
    // Deal Value
    // ------------------------------------------

    dealValue:
      normalizeNumber(
        data["numeric_mm6qnetm"]
      ),


    // ------------------------------------------
    // Owner Code
    // ------------------------------------------

    ownerCode:
      normalizeText(
        data["text_mm6qr3mb"]
      ),


    // ------------------------------------------
    // Client Code
    // ------------------------------------------

    clientCode:
      normalizeText(
        data["text_mm6qf5pj"]
      ),


    // ------------------------------------------
    // Deal Status
    // ------------------------------------------

    dealStatus:
      normalizeText(
        data["text_mm6qwcty"]
      ),


    // ------------------------------------------
    // Closure Probability
    // ------------------------------------------

    closureProbability:
      normalizeText(
        data["text_mm6qxrsq"]
      ),


    // ------------------------------------------
    // Masked Deal Value
    // ------------------------------------------

    maskedDealValue:
      normalizeNumber(
        data["text_mm6qrd1w"]
      ),


    // ------------------------------------------
    // Tentative Close Date
    // ------------------------------------------

    tentativeCloseDate:
      normalizeDate(
        data["text_mm6q88qp"]
      ),


    // ------------------------------------------
    // Product Deal
    // ------------------------------------------

    productDeal:
      normalizeText(
        data["text_mm6q8gct"]
      ),


    // ------------------------------------------
    // Sector / Service
    // ------------------------------------------

    sector,


    // ------------------------------------------
    // Created Date
    // ------------------------------------------

    createdDate:
      normalizeDate(
        data["text_mm6q6vek"]
      ),

  });
}


// ==========================================
// REMOVE NULL VALUES
// ==========================================
function removeNullValues(object) {

  if (
    !object ||
    typeof object !== "object"
  ) {
    return {};
  }

  return Object.fromEntries(

    Object.entries(object).filter(

      ([_, value]) =>
        value !== null &&
        value !== undefined &&
        value !== ""

    )

  );
}


// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {

  cleanText,

  normalizeText,

  cleanNumber,

  normalizeNumber,

  cleanDate,

  normalizeDate,

  isHeaderValue,

  normalizeBillingStatus,

  columnValuesToObject,

  normalizeWorkOrder,

  normalizeDeal,

  removeNullValues,

};