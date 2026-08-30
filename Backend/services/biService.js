// ========================================
// BUSINESS INTELLIGENCE SERVICE
// ========================================


// ========================================
// Get Total Pipeline Value
// ========================================
function getTotalPipelineValue(deals) {
  return deals.reduce((total, deal) => {
    return total + (deal.maskedDealValue || 0);
  }, 0);
}


// ========================================
// Get Open Deals
// ========================================
function getOpenDeals(deals) {
  return deals.filter((deal) => {
    return deal.dealStatus &&
      deal.dealStatus.toLowerCase() === "open";
  });
}


// ========================================
// Get Deals By Sector
// ========================================
function getDealsBySector(deals) {
  const sectors = {};

  deals.forEach((deal) => {
    const sector = deal.sector || "Unknown";

    if (!sectors[sector]) {
      sectors[sector] = {
        dealCount: 0,
        pipelineValue: 0,
      };
    }

    sectors[sector].dealCount += 1;

    sectors[sector].pipelineValue +=
      deal.maskedDealValue || 0;
  });

  return sectors;
}


// ========================================
// Get Sector Pipeline
// ========================================
function getSectorPipeline(deals, sectorName) {
  const sectorDeals = deals.filter((deal) => {
    return (
      deal.sector &&
      deal.sector.toLowerCase() ===
        sectorName.toLowerCase()
    );
  });

  return {
    sector: sectorName,

    dealCount: sectorDeals.length,

    pipelineValue: getTotalPipelineValue(sectorDeals),

    openDeals: getOpenDeals(sectorDeals).length,

    highProbabilityDeals: sectorDeals.filter(
      (deal) =>
        deal.closureProbability &&
        deal.closureProbability.toLowerCase() === "high"
    ).length,

    deals: sectorDeals,
  };
}


// ========================================
// Get Pipeline By Stage
// ========================================
function getPipelineByStage(deals) {
  const stages = {};

  deals.forEach((deal) => {
    const stage = deal.dealStage || "Unknown";

    if (!stages[stage]) {
      stages[stage] = {
        dealCount: 0,
        pipelineValue: 0,
      };
    }

    stages[stage].dealCount += 1;

    stages[stage].pipelineValue +=
      deal.maskedDealValue || 0;
  });

  return stages;
}


// ========================================
// Get Deals By Probability
// ========================================
function getDealsByProbability(deals) {
  const probabilities = {};

  deals.forEach((deal) => {
    const probability =
      deal.closureProbability || "Unknown";

    if (!probabilities[probability]) {
      probabilities[probability] = {
        dealCount: 0,
        pipelineValue: 0,
      };
    }

    probabilities[probability].dealCount += 1;

    probabilities[probability].pipelineValue +=
      deal.maskedDealValue || 0;
  });

  return probabilities;
}


// ========================================
// Get Work Order Metrics
// ========================================
function getWorkOrderMetrics(workOrders) {

  const executionStatus = {};

  workOrders.forEach((workOrder) => {

    const status =
      workOrder.executionStatus || "Unknown";

    if (!executionStatus[status]) {
      executionStatus[status] = 0;
    }

    executionStatus[status] += 1;
  });


  return {
    totalWorkOrders: workOrders.length,

    executionStatus: executionStatus,

    completedWorkOrders: workOrders.filter(
      (workOrder) =>
        workOrder.executionStatus &&
        workOrder.executionStatus
          .toLowerCase()
          .includes("completed")
    ).length,
  };
}


// ========================================
// Get Complete Dashboard Summary
// ========================================
function getBusinessSummary(deals, workOrders) {

  const openDeals = getOpenDeals(deals);

  return {
    pipeline: {
      totalDeals: deals.length,

      openDeals: openDeals.length,

      totalPipelineValue:
        getTotalPipelineValue(deals),

      openPipelineValue:
        getTotalPipelineValue(openDeals),
    },

    sectorPerformance:
      getDealsBySector(deals),

    pipelineByStage:
      getPipelineByStage(deals),

    probabilityAnalysis:
      getDealsByProbability(deals),

    operations:
      getWorkOrderMetrics(workOrders),
  };
}


// ========================================
// Export Functions
// ========================================
module.exports = {
  getTotalPipelineValue,
  getOpenDeals,
  getDealsBySector,
  getSectorPipeline,
  getPipelineByStage,
  getDealsByProbability,
  getWorkOrderMetrics,
  getBusinessSummary,
};