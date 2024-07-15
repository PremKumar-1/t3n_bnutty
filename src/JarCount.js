import React, { useEffect, useState } from 'react';
import './JarCount.css';

const Dashboard = () => {
    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [date, setDate] = useState(getCurrentDate());
    const [jarCount, setJarCount] = useState({ shift1: 0, shift2: 0, total: 0 });
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        const fetchJarCount = async () => {
            try {
                const response = await fetch(`/api/jarcounts/?date=${date}`);
                const data = await response.json();
                let shift1 = 0;
                let shift2 = 0;
                let total = 0;
                data.forEach(item => {
                    if (item.shift === 'day') {
                        shift1 += item.count;
                    } else if (item.shift === 'night') {
                        shift2 += item.count;
                    }
                    total += item.count;
                });
                setJarCount({ shift1, shift2, total });
            } catch (error) {
                console.error("Error fetching jar count:", error);
            }
        };

        const fetchInventory = async () => {
            try {
                const response = await fetch(`/api/inventories/`);
                const data = await response.json();
                setInventory(data);
            } catch (error) {
                console.error("Error fetching inventory:", error);
            }
        };

        fetchJarCount();
        fetchInventory();

        const interval = setInterval(() => {
            fetchJarCount();
            fetchInventory();
        }); // Refresh 4 times per second

        return () => clearInterval(interval); // Clean up on unmount
    }, [date]);

    const handleDateChange = (e) => {
        setDate(e.target.value);
    };

    return (
        <div className="dashboard">
            <h1>Jar Counter Dashboard</h1>
            <label htmlFor="date-picker">Select Date:</label>
            <input 
                type="date" 
                id="date-picker" 
                value={date}
                onChange={handleDateChange} 
            />
            <h2>Main Room Jar Count (RITA)</h2>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Shift</th>
                        <th>Completed</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Shift 1</td>
                        <td>{jarCount.shift1}</td>
                    </tr>
                    <tr>
                        <td>Shift 2</td>
                        <td>{jarCount.shift2}</td>
                    </tr>
                    <tr>
                        <td>Total</td>
                        <td>{jarCount.total}</td>
                    </tr>
                </tbody>
            </table>
            <h2>Inventory</h2>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {inventory.map((item, index) => (
                        <tr key={index}>
                            <td>{item.product_name ? item.product_name.trim() : 'Unknown'}</td>
                            <td>{item.quantity.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Dashboard;
