"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TrendChart({ entries }) {
  // Entries come sorted desc, reverse for chronological display
  const sorted = [...entries].reverse();

  const labels = sorted.map((e) => {
    const d = new Date(e.date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });

  const data = {
    labels,
    datasets: [
      {
        label: "Generated",
        data: sorted.map((e) => e.generated),
        borderColor: "#f97316",
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#f97316",
        pointBorderColor: "#0d0d0d",
        pointBorderWidth: 2,
        borderWidth: 2.5,
      },
      {
        label: "Consumed",
        data: sorted.map((e) => e.consumed),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#22c55e",
        pointBorderColor: "#0d0d0d",
        pointBorderWidth: 2,
        borderWidth: 2.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#aaaaaa",
          usePointStyle: true,
          pointStyle: "circle",
          padding: 16,
          font: { size: 12, family: "Inter" },
        },
      },
      tooltip: {
        backgroundColor: "#252525",
        titleColor: "#e5e5e5",
        bodyColor: "#cccccc",
        borderColor: "#444444",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        displayColors: true,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} units`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(68, 68, 68, 0.3)", drawBorder: false },
        ticks: { color: "#888888", font: { size: 11 } },
      },
      y: {
        grid: { color: "rgba(68, 68, 68, 0.3)", drawBorder: false },
        ticks: {
          color: "#888888",
          font: { size: 11 },
          callback: (val) => `${val}`,
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="chart-container">
      <Line data={data} options={options} />
    </div>
  );
}
