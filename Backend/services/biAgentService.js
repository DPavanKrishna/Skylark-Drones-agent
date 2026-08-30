// ========================================
// BI AGENT SERVICE
// ========================================


// ========================================
// FORMAT CURRENCY
// ========================================

function formatCurrency(value) {

    const amount = Number(value) || 0;

    return `₹${amount.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;

}


// ========================================
// FIND SECTOR WITH MOST DEALS
// ========================================

function findSectorWithMostDeals(sectors) {

    let highestSector = null;
    let highestCount = 0;

    Object.entries(sectors || {}).forEach(
        ([sector, value]) => {

            const count =
                typeof value === "object"
                    ? Number(value.dealCount) || 0
                    : Number(value) || 0;

            if (count > highestCount) {

                highestCount = count;
                highestSector = sector;

            }

        }
    );

    return {
        name: highestSector,
        count: highestCount,
    };

}


// ========================================
// FIND HIGHEST VALUE
// ========================================

function findHighestValue(data) {

    let highestKey = null;
    let highestValue = 0;

    Object.entries(data || {}).forEach(
        ([key, value]) => {

            const currentValue =
                Number(value) || 0;

            if (currentValue > highestValue) {

                highestValue = currentValue;
                highestKey = key;

            }

        }
    );

    return {
        name: highestKey,
        value: highestValue,
    };

}


// ========================================
// FIND STRONGEST SALES OWNER
// ========================================

function findStrongestPipelineOwner(ownerPerformance) {

    let strongestOwner = null;
    let highestPipelineValue = 0;


    Object.entries(ownerPerformance || {}).forEach(
        ([owner, performance]) => {

            // Ignore unknown owners if possible
            if (
                owner.toLowerCase() === "unknown"
            ) {
                return;
            }


            const pipelineValue =
                Number(performance.pipelineValue) || 0;


            if (pipelineValue > highestPipelineValue) {

                highestPipelineValue =
                    pipelineValue;

                strongestOwner = owner;

            }

        }
    );


    if (!strongestOwner) {

        return null;

    }


    const performance =
        ownerPerformance[strongestOwner];


    return {

        owner: strongestOwner,

        pipelineValue:
            highestPipelineValue,

        dealCount:
            Number(performance.dealCount) || 0,

        openDeals:
            Number(performance.openDeals) || 0,

        highProbabilityDeals:
            Number(
                performance.highProbabilityDeals
            ) || 0,

    };

}


// ========================================
// CALCULATE PIPELINE HEALTH
// ========================================

function getPipelineHealth(analytics) {

    const deals = analytics.deals || {};

    const totalDeals =
        Number(deals.totalDeals) || 0;

    const openDeals =
        Number(deals.openDeals) || 0;

    const highProbabilityDeals =
        Number(deals.highProbabilityDealsCount) || 0;

    const pipelineValue =
        Number(deals.totalPipelineValue) || 0;


    const openDealPercentage =
        totalDeals > 0
            ? (openDeals / totalDeals) * 100
            : 0;


    const highProbabilityPercentage =
        totalDeals > 0
            ? (highProbabilityDeals / totalDeals) * 100
            : 0;


    let health = "Needs Attention";

    if (highProbabilityPercentage >= 30) {

        health = "Strong";

    } else if (highProbabilityPercentage >= 15) {

        health = "Moderate";

    }


    return {

        health,

        totalDeals,

        openDeals,

        highProbabilityDeals,

        pipelineValue,

        openDealPercentage:
            Number(
                openDealPercentage.toFixed(1)
            ),

        highProbabilityPercentage:
            Number(
                highProbabilityPercentage.toFixed(1)
            ),

    };

}


// ========================================
// CALCULATE OPERATIONS PERFORMANCE
// ========================================

function getOperationsPerformance(analytics) {

    const workOrders =
        analytics.workOrders || {};

    const total =
        Number(workOrders.totalWorkOrders) || 0;

    const completed =
        Number(workOrders.completedWorkOrders) || 0;


    const completionRate =
        total > 0
            ? (completed / total) * 100
            : 0;


    let performance = "Needs Attention";

    if (completionRate >= 80) {

        performance = "Strong";

    } else if (completionRate >= 60) {

        performance = "Moderate";

    }


    return {

        performance,

        totalWorkOrders: total,

        completedWorkOrders: completed,

        pendingWorkOrders:
            total - completed,

        completionRate:
            Number(
                completionRate.toFixed(1)
            ),

    };

}


// ========================================
// GET BUSINESS SUMMARY
// ========================================

function getBusinessSummary(analytics) {

    const pipeline =
        getPipelineHealth(analytics);

    const operations =
        getOperationsPerformance(analytics);

    const topSector =
        findSectorWithMostDeals(
            analytics.deals?.dealsBySector || {}
        );

    const strongestOwner =
        findStrongestPipelineOwner(
            analytics.deals?.ownerPerformance || {}
        );

    const receivable =
        Number(
            analytics.workOrders?.totalAmountReceivable
        ) || 0;


    return {

        pipeline,

        operations,

        topSector,

        strongestOwner,

        receivable,

    };

}


// ========================================
// DATA QUALITY CAVEAT
// ========================================

function getDataQualityCaveat(analytics) {

    const issues = [];


    const dealQuality =
        analytics.deals?.dataQuality || {};

    const workOrderQuality =
        analytics.workOrders?.dataQuality || {};


    if (
        Number(dealQuality.dealsWithoutSector) > 0
    ) {

        issues.push(
            `${dealQuality.dealsWithoutSector} deal records have missing sector information`
        );

    }


    if (
        Number(dealQuality.dealsWithoutOwner) > 0
    ) {

        issues.push(
            `${dealQuality.dealsWithoutOwner} deal records have missing owner information`
        );

    }


    if (
        Number(dealQuality.dealsWithoutValue) > 0
    ) {

        issues.push(
            `${dealQuality.dealsWithoutValue} deal records have missing pipeline values`
        );

    }


    if (
        Number(
            workOrderQuality.workOrdersWithoutSector
        ) > 0
    ) {

        issues.push(
            `${workOrderQuality.workOrdersWithoutSector} work orders have missing sector information`
        );

    }


    if (
        Number(
            workOrderQuality.workOrdersWithoutReceivable
        ) > 0
    ) {

        issues.push(
            `${workOrderQuality.workOrdersWithoutReceivable} work orders have missing receivable amounts`
        );

    }


    return issues;

}


// ========================================
// PROCESS USER QUESTION
// ========================================

function processQuestion(question, analytics) {


    // ========================================
    // VALIDATE QUESTION
    // ========================================

    if (
        !question ||
        typeof question !== "string"
    ) {

        return {

            answer:
                "Please provide a valid business question.",

        };

    }


    // ========================================
    // NORMALIZE QUESTION
    // ========================================

    const normalizedQuestion =
        question
            .toLowerCase()
            .trim()
            .replace(/[?!.,]/g, "");


    console.log(
        "BI Agent received question:",
        normalizedQuestion
    );


    // ========================================
    // GREETING
    // ========================================

    if (

        normalizedQuestion === "hi" ||

        normalizedQuestion === "hello" ||

        normalizedQuestion === "hey" ||

        normalizedQuestion.includes("who are you")

    ) {

        return {

            answer:
                "Hello. I am the Skylark BI Agent. I can help you understand pipeline health, sales performance, sectors, operations, work orders, receivables, and leadership-level business insights.",

        };

    }


    // ========================================
    // STRONGEST SALES OWNER
    // ========================================

    if (

        normalizedQuestion.includes("strongest pipeline") ||

        normalizedQuestion.includes("highest pipeline") ||

        normalizedQuestion.includes("best pipeline") ||

        normalizedQuestion.includes("strongest sales owner") ||

        normalizedQuestion.includes("best sales owner") ||

        normalizedQuestion.includes("which sales owner") ||

        normalizedQuestion.includes("which owner has the strongest") ||

        normalizedQuestion.includes("who has the strongest pipeline") ||

        normalizedQuestion.includes("who owns the highest pipeline") ||

        normalizedQuestion.includes("who has the highest pipeline") ||

        normalizedQuestion.includes("top sales owner")

    ) {

        const result =
            findStrongestPipelineOwner(
                analytics.deals?.ownerPerformance || {}
            );


        if (!result) {

            return {

                answer:
                    "I could not identify a sales owner with valid pipeline data from the available records."

            };

        }


        return {

            answer:

                `${result.owner} has the strongest pipeline based on total pipeline value.

Pipeline Value: ${formatCurrency(result.pipelineValue)}

Total Deals: ${result.dealCount}

Open Deals: ${result.openDeals}

High Probability Deals: ${result.highProbabilityDeals}.`,

            data: result,

        };

    }


    // ========================================
    // BUSINESS SUMMARY
    // ========================================

    if (

        normalizedQuestion.includes("business summary") ||

        normalizedQuestion.includes("company summary") ||

        normalizedQuestion.includes("overall performance") ||

        normalizedQuestion.includes("business overview") ||

        normalizedQuestion.includes("how is the business")

    ) {

        const summary =
            getBusinessSummary(analytics);


        let ownerText =
            "Sales owner information is not available.";

        if (summary.strongestOwner) {

            ownerText =
                `Strongest Sales Owner: ${summary.strongestOwner.owner} has the highest pipeline value of ${formatCurrency(summary.strongestOwner.pipelineValue)}.`;

        }


        return {

            answer:

                `Here is the current business summary.

Pipeline: The business has ${summary.pipeline.totalDeals} total deals with a pipeline value of ${formatCurrency(summary.pipeline.pipelineValue)}.

Pipeline Health: ${summary.pipeline.health}. There are ${summary.pipeline.openDeals} open deals and ${summary.pipeline.highProbabilityDeals} high-probability deals.

Leading Sector: ${summary.topSector.name} has the highest number of deals with ${summary.topSector.count} deals.

${ownerText}

Operations: ${summary.operations.completedWorkOrders} out of ${summary.operations.totalWorkOrders} work orders are completed, resulting in a ${summary.operations.completionRate}% completion rate.

Amount Receivable: ${formatCurrency(summary.receivable)}.`,

            data: summary,

        };

    }


    // ========================================
    // LEADERSHIP UPDATE
    // ========================================

    if (

        normalizedQuestion.includes("leadership") ||

        normalizedQuestion.includes("leadership update") ||

        normalizedQuestion.includes("executive summary") ||

        normalizedQuestion.includes("management update") ||

        normalizedQuestion.includes("what should leadership know")

    ) {

        const summary =
            getBusinessSummary(analytics);

        const caveats =
            getDataQualityCaveat(analytics);


        let answer =

            `Leadership Update

Pipeline:
The business currently has ${summary.pipeline.totalDeals} deals worth ${formatCurrency(summary.pipeline.pipelineValue)}.

Pipeline Health:
The pipeline is rated ${summary.pipeline.health}. There are ${summary.pipeline.openDeals} open deals and ${summary.pipeline.highProbabilityDeals} high-probability opportunities.

Sector Focus:
${summary.topSector.name} currently has the highest deal count with ${summary.topSector.count} deals.`;


        if (summary.strongestOwner) {

            answer +=

                `

Sales Performance:
${summary.strongestOwner.owner} has the strongest pipeline with a total value of ${formatCurrency(summary.strongestOwner.pipelineValue)} across ${summary.strongestOwner.dealCount} deals.`;

        }


        answer +=

            `

Operations:
${summary.operations.completedWorkOrders} out of ${summary.operations.totalWorkOrders} work orders are completed, resulting in a ${summary.operations.completionRate}% completion rate.

Receivables:
The total amount receivable is ${formatCurrency(summary.receivable)}.`;


        if (caveats.length > 0) {

            answer +=

                `

Data Quality Note:
${caveats.join(". ")}.`;

        }


        return {

            answer,

            data: summary,

        };

    }


    // ========================================
    // PIPELINE HEALTH
    // ========================================

    if (

        normalizedQuestion.includes("pipeline health") ||

        normalizedQuestion.includes("healthy pipeline") ||

        normalizedQuestion.includes("how healthy") ||

        normalizedQuestion.includes("health of the pipeline") ||

        normalizedQuestion.includes("health of pipeline") ||

        normalizedQuestion.includes("pipeline performing") ||

        normalizedQuestion.includes("give me pipeline health") ||

        normalizedQuestion.includes("pipeline status")

    ) {

        const pipeline =
            getPipelineHealth(analytics);


        return {

            answer:

                `The pipeline health is currently ${pipeline.health}.

Total Deals: ${pipeline.totalDeals}

Pipeline Value: ${formatCurrency(pipeline.pipelineValue)}

Open Deals: ${pipeline.openDeals} (${pipeline.openDealPercentage}%)

High Probability Deals: ${pipeline.highProbabilityDeals} (${pipeline.highProbabilityPercentage}%)

This assessment is based on the available deal volume and high-probability opportunities.`,

            data: pipeline,

        };

    }


    // ========================================
    // TOTAL PIPELINE VALUE
    // ========================================

    if (

        normalizedQuestion.includes("pipeline") &&

        (

            normalizedQuestion.includes("value") ||

            normalizedQuestion.includes("worth") ||

            normalizedQuestion.includes("how much") ||

            normalizedQuestion.includes("amount") ||

            normalizedQuestion.includes("money")

        )

    ) {

        return {

            answer:
                `The total pipeline value is ${formatCurrency(analytics.deals.totalPipelineValue)}.`,

            data: {

                totalPipelineValue:
                    analytics.deals.totalPipelineValue,

            },

        };

    }


    // ========================================
    // TOTAL DEALS
    // ========================================

    if (

        normalizedQuestion.includes("total deals") ||

        normalizedQuestion.includes("how many deals") ||

        normalizedQuestion.includes("number of deals") ||

        normalizedQuestion.includes("deals do we have")

    ) {

        return {

            answer:
                `There are currently ${analytics.deals.totalDeals} total deals.`,

            data: {

                totalDeals:
                    analytics.deals.totalDeals,

            },

        };

    }


    // ========================================
    // OPEN DEALS
    // ========================================

    if (

        normalizedQuestion.includes("open deals") ||

        normalizedQuestion.includes("how many open") ||

        normalizedQuestion.includes("deals are open")

    ) {

        return {

            answer:
                `There are currently ${analytics.deals.openDeals} open deals.`,

            data: {

                openDeals:
                    analytics.deals.openDeals,

            },

        };

    }


    // ========================================
    // HIGH PROBABILITY DEALS
    // ========================================

    if (

        normalizedQuestion.includes("high probability") ||

        normalizedQuestion.includes("high chance") ||

        normalizedQuestion.includes("likely deals")

    ) {

        return {

            answer:
                `There are ${analytics.deals.highProbabilityDealsCount} high-probability deals.`,

            data: {

                highProbabilityDeals:
                    analytics.deals.highProbabilityDealsCount,

            },

        };

    }


    // ========================================
    // SECTOR WITH MOST DEALS
    // ========================================

    if (

        normalizedQuestion.includes("most deals") ||

        normalizedQuestion.includes("highest deals") ||

        normalizedQuestion.includes("sector with most") ||

        normalizedQuestion.includes("which sector has the most")

    ) {

        const result =
            findSectorWithMostDeals(
                analytics.deals.dealsBySector
            );


        return {

            answer:
                `${result.name} has the highest number of deals with ${result.count} deals.`,

            data: result,

        };

    }


    // ========================================
    // SECTOR WITH HIGHEST PIPELINE VALUE
    // ========================================

    if (

        normalizedQuestion.includes("highest pipeline sector") ||

        normalizedQuestion.includes("sector has the highest pipeline") ||

        normalizedQuestion.includes("sector has the strongest pipeline") ||

        normalizedQuestion.includes("highest pipeline value by sector") ||

        normalizedQuestion.includes("which sector has the highest pipeline value")

    ) {

        const result =
            findHighestValue(
                analytics.deals
                    ?.pipelineValueBySector || {}
            );


        return {

            answer:
                `${result.name} has the highest pipeline value at ${formatCurrency(result.value)}.`,

            data: result,

        };

    }


    // ========================================
    // OPERATIONS PERFORMANCE
    // ========================================

    if (

        normalizedQuestion.includes("operations") ||

        normalizedQuestion.includes("operational performance") ||

        normalizedQuestion.includes("how are operations") ||

        normalizedQuestion.includes("operations performing")

    ) {

        const operations =
            getOperationsPerformance(analytics);


        return {

            answer:

                `Operations are currently rated ${operations.performance}.

Total Work Orders: ${operations.totalWorkOrders}

Completed Work Orders: ${operations.completedWorkOrders}

Pending Work Orders: ${operations.pendingWorkOrders}

Completion Rate: ${operations.completionRate}%.`,

            data: operations,

        };

    }


    // ========================================
    // TOTAL WORK ORDERS
    // ========================================

    if (

        normalizedQuestion.includes("total work orders") ||

        normalizedQuestion.includes("how many work orders") ||

        normalizedQuestion.includes("number of work orders")

    ) {

        return {

            answer:
                `There are currently ${analytics.workOrders.totalWorkOrders} total work orders.`,

            data: {

                totalWorkOrders:
                    analytics.workOrders.totalWorkOrders,

            },

        };

    }


    // ========================================
    // COMPLETED WORK ORDERS
    // ========================================

    if (

        normalizedQuestion.includes("completed work orders") ||

        normalizedQuestion.includes("completed orders") ||

        normalizedQuestion.includes("how many completed") ||

        normalizedQuestion.includes("work orders completed")

    ) {

        return {

            answer:
                `${analytics.workOrders.completedWorkOrders} work orders have been completed.`,

            data: {

                completedWorkOrders:
                    analytics.workOrders.completedWorkOrders,

            },

        };

    }


    // ========================================
    // AMOUNT RECEIVABLE
    // ========================================

    if (

        normalizedQuestion.includes("amount receivable") ||

        normalizedQuestion.includes("total receivable") ||

        normalizedQuestion.includes("receivables") ||

        normalizedQuestion.includes("money receivable") ||

        normalizedQuestion.includes("amount due") ||

        normalizedQuestion.includes("money due") ||

        normalizedQuestion.includes("how much is due") ||

        normalizedQuestion.includes("how much money is due") ||

        normalizedQuestion.includes("payment due") ||

        normalizedQuestion.includes("outstanding amount") ||

        normalizedQuestion.includes("outstanding money") ||

        normalizedQuestion.includes("money outstanding")

    ) {

        const amount =
            Number(
                analytics.workOrders
                    .totalAmountReceivable
            ) || 0;


        return {

            answer:
                `The total amount currently due or receivable is ${formatCurrency(amount)}.`,

            data: {

                totalAmountReceivable:
                    amount,

            },

        };

    }


    // ========================================
    // DATA QUALITY
    // ========================================

    if (

        normalizedQuestion.includes("data quality") ||

        normalizedQuestion.includes("data issue") ||

        normalizedQuestion.includes("missing data") ||

        normalizedQuestion.includes("incomplete data")

    ) {

        const issues =
            getDataQualityCaveat(analytics);


        if (issues.length === 0) {

            return {

                answer:
                    "No major data quality issues were detected in the available analytics summary.",

            };

        }


        return {

            answer:

                `Data Quality Notes:

${issues.join(". ")}.

The BI results are calculated using the available monday.com data.`,

            data: {
                issues,
            },

        };

    }


    // ========================================
    // DEFAULT RESPONSE
    // ========================================

    return {

        answer:

            `I could not fully understand that question. You can ask questions such as:

How healthy is our pipeline?

Which sales owner has the strongest pipeline?

What is our pipeline worth?

Which sector has the most deals?

Which sector has the highest pipeline value?

How are operations performing?

Give me a business summary.

What should leadership know?

What is the amount receivable?`,

    };

}


// ========================================
// EXPORT FUNCTIONS
// ========================================

module.exports = {

    processQuestion,

    getPipelineHealth,

    getOperationsPerformance,

    getBusinessSummary,

    findStrongestPipelineOwner,

};