import {
    ArcElement, CategoryScale, Chart, DoughnutController, Filler, Legend,
    LinearScale, LineController, LineElement, PointElement, Tooltip
} from "chart.js";

/**
 * Registers only the Chart.js parts used by the app (line and doughnut charts).
 * Imported by the chart components, so Chart.js is only downloaded with them.
 */
Chart.register(ArcElement, CategoryScale, DoughnutController, Filler, Legend, LinearScale,
    LineController, LineElement, PointElement, Tooltip);
