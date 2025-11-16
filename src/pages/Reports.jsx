import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, Users, FileText, DollarSign, Download, Car } from 'lucide-react';
import { reportsService } from '../services/reportsService';
import { vehiclesService } from '../services/vehiclesService';
import { partsService } from '../services/partsService';
import Modal from '../components/ui/Modal';
import FormInput from '../components/ui/FormInput';
import FormSelect from '../components/ui/FormSelect';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedPart, setSelectedPart] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [vehicles, setVehicles] = useState([]);
  const [parts, setParts] = useState([]);

  const reports = [
    {
      id: 'vehicle-history',
      name: 'Historial de Vehículos',
      description: 'Consulta el historial completo de un vehículo',
      icon: BarChart3,
      color: 'primary',
      complexity: 'simple',
      needsParam: 'vehicle',
    },
    {
      id: 'mechanic-performance',
      name: 'Rendimiento de Mecánicos',
      description: 'Análisis del rendimiento de los mecánicos',
      icon: TrendingUp,
      color: 'success',
      complexity: 'intermediate',
      hasChart: true,
    },
    {
      id: 'part-traceability',
      name: 'Trazabilidad de Repuestos',
      description: 'Seguimiento de repuestos en órdenes',
      icon: Package,
      color: 'secondary',
      complexity: 'intermediate',
      needsParam: 'part',
    },
    {
      id: 'order-margin',
      name: 'Márgenes de Órdenes',
      description: 'Análisis de márgenes por orden',
      icon: DollarSign,
      color: 'accent',
      complexity: 'complex',
    },
    {
      id: 'client-activity',
      name: 'Actividad de Clientes',
      description: 'Resumen de actividad de clientes',
      icon: Users,
      color: 'primary',
      complexity: 'simple',
    },
    {
      id: 'part-stock',
      name: 'Estado de Inventario',
      description: 'Estado actual del inventario de repuestos',
      icon: Package,
      color: 'secondary',
      complexity: 'simple',
    },
    {
      id: 'service-popularity',
      name: 'Popularidad de Servicios',
      description: 'Servicios más solicitados',
      icon: TrendingUp,
      color: 'success',
      complexity: 'intermediate',
      hasChart: true,
    },
    {
      id: 'pending-invoices',
      name: 'Facturas Pendientes',
      description: 'Facturas pendientes de pago',
      icon: FileText,
      color: 'accent',
      complexity: 'simple',
    },
    {
      id: 'client-profitability',
      name: 'Rentabilidad de Clientes',
      description: 'Análisis de rentabilidad por cliente',
      icon: DollarSign,
      color: 'primary',
      complexity: 'complex',
      hasChart: true,
    },
    {
      id: 'mechanic-productivity',
      name: 'Productividad de Mecánicos',
      description: 'Análisis de productividad de mecánicos',
      icon: TrendingUp,
      color: 'success',
      complexity: 'complex',
    },
  ];

  useEffect(() => {
    loadVehicles();
    loadParts();
  }, []);

  const loadVehicles = async () => {
    try {
      const response = await vehiclesService.getAll({ size: 100 });
      setVehicles(response.data.content || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const loadParts = async () => {
    try {
      const response = await partsService.getAll({ size: 100 });
      setParts(response.data.content || []);
    } catch (error) {
      console.error('Error loading parts:', error);
    }
  };

  const handleRunReport = async (reportId) => {
    const report = reports.find(r => r.id === reportId);
    
    // Si necesita parámetros, abrir modal
    if (report?.needsParam === 'vehicle') {
      setIsVehicleModalOpen(true);
      setSelectedReport(reportId);
      return;
    }
    
    if (report?.needsParam === 'part') {
      setIsPartModalOpen(true);
      setSelectedReport(reportId);
      return;
    }

    await executeReport(reportId);
  };

  const executeReport = async (reportId) => {
    setLoading(true);
    setSelectedReport(reportId);
    try {
      let data;
      const params = {};
      
      if (dateRange.from) params.from = dateRange.from;
      if (dateRange.to) params.to = dateRange.to;

      switch (reportId) {
        case 'vehicle-history':
          data = await reportsService.vehicleHistory(selectedVehicle);
          break;
        case 'mechanic-performance':
          data = await reportsService.mechanicPerformance(params);
          break;
        case 'part-traceability':
          data = await reportsService.partTraceability(selectedPart, params);
          break;
        case 'order-margin':
          data = await reportsService.orderMargin(params);
          break;
        case 'client-activity':
          data = await reportsService.clientActivity();
          break;
        case 'part-stock':
          data = await reportsService.partStockStatus();
          break;
        case 'service-popularity':
          data = await reportsService.servicePopularity(params);
          break;
        case 'pending-invoices':
          data = await reportsService.pendingInvoices();
          break;
        case 'client-profitability':
          data = await reportsService.clientProfitability(params);
          break;
        case 'mechanic-productivity':
          data = await reportsService.mechanicProductivity(params);
          break;
        default:
          alert('Reporte no implementado aún');
          setLoading(false);
          return;
      }
      setReportData(data.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error running report:', error);
      const errorMessage = error.response?.data?.message || 'Error al generar el reporte';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const report = reports.find(r => r.id === selectedReport);
    if (!report || !reportData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 14;
    let yPos = 20;
    
    // Encabezado con fondo
    doc.setFillColor(66, 139, 202);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Título en blanco sobre fondo azul
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(report.name, margin, 25);
    
    // Información de generación
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generado el: ${dateStr} a las ${timeStr}`, margin, 33);
    
    // Resetear color de texto
    doc.setTextColor(0, 0, 0);
    
    if (dateRange.from || dateRange.to) {
      const dateText = `Período: ${dateRange.from || 'Inicio'} - ${dateRange.to || 'Fin'}`;
      doc.text(dateText, pageWidth - margin - doc.getTextWidth(dateText), 33);
    }

    yPos = 50;
    const pageHeight = doc.internal.pageSize.height;

    // Renderizar según el tipo de reporte
    switch (selectedReport) {
      case 'mechanic-performance':
        renderMechanicPerformancePDF(doc, reportData, yPos, pageHeight, margin);
        break;
      case 'service-popularity':
        renderServicePopularityPDF(doc, reportData, yPos, pageHeight, margin);
        break;
      case 'client-profitability':
        renderClientProfitabilityPDF(doc, reportData, yPos, pageHeight, margin);
        break;
      case 'pending-invoices':
        renderPendingInvoicesPDF(doc, reportData, yPos, pageHeight, margin);
        break;
      case 'part-stock':
        renderPartStockPDF(doc, reportData, yPos, pageHeight, margin);
        break;
      case 'client-activity':
        renderClientActivityPDF(doc, reportData, yPos, pageHeight, margin);
        break;
      case 'order-margin':
        renderOrderMarginPDF(doc, reportData, yPos, pageHeight, margin);
        break;
      case 'mechanic-productivity':
        renderMechanicProductivityPDF(doc, reportData, yPos, pageHeight, margin);
        break;
      case 'vehicle-history':
        renderVehicleHistoryPDF(doc, reportData, yPos, pageHeight, margin);
        break;
      case 'part-traceability':
        renderPartTraceabilityPDF(doc, reportData, yPos, pageHeight, margin);
        break;
      default:
        doc.text('Datos del reporte:', margin, yPos);
        yPos += 10;
        doc.setFontSize(10);
        doc.text(JSON.stringify(reportData, null, 2), margin, yPos);
    }

    doc.save(`${report.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Funciones de renderizado PDF para cada reporte
  const renderMechanicPerformancePDF = (doc, data, yPos, pageHeight, margin) => {
    if (data.entries && data.entries.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total de Mecánicos: ${data.entries.length}`, margin, yPos);
      yPos += 10;
    }
    
    const headers = [['Mecánico', 'Órdenes Completadas', 'Total Horas']];
    const rows = data.entries?.map(entry => [
      entry.mechanicName || 'N/A',
      entry.ordersCompleted?.toString() || '0',
      entry.totalHours?.toFixed(2) || '0.00'
    ]) || [];
    
    if (rows.length === 0) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('No hay datos disponibles.', margin, yPos);
      return;
    }
    
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: yPos,
      styles: { 
        fontSize: 9,
        cellPadding: 3,
        halign: 'left'
      },
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Pie de página
    const finalY = doc.lastAutoTable?.finalY || yPos + 50;
    if (finalY < pageHeight - 20) {
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Motor Plus - Sistema de Gestión de Taller', margin, pageHeight - 10);
      doc.text(`Página 1 de 1`, doc.internal.pageSize.width - margin - 30, pageHeight - 10);
    }
  };

  const renderServicePopularityPDF = (doc, data, yPos, pageHeight, margin) => {
    if (data.entries && data.entries.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total de Servicios: ${data.entries.length}`, margin, yPos);
      yPos += 10;
    }
    
    const headers = [['Servicio', 'Veces Solicitado', 'Ingresos Totales', 'Precio Promedio']];
    const rows = data.entries?.map(entry => [
      entry.serviceName || 'N/A',
      entry.timesRequested?.toString() || '0',
      formatPrice(entry.totalRevenue || 0),
      formatPrice(entry.averagePrice || 0)
    ]) || [];
    
    if (rows.length === 0) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('No hay datos disponibles.', margin, yPos);
      return;
    }
    
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: yPos,
      styles: { 
        fontSize: 9,
        cellPadding: 3,
        halign: 'left'
      },
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Pie de página
    const finalY = doc.lastAutoTable?.finalY || yPos + 50;
    if (finalY < pageHeight - 20) {
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Motor Plus - Sistema de Gestión de Taller', margin, pageHeight - 10);
      doc.text(`Página 1 de 1`, doc.internal.pageSize.width - margin - 30, pageHeight - 10);
    }
  };

  const renderClientProfitabilityPDF = (doc, data, yPos, pageHeight, margin) => {
    const headers = [['Cliente', 'Órdenes', 'Ingresos', 'Costo Repuestos', 'Costo Mano Obra', 'Ganancia', 'Margen %']];
    const rows = data.entries?.map(entry => [
      entry.clientName || 'N/A',
      entry.orderCount?.toString() || '0',
      formatPrice(entry.revenue || 0),
      formatPrice(entry.partsCost || 0),
      formatPrice(entry.laborCost || 0),
      formatPrice(entry.profit || 0),
      `${(entry.profitMargin || 0).toFixed(2)}%`
    ]) || [];
    
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: yPos,
      styles: { 
        fontSize: 8,
        cellPadding: 3,
        halign: 'left'
      },
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    const finalY = doc.lastAutoTable?.finalY || yPos + 50;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Ingresos: ${formatPrice(data.totalRevenue || 0)}`, margin, finalY + 10);
    doc.text(`Total Costos: ${formatPrice(data.totalCost || 0)}`, margin, finalY + 18);
    doc.text(`Ganancia Total: ${formatPrice(data.totalProfit || 0)}`, margin, finalY + 26);
    
    // Pie de página
    if (finalY + 30 < pageHeight - 20) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text('Motor Plus - Sistema de Gestión de Taller', margin, pageHeight - 10);
      doc.text(`Página 1 de 1`, doc.internal.pageSize.width - margin - 30, pageHeight - 10);
    }
  };

  const renderPendingInvoicesPDF = (doc, data, yPos, pageHeight, margin) => {
    const headers = [['Número', 'Cliente', 'Fecha Emisión', 'Vencimiento', 'Total', 'Saldo', 'Días Vencidos']];
    const rows = data.entries?.map(entry => [
      entry.invoiceNumber || 'N/A',
      entry.clientName || 'N/A',
      entry.issueDate ? new Date(entry.issueDate).toLocaleDateString('es-ES') : '-',
      entry.dueDate ? new Date(entry.dueDate).toLocaleDateString('es-ES') : '-',
      formatPrice(entry.total || 0),
      formatPrice(entry.balance || 0),
      entry.daysOverdue?.toString() || '0'
    ]) || [];
    
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: yPos,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    const finalY = doc.lastAutoTable?.finalY || yPos + 50;
    doc.setFontSize(12);
    doc.text(`Total Pendiente: ${formatPrice(data.totalPending || 0)}`, margin, finalY + 10);
  };

  const renderPartStockPDF = (doc, data, yPos, pageHeight, margin) => {
    const headers = [['Repuesto', 'SKU', 'Stock', 'Precio Unitario', 'Valor Stock', 'Estado']];
    const rows = data.entries?.map(entry => [
      entry.partName || 'N/A',
      entry.sku || 'N/A',
      entry.currentStock?.toString() || '0',
      formatPrice(entry.unitPrice || 0),
      formatPrice(entry.stockValue || 0),
      entry.status === 'OK' ? 'Normal' : entry.status === 'LOW_STOCK' ? 'Bajo Stock' : 'Sin Stock'
    ]) || [];
    
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: yPos,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    const finalY = doc.lastAutoTable?.finalY || yPos + 50;
    doc.setFontSize(12);
    doc.text(`Valor Total del Inventario: ${formatPrice(data.totalInventoryValue || 0)}`, margin, finalY + 10);
  };

  const renderClientActivityPDF = (doc, data, yPos, pageHeight, margin) => {
    const headers = [['Cliente', 'Email', 'Teléfono', 'Vehículos', 'Última Orden']];
    const rows = data.entries?.map(entry => [
      entry.clientName || 'N/A',
      entry.email || '-',
      entry.phone || '-',
      entry.vehicleCount?.toString() || '0',
      entry.lastOrderDate ? new Date(entry.lastOrderDate).toLocaleDateString('es-ES') : 'Nunca'
    ]) || [];
    
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: yPos,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] }
    });
  };

  const renderOrderMarginPDF = (doc, data, yPos, pageHeight, margin) => {
    const headers = [['Orden', 'Ingresos', 'Costo', 'Margen']];
    const rows = data.entries?.map(entry => [
      entry.orderNumber || 'N/A',
      formatPrice(entry.revenue || 0),
      formatPrice(entry.cost || 0),
      formatPrice(entry.margin || 0)
    ]) || [];
    
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: yPos,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] }
    });
  };

  const renderMechanicProductivityPDF = (doc, data, yPos, pageHeight, margin) => {
    const headers = [['Mecánico', 'Especialización', 'Órdenes Asignadas', 'Completadas', 'Tasa %', 'Horas Totales', 'Ingresos']];
    const rows = data.entries?.map(entry => [
      entry.mechanicName || 'N/A',
      entry.specialization || '-',
      entry.assignedOrders?.toString() || '0',
      entry.completedOrders?.toString() || '0',
      `${(entry.completionRate || 0).toFixed(2)}%`,
      (entry.totalHours || 0).toFixed(2),
      formatPrice(entry.revenueGenerated || 0)
    ]) || [];
    
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: yPos,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
  };

  const renderVehicleHistoryPDF = (doc, data, yPos, pageHeight, margin) => {
    // Información del vehículo destacada
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Vehículo', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Placa: ${data.licensePlate || 'N/A'}`, margin, yPos);
    yPos += 10;
    
    if (data.entries && data.entries.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total de Registros: ${data.entries.length}`, margin, yPos);
      yPos += 12;
    }
    
    const headers = [['Fecha', 'Descripción', 'Referencia']];
    const rows = data.entries?.map(entry => {
      // Formatear la descripción para que sea más legible
      let description = entry.description || '-';
      // Si contiene "Orden" seguido de un UUID, formatearlo mejor
      if (description.includes('Orden ') && description.length > 20) {
        const uuidMatch = description.match(/Orden\s+([a-f0-9-]{36})/i);
        if (uuidMatch) {
          const uuid = uuidMatch[1];
          // Mostrar solo los primeros 8 caracteres del UUID para que sea más legible
          const shortId = uuid.substring(0, 8);
          description = `Orden #${shortId.toUpperCase()}`;
        }
      }
      
      return [
        entry.eventDate ? new Date(entry.eventDate).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }) : '-',
        description,
        entry.reference || '-'
      ];
    }) || [];
    
    if (rows.length === 0) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('No hay registros disponibles para este vehículo.', margin, yPos);
      return;
    }
    
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: yPos,
      styles: { 
        fontSize: 9,
        cellPadding: 3,
        halign: 'left'
      },
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 50 }
      }
    });
    
    // Pie de página
    const finalY = doc.lastAutoTable?.finalY || yPos + 50;
    if (finalY < pageHeight - 20) {
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Motor Plus - Sistema de Gestión de Taller', margin, pageHeight - 10);
      doc.text(`Página 1 de 1`, doc.internal.pageSize.width - margin - 30, pageHeight - 10);
    }
  };

  const renderPartTraceabilityPDF = (doc, data, yPos, pageHeight, margin) => {
    const headers = [['Orden', 'Vehículo', 'Cantidad Usada', 'Fecha Uso']];
    const rows = data.entries?.map(entry => [
      entry.orderNumber || 'N/A',
      entry.vehiclePlate || '-',
      entry.quantityUsed?.toString() || '0',
      entry.usedAt ? new Date(entry.usedAt).toLocaleDateString('es-ES') : '-'
    ]) || [];
    
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: yPos,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] }
    });
  };

  const formatPrice = (price) => {
    if (!price) return '0,00 €';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const renderReportContent = () => {
    if (!reportData || !selectedReport) return null;

    const report = reports.find(r => r.id === selectedReport);

    switch (selectedReport) {
      case 'mechanic-performance':
        return renderMechanicPerformance();
      case 'service-popularity':
        return renderServicePopularity();
      case 'client-profitability':
        return renderClientProfitability();
      case 'pending-invoices':
        return renderPendingInvoices();
      case 'part-stock':
        return renderPartStock();
      case 'client-activity':
        return renderClientActivity();
      case 'order-margin':
        return renderOrderMargin();
      case 'mechanic-productivity':
        return renderMechanicProductivity();
      case 'vehicle-history':
        return renderVehicleHistory();
      case 'part-traceability':
        return renderPartTraceability();
      default:
        return <pre className="bg-secondary-50 p-4 rounded-lg overflow-auto max-h-96 text-sm">
          {JSON.stringify(reportData, null, 2)}
        </pre>;
    }
  };

  const renderMechanicPerformance = () => {
    const chartData = reportData.entries?.map(entry => ({
      name: entry.mechanicName || 'N/A',
      órdenes: entry.ordersCompleted || 0,
      horas: parseFloat(entry.totalHours || 0),
    })) || [];

    return (
      <div className="space-y-6">
        {chartData.length > 0 && (
          <div className="bg-white p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Gráfico de Rendimiento</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="órdenes" fill="#4285F4" name="Órdenes Completadas" />
                <Bar dataKey="horas" fill="#34A853" name="Total Horas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Mecánico</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Órdenes Completadas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Total Horas</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {reportData.entries?.map((entry, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{entry.mechanicName || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{entry.ordersCompleted || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{(entry.totalHours || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderServicePopularity = () => {
    const chartData = reportData.entries?.slice(0, 10).map(entry => ({
      name: entry.serviceName?.substring(0, 20) || 'N/A',
      veces: entry.timesRequested || 0,
      ingresos: parseFloat(entry.totalRevenue || 0),
    })) || [];

    const pieData = reportData.entries?.slice(0, 5).map(entry => ({
      name: entry.serviceName?.substring(0, 15) || 'N/A',
      value: entry.timesRequested || 0,
    })) || [];

    const COLORS = ['#4285F4', '#34A853', '#FBBC04', '#EA4335', '#9AA0A6'];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Top 10 Servicios por Popularidad</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="veces" fill="#4285F4" name="Veces Solicitado" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Distribución Top 5</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Servicio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Veces Solicitado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Ingresos Totales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Precio Promedio</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {reportData.entries?.map((entry, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{entry.serviceName || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{entry.timesRequested || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{formatPrice(entry.totalRevenue)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{formatPrice(entry.averagePrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderClientProfitability = () => {
    const chartData = reportData.entries?.slice(0, 10).map(entry => ({
      name: entry.clientName?.substring(0, 15) || 'N/A',
      ingresos: parseFloat(entry.revenue || 0),
      ganancia: parseFloat(entry.profit || 0),
    })) || [];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-primary-50 p-4 rounded-lg">
            <p className="text-sm text-secondary-600">Total Ingresos</p>
            <p className="text-2xl font-bold text-primary-600">{formatPrice(reportData.totalRevenue || 0)}</p>
          </div>
          <div className="bg-accent-50 p-4 rounded-lg">
            <p className="text-sm text-secondary-600">Total Costos</p>
            <p className="text-2xl font-bold text-accent-600">{formatPrice(reportData.totalCost || 0)}</p>
          </div>
          <div className="bg-success-50 p-4 rounded-lg">
            <p className="text-sm text-secondary-600">Ganancia Total</p>
            <p className="text-2xl font-bold text-success-600">{formatPrice(reportData.totalProfit || 0)}</p>
          </div>
        </div>
        {chartData.length > 0 && (
          <div className="bg-white p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Ingresos vs Ganancia por Cliente (Top 10)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatPrice(value)} />
                <Legend />
                <Bar dataKey="ingresos" fill="#4285F4" name="Ingresos" />
                <Bar dataKey="ganancia" fill="#34A853" name="Ganancia" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Órdenes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Ingresos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Costo Repuestos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Costo Mano Obra</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Ganancia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Margen %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {reportData.entries?.map((entry, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{entry.clientName || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{entry.orderCount || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{formatPrice(entry.revenue)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{formatPrice(entry.partsCost)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{formatPrice(entry.laborCost)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-success-600">{formatPrice(entry.profit)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{(entry.profitMargin || 0).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPendingInvoices = () => {
    return (
      <div className="space-y-4">
        <div className="bg-accent-50 p-4 rounded-lg">
          <p className="text-sm text-secondary-600">Total Pendiente</p>
          <p className="text-2xl font-bold text-accent-600">{formatPrice(reportData.totalPending || 0)}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Número</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Fecha Emisión</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Vencimiento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Saldo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Días Vencidos</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {reportData.entries?.map((entry, index) => (
                <tr key={index} className={entry.daysOverdue > 0 ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{entry.invoiceNumber || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{entry.clientName || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{formatDate(entry.issueDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{formatDate(entry.dueDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{formatPrice(entry.total)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-secondary-900">{formatPrice(entry.balance)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${entry.daysOverdue > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {entry.daysOverdue || 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPartStock = () => {
    const lowStock = reportData.entries?.filter(e => e.status === 'LOW_STOCK' || e.status === 'OUT_OF_STOCK') || [];
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-primary-50 p-4 rounded-lg">
            <p className="text-sm text-secondary-600">Valor Total del Inventario</p>
            <p className="text-2xl font-bold text-primary-600">{formatPrice(reportData.totalInventoryValue || 0)}</p>
          </div>
          <div className="bg-accent-50 p-4 rounded-lg">
            <p className="text-sm text-secondary-600">Repuestos con Stock Bajo</p>
            <p className="text-2xl font-bold text-accent-600">{lowStock.length}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Repuesto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Precio Unitario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Valor Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {reportData.entries?.map((entry, index) => (
                <tr key={index} className={entry.status === 'OUT_OF_STOCK' ? 'bg-red-50' : entry.status === 'LOW_STOCK' ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{entry.partName || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">{entry.sku || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{entry.currentStock || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{formatPrice(entry.unitPrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{formatPrice(entry.stockValue)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      entry.status === 'OK' ? 'bg-green-100 text-green-800' :
                      entry.status === 'LOW_STOCK' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {entry.status === 'OK' ? 'Normal' : entry.status === 'LOW_STOCK' ? 'Bajo Stock' : 'Sin Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderClientActivity = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Vehículos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Última Orden</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {reportData.entries?.map((entry, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{entry.clientName || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">{entry.email || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">{entry.phone || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{entry.vehicleCount || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{formatDate(entry.lastOrderDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderOrderMargin = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Orden</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Ingresos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Costo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Margen</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {reportData.entries?.map((entry, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{entry.orderNumber || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{formatPrice(entry.revenue)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{formatPrice(entry.cost)}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${parseFloat(entry.margin || 0) >= 0 ? 'text-success-600' : 'text-red-600'}`}>
                  {formatPrice(entry.margin)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMechanicProductivity = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Mecánico</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Especialización</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Órdenes Asignadas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Completadas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Tasa Completación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Horas Totales</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Ingresos Generados</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {reportData.entries?.map((entry, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{entry.mechanicName || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">{entry.specialization || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{entry.assignedOrders || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{entry.completedOrders || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{(entry.completionRate || 0).toFixed(2)}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{(entry.totalHours || 0).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-success-600">{formatPrice(entry.revenueGenerated)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderVehicleHistory = () => {
    // Función auxiliar para formatear la descripción
    const formatDescription = (description) => {
      if (!description) return '-';
      // Si contiene "Orden" seguido de un UUID, formatearlo mejor
      if (description.includes('Orden ') && description.length > 20) {
        const uuidMatch = description.match(/Orden\s+([a-f0-9-]{36})/i);
        if (uuidMatch) {
          const uuid = uuidMatch[1];
          // Mostrar solo los primeros 8 caracteres del UUID para que sea más legible
          const shortId = uuid.substring(0, 8);
          return `Orden #${shortId.toUpperCase()}`;
        }
      }
      return description;
    };

    return (
      <div className="space-y-4">
        <div className="bg-primary-50 p-4 rounded-lg">
          <p className="text-sm text-secondary-600">Vehículo</p>
          <p className="text-xl font-bold text-primary-600">{reportData.licensePlate || 'N/A'}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Referencia</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {reportData.entries?.map((entry, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{formatDate(entry.eventDate)}</td>
                  <td className="px-6 py-4 text-sm text-secondary-900">{formatDescription(entry.description)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">{entry.reference || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPartTraceability = () => {
    const partInfo = parts.find(p => p.id === selectedPart);
    
    return (
      <div className="space-y-4">
        {partInfo && (
          <div className="bg-primary-50 p-4 rounded-lg">
            <p className="text-sm text-secondary-600">Repuesto</p>
            <p className="text-xl font-bold text-primary-600">{partInfo.name} ({partInfo.sku})</p>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Orden</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Vehículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Cantidad Usada</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Fecha Uso</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {reportData.entries?.map((entry, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{entry.orderNumber || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{entry.vehiclePlate || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{entry.quantityUsed || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{formatDate(entry.usedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Reportes</h1>
        <p className="mt-2 text-sm text-secondary-600">
          Consulta reportes y análisis del taller
        </p>
      </div>

      <div className="mb-6 card">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          Rango de Fechas (Opcional)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Desde"
            name="from"
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          />
          <FormInput
            label="Hasta"
            name="to"
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          const colorClasses = {
            primary: 'bg-primary-50 text-primary-600',
            success: 'bg-success-50 text-success-600',
            secondary: 'bg-secondary-50 text-secondary-600',
            accent: 'bg-accent-50 text-accent-600',
          };

          return (
            <div key={report.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className={`p-3 rounded-lg ${colorClasses[report.color]}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-secondary-900">
                      {report.name}
                    </h3>
                    {report.hasChart && (
                      <span className="px-2 py-1 text-xs bg-success-100 text-success-800 rounded">
                        Gráfico
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded ${
                      report.complexity === 'simple' ? 'bg-blue-100 text-blue-800' :
                      report.complexity === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {report.complexity === 'simple' ? 'Simple' :
                       report.complexity === 'intermediate' ? 'Intermedio' : 'Complejo'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-secondary-600">{report.description}</p>
                  <button
                    onClick={() => handleRunReport(report.id)}
                    disabled={loading}
                    className="mt-4 btn btn-primary text-sm"
                  >
                    {loading && selectedReport === report.id ? 'Generando...' : 'Generar Reporte'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para seleccionar vehículo */}
      <Modal
        isOpen={isVehicleModalOpen}
        onClose={() => {
          setIsVehicleModalOpen(false);
          setSelectedVehicle('');
        }}
        title="Seleccionar Vehículo"
        size="md"
      >
        <FormSelect
          label="Vehículo"
          name="vehicle"
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
          options={vehicles.map(v => ({
            value: v.licensePlate,
            label: `${v.licensePlate} - ${v.brand} ${v.model}`,
          }))}
          required
        />
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setIsVehicleModalOpen(false);
              setSelectedVehicle('');
            }}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              if (selectedVehicle) {
                setIsVehicleModalOpen(false);
                await executeReport(selectedReport);
              }
            }}
            className="btn btn-primary"
            disabled={!selectedVehicle}
          >
            Generar Reporte
          </button>
        </div>
      </Modal>

      {/* Modal para seleccionar repuesto */}
      <Modal
        isOpen={isPartModalOpen}
        onClose={() => {
          setIsPartModalOpen(false);
          setSelectedPart('');
        }}
        title="Seleccionar Repuesto"
        size="md"
      >
        <FormSelect
          label="Repuesto"
          name="part"
          value={selectedPart}
          onChange={(e) => setSelectedPart(e.target.value)}
          options={parts.map(p => ({
            value: p.id,
            label: `${p.name} (${p.sku})`,
          }))}
          required
        />
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setIsPartModalOpen(false);
              setSelectedPart('');
            }}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              if (selectedPart) {
                setIsPartModalOpen(false);
                await executeReport(selectedReport);
              }
            }}
            className="btn btn-primary"
            disabled={!selectedPart}
          >
            Generar Reporte
          </button>
        </div>
      </Modal>

      {/* Modal principal de reporte */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setReportData(null);
        }}
        title={
          <div className="flex justify-between items-center w-full">
            <span>{reports.find((r) => r.id === selectedReport)?.name || 'Reporte'}</span>
            {reportData && (
              <button
                onClick={handleExportPDF}
                className="btn btn-secondary text-sm flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </button>
            )}
          </div>
        }
        size="xl"
      >
        {reportData && renderReportContent()}
      </Modal>
    </div>
  );
};

export default Reports;
