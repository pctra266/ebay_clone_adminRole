import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Exports dashboard data to an Excel file with multiple sheets.
 */
export const exportToExcel = (metrics, stats, fileName = 'Dashboard_Report') => {
  try {
    const wb = XLSX.utils.book_new();

    // 1. General Metrics Sheet
    const metricsData = [
      ['Metric', 'Value'],
      ['Total Users', metrics?.totalUsers || 0],
      ['Total Products', metrics?.totalProducts || 0],
      ['Orders (Current Range)', metrics?.totalOrdersToday || 0],
      ['Pending Accounts', metrics?.pendingAccountsCount || 0],
      ['Open Disputes', metrics?.openDisputesCount || 0],
      ['New Return Requests', metrics?.newReturnRequestsCount || 0],
    ];
    const wsMetrics = XLSX.utils.aoa_to_sheet(metricsData);
    XLSX.utils.book_append_sheet(wb, wsMetrics, 'Overview');

    // 2. Revenue Data Sheet
    if (stats.revenue?.dailyRevenue) {
      const revenueData = [
        ['Date', 'Revenue Amount'],
        ...stats.revenue.dailyRevenue.map(d => [new Date(d.date).toLocaleDateString(), d.amount || d.revenue || 0])
      ];
      const wsRev = XLSX.utils.aoa_to_sheet(revenueData);
      XLSX.utils.book_append_sheet(wb, wsRev, 'Revenue Breakdown');
    }

    // 3. Order Distribution Sheet
    if (stats.orders) {
      const ordersData = [
        ['Status', 'Count'],
        ['Completed', stats.orders.completed],
        ['Delivered', stats.orders.delivered],
        ['Returned', stats.orders.returned],
        ['Total', stats.orders.total],
      ];
      const wsOrders = XLSX.utils.aoa_to_sheet(ordersData);
      XLSX.utils.book_append_sheet(wb, wsOrders, 'Orders Distribution');
    }

    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    return true;
  } catch (error) {
    console.error('Excel Export Error:', error);
    return false;
  }
};

/**
 * Captures a DOM element and exports it as a PDF.
 */
export const exportToPDF = async (elementId, fileName = 'Dashboard_Snapshot') => {
  const element = document.getElementById(elementId);
  if (!element) return false;

  try {
    // Add a temporary class to optimize for capture (optional)
    element.classList.add('pdf-export-mode');
    
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#f8f9fa' // Matches dashboard bg
    });
    
    element.classList.remove('pdf-export-mode');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF Export Error:', error);
    return false;
  }
};
