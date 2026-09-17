import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';

const API_URL = "http://localhost:8080/inventory-api";

export default function Reports() {
  const [financials, setFinancials] = useState([]);
  const [stockDistribution, setStockDistribution] = useState({ labels: [], counts: [] });
  const [loading, setLoading] = useState(true);

  // Charts references
  const salesChartRef = useRef(null);
  const stockChartRef = useRef(null);
  const profitChartRef = useRef(null);

  // Chart instances trackers
  const salesChartInst = useRef(null);
  const stockChartInst = useRef(null);
  const profitChartInst = useRef(null);

  useEffect(() => {
    fetchReportData();

    // Cleanup function components unmount hone par charts destroy karega
    return () => {
      destroyCharts();
    };
  }, []);

  const destroyCharts = () => {
    if (salesChartInst.current) salesChartInst.current.destroy();
    if (stockChartInst.current) stockChartInst.current.destroy();
    if (profitChartInst.current) profitChartInst.current.destroy();
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/get_reports.php`);
      if (response.data.success) {
        setFinancials(response.data.financials);
        setStockDistribution(response.data.stock_distribution);
        renderCharts(response.data.financials, response.data.stock_distribution);
      }
    } catch (error) {
      console.error("Error fetching dynamic report matrix:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCharts = (finData, stockData) => {
    destroyCharts(); // Re-render se pehle duplicate charts destroy karein

    const months = finData.map(item => item.month);
    const salesValues = finData.map(item => item.sales);
    const profitValues = finData.map(item => item.profit);

    // 1. Sales Report Chart (Line Chart)
    if (salesChartRef.current) {
      salesChartInst.current = new Chart(salesChartRef.current, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Sales Revenue (Rs.)',
            data: salesValues,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            fill: true,
            tension: 0.3,
            borderWidth: 2
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // 2. Stock Distribution Chart (Pie Chart)
    if (stockChartRef.current) {
      stockChartInst.current = new Chart(stockChartRef.current, {
        type: 'pie',
        data: {
          labels: stockData.labels.length > 0 ? stockData.labels : ['No Data'],
          datasets: [{
            data: stockData.counts.length > 0 ? stockData.counts : [0],
            backgroundColor: ['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#a855f7', '#6b7280']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // 3. Profit Analytics Chart (Line Chart)
    if (profitChartRef.current) {
      profitChartInst.current = new Chart(profitChartRef.current, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Net Profit (Rs.)',
            data: profitValues,
            borderColor: '#a855f7',
            backgroundColor: 'rgba(168, 85, 247, 0.2)',
            fill: true,
            tension: 0.2,
            borderWidth: 2
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  };

  // Totals calculations for TFoot summary
  const totals = financials.reduce((acc, current) => {
    acc.sales += current.sales;
    acc.purchases += current.purchases;
    acc.expenses += current.expenses;
    acc.profit += current.profit;
    return acc;
  }, { sales: 0, purchases: 0, expenses: 0, profit: 0 });

  const exportToExcel = () => {
    const tableElement = document.getElementById('financialTable');
    const workbook = XLSX.utils.table_to_book(tableElement, { sheet: "Financial Report" });
    XLSX.writeFile(workbook, "Inventory_Financial_Report.xlsx");
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Title Section Styling
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("INVENTORY SYSTEM - FINANCIAL SUMMARY REPORT", 14, 20);
      
      // Metadata Details
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Generated on: " + new Date().toLocaleString(), 14, 28);
      doc.text("System Administrator: Veena", 14, 34); //

      // Sahi aur working AutoTable execution
      autoTable(doc, {
        html: '#financialTable',
        startY: 42,
        theme: 'grid',
        headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        margin: { top: 40 }
      });

      // PDF Save command
      doc.save("Inventory_Financial_Report.pdf");
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF generate karne mein error aaya! Please console check karein.");
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        <p className="ml-3 font-semibold text-gray-700">Loading Report Analytics...</p>
      </div>
    );
  }

  return (
    <div className="md:ml-0 pt-4 px-1">
      {/* HEADER SECTION CONTROLS */}
      <div className="bg-white border-t-4 border-green-600 p-5 shadow flex flex-wrap justify-between items-center gap-4 mb-6 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics Dashboard</h1>
          <p className="text-sm text-gray-500">Monitor system performance, financial statements, and stock updates dynamically.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition flex items-center gap-2 shadow"
          >
            <i className="fa-solid fa-file-excel"></i> Export Excel
          </button>
          <button 
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition flex items-center gap-2 shadow"
          >
            <i className="fa-solid fa-file-pdf"></i> Export PDF
          </button>
          <button 
            onClick={triggerPrint}
            className="bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 transition flex items-center gap-2 shadow"
          >
            <i className="fa-solid fa-print"></i> Print Report
          </button>
        </div>
      </div>

      {/* CHARTS CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales Chart Card */}
        <div className="bg-white p-4 shadow rounded border-t-2 border-emerald-500">
          <h2 className="text-gray-700 font-bold mb-3 text-sm tracking-wide uppercase flex items-center gap-2">
            <i className="fa-solid fa-chart-line text-emerald-500"></i> Sales Performance (Monthly)
          </h2>
          <div className="h-64 relative">
            <canvas ref={salesChartRef}></canvas>
          </div>
        </div>

        {/* Stock Chart Card */}
        <div className="bg-white p-4 shadow rounded border-t-2 border-amber-500">
          <h2 className="text-gray-700 font-bold mb-3 text-sm tracking-wide uppercase flex items-center gap-2">
            <i className="fa-solid fa-chart-pie text-amber-500"></i> Stock Category Share
          </h2>
          <div className="h-64 relative">
            <canvas ref={stockChartRef}></canvas>
          </div>
        </div>

        {/* Profit Chart Card */}
        <div className="bg-white p-4 shadow rounded border-t-2 border-purple-500">
          <h2 className="text-gray-700 font-bold mb-3 text-sm tracking-wide uppercase flex items-center gap-2">
            <i className="fa-solid fa-money-bill-trend-up text-purple-500"></i> Net Profit Analytics
          </h2>
          <div className="h-64 relative">
            <canvas ref={profitChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* MATRIX STATEMENTS TABLE */}
      <div className="bg-white p-5 shadow rounded border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-file-invoice-dollar text-green-600"></i> Comprehensive Financial Statement
        </h2>
        <div className="overflow-x-auto">
          <table id="financialTable" className="w-full text-sm text-left border border-collapse">
            <thead className="bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="p-3 border font-bold">Statement Month</th>
                <th className="p-3 border font-bold">Sales Revenue (Rs.)</th>
                <th className="p-3 border font-bold">Purchases Cost (Rs.)</th>
                <th className="p-3 border font-bold">Expenses (Rs.)</th>
                <th className="p-3 border font-bold">Net Profit (Rs.)</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 divide-y">
              {financials.map((row, index) => (
                <tr key={index}>
                  <td className="p-3 border font-semibold">{row.month}</td>
                  <td className="p-3 border">Rs {parseFloat(row.sales).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td className="p-3 border">Rs {parseFloat(row.purchases).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td className="p-3 border">Rs {parseFloat(row.expenses).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td className={`p-3 border font-semibold ${row.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    Rs {parseFloat(row.profit).toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 text-gray-800 font-bold border-t-2">
              <tr>
                <td className="p-3 border font-bold">Total Summary</td>
                <td className="p-3 border text-emerald-600">Rs {totals.sales.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td className="p-3 border text-red-600">Rs {totals.purchases.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td className="p-3 border text-amber-600">Rs {totals.expenses.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td className="p-3 border bg-green-50 text-green-700 font-extrabold">
                  Rs {totals.profit.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}