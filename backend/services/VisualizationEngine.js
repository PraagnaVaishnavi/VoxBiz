import { ChartJSNodeCanvas } from "chartjs-node-canvas";

/**
 * Generates a visualization from the query result.
 * @param {Array} queryResult - The SQL query result (array of objects).
 * @param {string} chartType - Type of chart (bar, line, pie, etc.).
 * @param {string} xField - The field to use on the X-axis.
 * @param {string} yField - The field to use on the Y-axis.
 * @returns {Promise<Buffer>} - The generated chart image buffer.
 */
export const generateVisualization = async (queryResult, chartType, xField, yField) => {
    try {
        if (!queryResult.length) {
            throw new Error("No data available for visualization.");
        }

        // Extract X and Y data from the query result
        const labels = queryResult.map(row => row[xField]);
        const data = queryResult.map(row => row[yField]);

        // ChartJS configuration
        const chartConfig = {
            type: chartType,
            data: {
                labels,
                datasets: [{
                    label: `${yField} vs ${xField}`,
                    data,
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                },
                scales: {
                    x: { title: { display: true, text: xField } },
                    y: { title: { display: true, text: yField } },
                },
            }
        };

        // Generate the chart as an image
        const chartNode = new ChartJSNodeCanvas({ width: 800, height: 600 });
        const imageBuffer = await chartNode.renderToBuffer(chartConfig);

        console.log("✅ Visualization generated successfully.");
        return imageBuffer;
    } catch (error) {
        console.error("❌ Visualization error:", error.message);
        throw new Error("Failed to generate visualization.");
    }
};
/**
 * Determines the best chart type based on query result structure.
 * @param {Array} data - SQL query result
 * @returns {string} - Suggested chart type (bar, line, pie, etc.)
 */
export const determineChartType = (data) => {
    if (!data || data.length === 0) return "table"; // Default to table if no data

    const firstRow = data[0];
    const keys = Object.keys(firstRow);

    if (keys.length === 2) {
        const [x, y] = keys;

        if (typeof firstRow[y] === "number") {
            return "bar"; // Bar chart for numeric values
        }
    }

    if (keys.length === 3) {
        return "line"; // Line chart for time-series data
    }

    if (keys.length === 2 && typeof firstRow[keys[1]] === "number") {
        return "pie"; // Pie chart for percentage breakdowns
    }

    return "table"; // Default fallback
};