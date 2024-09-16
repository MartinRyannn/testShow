import React, { useState, useEffect } from 'react';
import '../styles/dashboardStyles.scss';
import logo from '../images/alGOLD2.png';
import Calendar from './Calendar';
import { Line } from 'react-chartjs-2';
import io from 'socket.io-client';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [pivots, setPivots] = useState(null);
    const [error, setError] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Bid',
                data: [],
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
                fill: false,
            },
            {
                label: 'Ask',
                data: [],
                borderColor: 'rgba(255,99,132,1)',
                backgroundColor: 'rgba(255,99,132,0.2)',
                fill: false,
            }
        ],
    });

    useEffect(() => {
        const socket = io('http://localhost:5000');

        socket.on('new_data', (newData) => {
            const time = newData.time;
            const bid = newData.bid;
            const ask = newData.ask;

            setChartData(prevData => {
                const newLabels = [...prevData.labels, time];
                const newBidData = [...prevData.datasets[0].data, bid];
                const newAskData = [...prevData.datasets[1].data, ask];

                return {
                    labels: newLabels,
                    datasets: [
                        { ...prevData.datasets[0], data: newBidData },
                        { ...prevData.datasets[1], data: newAskData }
                    ]
                };
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleStreamToggle = async () => {
        if (isStreaming) {
            setIsStreaming(false);
        } else {
            setIsStreaming(true);
            try {
                await fetch('http://localhost:3000/start_stream');
            } catch (error) {
                console.error("Error starting stream: ", error);
            }
        }
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
            },
        },
        scales: {
            x: {
                display: true, 
            },
            y: {
                display: true, 
            },
        },
    };

    return (
        <div className="dashboardContainer">
            <div className="dashHeader">
                <img src={logo} alt="" className="dashLogo" />
                <div className={`statusButton ${isStreaming ? 'On' : 'Off'}`} onClick={handleStreamToggle}></div>
            </div>
            <div className="boxContainer">
                <div className="dashBox L">
                    <div className="chartBox">
                        <div className="chartTop">
                            <div className="chartDataBox">0.2</div>
                            <div className="chartDataBox Long">
                                <div className="datalongLeft">2431.45</div>
                                <div className="datalongRight">2431.48</div>
                            </div>
                            <div className="chartDataBox">XAU_USD</div>
                        </div>
                        <div className="chart">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                <div className="dashBox S">
                    <div className="logBox console">
                        <div className="logBoxTitle">CONSOLE</div>
                    </div>
                    <div className="logBox algo">
                        <div className="logBoxTitle">ALGORITHM</div>
                    </div>
                </div>

                <div className="dashBox XS">
                    <Calendar />
                </div>

                <div className="dashBox M">
                    <div className="balanceBox">
                        <div className="balanceHeading">CURRENT BALANCE: </div>
                        <div className="balance">1233.45 USD</div>
                        <div className="balanceBottomLeft">
                            <div className="balanceAdded">+ 273.42 USD</div>
                        </div>
                        <div className="balanceBottomRight">
                            <button className="transactionsButton">TRANSACTIONS</button>
                        </div>
                    </div>
                    <div className="infoBox">
                        <div className="balanceHeading low">STATS: </div>
                        <div className="statBox">
                            <div className="statCount">320</div>
                            <div className="statTitle">TRADES</div>
                        </div>
                        <div className="statBox">
                            <div className="statCount">244</div>
                            <div className="statTitle">PROFITABLE</div>
                        </div>
                        <div className="statBox">
                            <div className="statCount">16.4 H</div>
                            <div className="statTitle">RUNTIME</div>
                        </div>
                    </div>
                </div>

                <div className="dashBox M">
                    <div className="controlBox">
                        <button className="pivotButton">GET PIVOTS</button>
                        <div className="pivotOutput">
                            {error && <p>{error}</p>}
                            {pivots && (
                                <div>
                                    <p>Pivot Point: {pivots.pivot_point}</p>
                                    <p>Support 1 (S1): {pivots.s1}</p>
                                    <p>Support 2 (S2): {pivots.s2}</p>
                                    <p>Resistance 1 (R1): {pivots.r1}</p>
                                    <p>Resistance 2 (R2): {pivots.r2}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
