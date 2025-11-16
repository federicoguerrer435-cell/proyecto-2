const ExcelJS = require('exceljs');
const getDashboardMetricsUseCase = require('./GetDashboardMetricsUseCase');
const prisma = require('../../infrastructure/database/prismaClient');

class DownloadMetricsReportUseCase {
  async execute(user) {
    // 1. Obtener las métricas del dashboard
    const userWithRoles = { ...user, roles: [user.role] };
    const metrics = await getDashboardMetricsUseCase.execute(userWithRoles);

    // 2. Crear un nuevo libro de trabajo de Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'CreditosApp';
    workbook.created = new Date();

    // 3. Crear la hoja de Métricas Generales
    const metricsSheet = workbook.addWorksheet('Métricas Generales');
    this.createMetricsSheet(metricsSheet, metrics);

    // 4. Crear la hoja de Detalles de Créditos
    const creditsSheet = workbook.addWorksheet('Detalle de Créditos');
    await this.createCreditsSheet(creditsSheet, user);

    // 5. Generar el buffer del archivo
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  createMetricsSheet(sheet, metrics) {
    sheet.columns = [
      { header: 'Métrica', key: 'metric', width: 30 },
      { header: 'Valor', key: 'value', width: 20 },
    ];

    const data = [
      { metric: 'Total de Clientes', value: metrics.totalClients },
      { metric: 'Créditos Activos', value: metrics.activeCredits },
      { metric: 'Pagos Realizados Hoy', value: metrics.paymentsToday },
      { metric: 'Total de Cartera', value: metrics.totalPortfolio.toFixed(2) },
    ];

    sheet.addRows(data);
    this.styleHeader(sheet);
  }

  async createCreditsSheet(sheet, user) {
    sheet.columns = [
      { header: 'Cliente', key: 'client', width: 30 },
      { header: 'Crédito No.', key: 'creditNumber', width: 20 },
      { header: 'Monto Principal', key: 'principal', width: 20 },
      { header: 'Cuotas Pagadas', key: 'installmentsPaid', width: 20 },
      { header: 'Total Pagado', key: 'totalPaid', width: 20 },
      { header: 'Saldo Pendiente', key: 'pendingBalance', width: 20 },
      { header: 'Fecha de Vencimiento', key: 'dueDate', width: 25 },
      { header: 'Estado', key: 'status', width: 15 },
    ];

    const whereClause = (user.role === 'COBRADOR')
      ? { client: { assignedTo: user.userId } }
      : {};

    const credits = await prisma.credit.findMany({
      where: whereClause,
      include: {
        client: true,
        payments: true,
      },
    });

    const creditDetails = credits.map(credit => {
      const totalPaid = credit.payments.reduce((sum, p) => sum + Number(p.monto), 0);
      const totalAmount = Number(credit.montoPrincipal) * (1 + Number(credit.tasaInteresAplicada));
      const pendingBalance = totalAmount - totalPaid;

      return {
        client: credit.client.nombre,
        creditNumber: credit.numeroCredito,
        principal: Number(credit.montoPrincipal).toFixed(2),
        installmentsPaid: credit.payments.length,
        totalPaid: totalPaid.toFixed(2),
        pendingBalance: pendingBalance.toFixed(2),
        dueDate: credit.fechaVencimiento.toISOString().split('T')[0],
        status: credit.estado,
      };
    });

    sheet.addRows(creditDetails);
    this.styleHeader(sheet);
  }

  styleHeader(sheet) {
    sheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '002060' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
  }
}

module.exports = new DownloadMetricsReportUseCase();
