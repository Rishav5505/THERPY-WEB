// components/PatientProgressChart.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register Chart.js components
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

const PatientProgressChart = ({ patientName }) => {
    // Demo data - Replace with real API data later
    const data = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        datasets: [
            {
                label: 'Mood Score',
                data: [3, 4, 3.5, 5, 6, 7],
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: 'rgb(99, 102, 241)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
            {
                label: 'Anxiety Level',
                data: [7, 6, 5.5, 5, 4, 3],
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: 'rgb(239, 68, 68)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 12,
                        weight: 'bold',
                    },
                },
            },
            title: {
                display: true,
                text: `${patientName}'s Progress Over Time`,
                font: {
                    size: 16,
                    weight: 'bold',
                },
                padding: 20,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: 'bold',
                },
                bodyFont: {
                    size: 13,
                },
                cornerRadius: 8,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 10,
                ticks: {
                    stepSize: 1,
                    font: {
                        size: 11,
                        weight: 'bold',
                    },
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },
            x: {
                ticks: {
                    font: {
                        size: 11,
                        weight: 'bold',
                    },
                },
                grid: {
                    display: false,
                },
            },
        },
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-lg">
            <div className="h-[300px]">
                <Line data={data} options={options} />
            </div>

            {/* Insights */}
            <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                    <div className="text-2xl font-black text-green-600 dark:text-green-400">↑ 40%</div>
                    <div className="text-xs font-bold text-green-700 dark:text-green-500 uppercase tracking-wider mt-1">
                        Mood Improvement
                    </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400">6</div>
                    <div className="text-xs font-bold text-blue-700 dark:text-blue-500 uppercase tracking-wider mt-1">
                        Sessions Completed
                    </div>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                    <div className="text-2xl font-black text-purple-600 dark:text-purple-400">↓ 57%</div>
                    <div className="text-xs font-bold text-purple-700 dark:text-purple-500 uppercase tracking-wider mt-1">
                        Anxiety Reduced
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientProgressChart;
