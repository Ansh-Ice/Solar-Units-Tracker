"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ComparisonChart({ entries }) {
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
        backgroundColor: "rgba(249, 115, 22, 0.7)",
        borderColor: "#f97316",
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: "Consumed",
        data: sorted.map((e) => e.consumed),
        backgroundColor: "rgba(34, 197, 94, 0.7)",
        borderColor: "#22c55e",
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#aaaaaa",
          usePointStyle: true,
          pointStyle: "rectRounded",
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
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} units`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#888888", font: { size: 11 } },
      },
      y: {
        grid: { color: "rgba(68, 68, 68, 0.3)", drawBorder: false },
        ticks: {
          color: "#888888",
          font: { size: 11 },
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="chart-container">
      <Bar data={data} options={options} />
    </div>
  );
}
