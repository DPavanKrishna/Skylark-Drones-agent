// ========================================
// ANALYTICS SERVICE
// ========================================


// ========================================
// DEAL ANALYTICS
// ========================================

function getDealsAnalytics(deals) {

    const totalDeals = deals.length;


    // ----------------------------------------
    // Open Deals
    // ----------------------------------------

    const openDeals = deals.filter(
        (deal) =>
            deal.dealStatus &&
            deal.dealStatus.trim().toLowerCase() === "open"
    ).length;


    // ----------------------------------------
    // Total Pipeline Value
    // ----------------------------------------

    const totalPipelineValue = deals.reduce(
        (total, deal) => {

            const value =
                Number(deal.maskedDealValue) || 0;

            return total + value;

        },
        0
    );


    // ----------------------------------------
    // Deals By Sector
    // ----------------------------------------

    const dealsBySector = {};

    deals.forEach((deal) => {

        const sector =
            deal.sector &&
                deal.sector.trim()
                ? deal.sector.trim()
                : "Unknown";

        dealsBySector[sector] =
            (dealsBySector[sector] || 0) + 1;

    });


    // ----------------------------------------
    // Pipeline Value By Sector
    // ----------------------------------------

    const pipelineValueBySector = {};

    deals.forEach((deal) => {

        const sector =
            deal.sector &&
                deal.sector.trim()
                ? deal.sector.trim()
                : "Unknown";

        const value =
            Number(deal.maskedDealValue) || 0;

        pipelineValueBySector[sector] =
            (pipelineValueBySector[sector] || 0) + value;

    });


    // ----------------------------------------
    // Deals By Stage
    // ----------------------------------------

    const dealsByStage = {};

    deals.forEach((deal) => {

        const stage =
            deal.dealStage &&
                deal.dealStage.trim()
                ? deal.dealStage.trim()
                : "Unknown";

        dealsByStage[stage] =
            (dealsByStage[stage] || 0) + 1;

    });


    // ----------------------------------------
    // High Probability Deals
    // ----------------------------------------

    const highProbabilityDeals = deals.filter(
        (deal) =>
            deal.closureProbability &&
            deal.closureProbability
                .trim()
                .toLowerCase() === "high"
    );


    // ========================================
    // SALES OWNER PERFORMANCE
    // ========================================

    const ownerPerformance = {};


    deals.forEach((deal) => {

        // --------------------------------------
        // Get Owner
        // --------------------------------------

        const owner =
            deal.ownerCode &&
                deal.ownerCode.trim()
                ? deal.ownerCode.trim()
                : "Unknown";


        // --------------------------------------
        // Get Deal Value
        // --------------------------------------

        const dealValue =
            Number(deal.maskedDealValue) || 0;


        // --------------------------------------
        // Create Owner Entry
        // --------------------------------------

        if (!ownerPerformance[owner]) {

            ownerPerformance[owner] = {

                dealCount: 0,

                pipelineValue: 0,

                openDeals: 0,

                highProbabilityDeals: 0,

            };

        }


        // --------------------------------------
        // Total Deals
        // --------------------------------------

        ownerPerformance[owner].dealCount += 1;


        // --------------------------------------
        // Pipeline Value
        // --------------------------------------

        ownerPerformance[owner].pipelineValue +=
            dealValue;


        // --------------------------------------
        // Open Deals
        // --------------------------------------

        if (

            deal.dealStatus &&

            deal.dealStatus
                .trim()
                .toLowerCase() === "open"

        ) {

            ownerPerformance[owner].openDeals += 1;

        }


        // --------------------------------------
        // High Probability Deals
        // --------------------------------------

        if (

            deal.closureProbability &&

            deal.closureProbability
                .trim()
                .toLowerCase() === "high"

        ) {

            ownerPerformance[owner]
                .highProbabilityDeals += 1;

        }

    });


    // ========================================
    // DATA QUALITY METRICS
    // ========================================

    const dealsWithoutSector = deals.filter(
        (deal) => !deal.sector
    ).length;


    const dealsWithoutOwner = deals.filter(
        (deal) => !deal.ownerCode
    ).length;


    const dealsWithoutValue = deals.filter(
        (deal) =>
            deal.maskedDealValue === null ||
            deal.maskedDealValue === undefined
    ).length;


    // ========================================
    // RETURN DEAL ANALYTICS
    // ========================================

    return {

        totalDeals,

        openDeals,

        totalPipelineValue:
            Number(
                totalPipelineValue.toFixed(2)
            ),

        dealsBySector,

        pipelineValueBySector,

        dealsByStage,

        highProbabilityDealsCount:
            highProbabilityDeals.length,

        ownerPerformance,

        dataQuality: {

            dealsWithoutSector,

            dealsWithoutOwner,

            dealsWithoutValue,

        },

    };

}



// ========================================
// WORK ORDER ANALYTICS
// ========================================

function getWorkOrdersAnalytics(workOrders) {

    const totalWorkOrders =
        workOrders.length;


    // ----------------------------------------
    // Completed Work Orders
    // ----------------------------------------

    const completedWorkOrders =
        workOrders.filter(

            (workOrder) =>

                workOrder.executionStatus &&

                workOrder.executionStatus
                    .trim()
                    .toLowerCase()
                    .includes("completed")

        ).length;


    // ----------------------------------------
    // Completion Rate
    // ----------------------------------------

    const completionRate =
        totalWorkOrders > 0

            ? (
                completedWorkOrders /
                totalWorkOrders
            ) * 100

            : 0;


    // ----------------------------------------
    // Total Amount Receivable
    // ----------------------------------------

    const totalAmountReceivable =
        workOrders.reduce(

            (total, workOrder) => {

                const amount =
                    Number(
                        workOrder.amountReceivable
                    ) || 0;

                return total + amount;

            },

            0

        );


    // ----------------------------------------
    // Work Orders By Sector
    // ----------------------------------------

    const workOrdersBySector = {};


    workOrders.forEach((workOrder) => {

        const sector =

            workOrder.sector &&
                workOrder.sector.trim()

                ? workOrder.sector.trim()

                : "Unknown";


        workOrdersBySector[sector] =

            (workOrdersBySector[sector] || 0) + 1;

    });


    // ----------------------------------------
    // Amount Receivable By Sector
    // ----------------------------------------

    const receivableBySector = {};


    workOrders.forEach((workOrder) => {

        const sector =

            workOrder.sector &&
                workOrder.sector.trim()

                ? workOrder.sector.trim()

                : "Unknown";


        const amount =

            Number(
                workOrder.amountReceivable
            ) || 0;


        receivableBySector[sector] =

            (receivableBySector[sector] || 0)
            + amount;

    });


    // ----------------------------------------
    // Billing Status
    // ----------------------------------------

    const billingStatus = {};


    workOrders.forEach((workOrder) => {

        const status =

            workOrder.billingStatus &&
                workOrder.billingStatus.trim()

                ? workOrder.billingStatus.trim()

                : "Unknown";


        billingStatus[status] =

            (billingStatus[status] || 0) + 1;

    });


    // ========================================
    // DATA QUALITY
    // ========================================

    const workOrdersWithoutSector =
        workOrders.filter(
            (workOrder) => !workOrder.sector
        ).length;


    const workOrdersWithoutReceivable =
        workOrders.filter(

            (workOrder) =>

                workOrder.amountReceivable === null ||
                workOrder.amountReceivable === undefined

        ).length;


    // ========================================
    // RETURN WORK ORDER ANALYTICS
    // ========================================

    return {

        totalWorkOrders,

        completedWorkOrders,

        completionRate:
            Number(
                completionRate.toFixed(2)
            ),

        totalAmountReceivable:

            Number(
                totalAmountReceivable.toFixed(2)
            ),

        workOrdersBySector,

        receivableBySector,

        billingStatus,

        dataQuality: {

            workOrdersWithoutSector,

            workOrdersWithoutReceivable,

        },

    };

}



// ========================================
// EXPORT FUNCTIONS
// ========================================

module.exports = {

    getDealsAnalytics,

    getWorkOrdersAnalytics,

};