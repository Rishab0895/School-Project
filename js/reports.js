/**
 * Reports & Analytics - Financial summaries, analytics, and data export
 * Generates comprehensive financial reports and business intelligence
 */

let currentReports = [];
let currentReportTab = 'summary'; // summary, detailed, salary, export

// ==================== RENDER REPORTS PAGE ====================
function renderReportsPage() {
  const contentArea = document.getElementById('appContent');

  const html = `
    <div class="card">
      <div class="card-header flex-between">
        <h2>📈 Financial Reports & Analytics</h2>
        <button class="btn btn-success" onclick="exportAllDataAsCSV()">⬇️ Export All Data</button>
      </div>
    </div>

    <div class="card">
      <div class="tabs">
        <button class="tab ${currentReportTab === 'summary' ? 'active' : ''}" onclick="switchReportTab('summary', event)">📊 Summary</button>
        <button class="tab ${currentReportTab === 'detailed' ? 'active' : ''}" onclick="switchReportTab('detailed', event)">💰 Fee Analysis</button>
        <button class="tab ${currentReportTab === 'salary' ? 'active' : ''}" onclick="switchReportTab('salary', event)">💵 Salary Analysis</button>
        <button class="tab ${currentReportTab === 'export' ? 'active' : ''}" onclick="switchReportTab('export', event)">📥 Export</button>
      </div>

      <div class="card-body">
        <div id="reportContent">
          ${renderReportTabContent(currentReportTab)}
        </div>
      </div>
    </div>
  `;
  contentArea.innerHTML = html;
}

// ==================== TAB CONTENT RENDERING ====================
function renderReportTabContent(tab) {
  switch (tab) {
    case 'summary':
      return renderSummaryReport();
    case 'detailed':
      return renderFeeAnalysisReport();
    case 'salary':
      return renderSalaryAnalysisReport();
    case 'export':
      return renderExportOptions();
    default:
      return '<p>Invalid tab</p>';
  }
}

// ==================== SUMMARY REPORT ====================
function renderSummaryReport() {
  const currentYear = CONFIG.academicYear.current;
  const students = Storage.getCollection('students');
  const staff = Storage.getCollection('staff');
  const fees = Storage.getCollection('fees');
  const payments = Storage.getCollection('feePayments');
  const salaries = Storage.getCollection('salaryPayments');

  // Fee Statistics
  const yearFees = fees.filter(f => f.academicYear === currentYear);
  const yearPayments = payments.filter(p => {
    const fee = fees.find(f => f.id === p.feeId);
    return fee && fee.academicYear === currentYear;
  });

  const totalFeesDue = yearFees.reduce((sum, f) => sum + f.amount, 0);
  const totalFeesCollected = yearPayments.reduce((sum, p) => sum + p.amount, 0);
  const feeCollectionPercentage = totalFeesDue > 0 ? ((totalFeesCollected / totalFeesDue) * 100).toFixed(2) : 0;
  const feesOutstanding = totalFeesDue - totalFeesCollected;

  // Salary Statistics
  const yearSalaries = salaries.filter(s => s.academicYear === currentYear);
  const totalSalaryPayroll = yearSalaries.reduce((sum, s) => sum + s.netSalary, 0);
  const totalSalaryPaid = yearSalaries.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.netSalary, 0);
  const totalSalaryPending = yearSalaries.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.netSalary, 0);

  // Student and Staff Count
  const activeStudents = students.filter(s => s.status === 'active').length;
  const activeStaff = staff.filter(s => s.status === 'active').length;

  return `
    <div style="margin-bottom: 30px;">
      <h3 style="border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 20px;">Academic Year ${currentYear}-${currentYear + 1} Overview</h3>

      <div class="stats-grid" style="margin-bottom: 30px;">
        <div class="stat-card">
          <h3>👥 Students</h3>
          <div class="value">${activeStudents}</div>
        </div>
        <div class="stat-card">
          <h3>👨‍💼 Staff Members</h3>
          <div class="value">${activeStaff}</div>
        </div>
        <div class="stat-card">
          <h3>📚 Total Records</h3>
          <div class="value">${activeStudents + activeStaff}</div>
        </div>
        <div class="stat-card">
          <h3>📅 Reporting Period</h3>
          <div class="value">${currentYear}-${currentYear + 1}</div>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="border-bottom: 2px solid #27ae60; padding-bottom: 10px; margin-bottom: 20px;">💰 Fee Collection Summary</h3>

      <table class="report-table" style="width: 100%; margin-bottom: 20px;">
        <tr style="background-color: #f0f0f0;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Fees Due</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>${Utils.formatCurrency(totalFeesDue)}</strong></td>
        </tr>
        <tr style="background-color: #e8f8f0;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Fees Collected</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #27ae60;"><strong>${Utils.formatCurrency(totalFeesCollected)}</strong></td>
        </tr>
        <tr style="background-color: #fff8e6;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Outstanding Fees</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #f39c12;"><strong>${Utils.formatCurrency(feesOutstanding)}</strong></td>
        </tr>
        <tr style="background-color: #e6f3ff;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Collection Rate</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>${feeCollectionPercentage}%</strong></td>
        </tr>
      </table>

      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px;">
        <div style="margin-bottom: 10px;"><strong>📊 Monthly Breakdown:</strong></div>
        ${getMonthlyFeeBreakdown()}
      </div>
    </div>

    <div>
      <h3 style="border-bottom: 2px solid #e74c3c; padding-bottom: 10px; margin-bottom: 20px;">💵 Salary Payment Summary</h3>

      <table class="report-table" style="width: 100%;">
        <tr style="background-color: #f0f0f0;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Payroll</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>${Utils.formatCurrency(totalSalaryPayroll)}</strong></td>
        </tr>
        <tr style="background-color: #e8f8f0;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Salaries Paid</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #27ae60;"><strong>${Utils.formatCurrency(totalSalaryPaid)}</strong></td>
        </tr>
        <tr style="background-color: #fff8e6;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Pending Payments</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #f39c12;"><strong>${Utils.formatCurrency(totalSalaryPending)}</strong></td>
        </tr>
      </table>
    </div>
  `;
}

// ==================== FEE ANALYSIS REPORT ====================
function renderFeeAnalysisReport() {
  const currentYear = CONFIG.academicYear.current;
  const fees = Storage.getCollection('fees');
  const payments = Storage.getCollection('feePayments');
  const students = Storage.getCollection('students');

  const yearFees = fees.filter(f => f.academicYear === currentYear);
  
  // Group by class
  const feesByClass = Storage.groupBy(yearFees, 'studentClass') || {};
  
  // Group by fee type
  const feesByType = Storage.groupBy(yearFees, 'feeType') || {};

  let html = `
    <h3 style="border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 20px;">💰 Detailed Fee Analysis</h3>

    <div style="margin-bottom: 30px;">
      <h4 style="margin-bottom: 15px;">📋 Fee Collection by Class:</h4>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #3498db; color: white;">
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Class</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Students</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Total Fees</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Collected</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Outstanding</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Collection %</th>
          </tr>
        </thead>
        <tbody>
  `;

  CONFIG.classes.forEach(className => {
    const classStudents = students.filter(s => s.class === className && s.academicYear === currentYear && s.status === 'active');
    const classFeesData = yearFees.filter(f => classStudents.some(s => s.id === f.studentId));
    
    const totalDue = classFeesData.reduce((sum, f) => sum + f.amount, 0);
    const collected = payments.filter(p => classFeesData.some(f => f.id === p.feeId)).reduce((sum, p) => sum + p.amount, 0);
    const outstanding = totalDue - collected;
    const percentage = totalDue > 0 ? ((collected / totalDue) * 100).toFixed(1) : 0;

    html += `
      <tr style="background-color: ${percentage >= 80 ? '#e8f8f0' : percentage >= 50 ? '#fff8e6' : '#ffe6e6'};">
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>${className}</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${classStudents.length}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${Utils.formatCurrency(totalDue)}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #27ae60;"><strong>${Utils.formatCurrency(collected)}</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #f39c12;">${Utils.formatCurrency(outstanding)}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>${percentage}%</strong></td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>

    <div>
      <h4 style="margin-bottom: 15px;">🏷️ Fee Collection by Type:</h4>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #27ae60; color: white;">
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Fee Type</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Total Due</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Collected</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Pending</th>
          </tr>
        </thead>
        <tbody>
  `;

  Object.keys(feesByType).forEach(feeType => {
    const typeFeesData = feesByType[feeType];
    const totalDue = typeFeesData.reduce((sum, f) => sum + f.amount, 0);
    const collected = payments.filter(p => typeFeesData.some(f => f.id === p.feeId)).reduce((sum, p) => sum + p.amount, 0);
    const pending = totalDue - collected;

    html += `
      <tr style="background-color: #f9f9f9;">
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>${feeType.charAt(0).toUpperCase() + feeType.slice(1).replace(/_/g, ' ')}</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${Utils.formatCurrency(totalDue)}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #27ae60;"><strong>${Utils.formatCurrency(collected)}</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #f39c12;">${Utils.formatCurrency(pending)}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  return html;
}

// ==================== SALARY ANALYSIS REPORT ====================
function renderSalaryAnalysisReport() {
  const currentYear = CONFIG.academicYear.current;
  const salaries = Storage.getCollection('salaryPayments');
  const staff = Storage.getCollection('staff');

  const yearSalaries = salaries.filter(s => s.academicYear === currentYear);
  const salariesByPosition = Storage.groupBy(yearSalaries, 'staffId') || {};

  const totalPayroll = yearSalaries.reduce((sum, s) => sum + s.netSalary, 0);
  const totalPaid = yearSalaries.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.netSalary, 0);
  const totalBasic = yearSalaries.reduce((sum, s) => sum + s.basicSalary, 0);
  const totalAllowances = yearSalaries.reduce((sum, s) => sum + s.allowances, 0);
  const totalDeductions = yearSalaries.reduce((sum, s) => sum + s.deductions, 0);

  let html = `
    <h3 style="border-bottom: 2px solid #e74c3c; padding-bottom: 10px; margin-bottom: 20px;">💵 Salary Payment Analysis</h3>

    <div style="margin-bottom: 30px;">
      <h4 style="margin-bottom: 15px;">📊 Payroll Summary:</h4>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #f0f0f0;">
          <td style="padding: 12px; border: 1px solid #ddd;"><strong>Total Basic Salary</strong></td>
          <td style="padding: 12px; border: 1px solid #ddd; text-align: right;"><strong>${Utils.formatCurrency(totalBasic)}</strong></td>
        </tr>
        <tr style="background-color: #fff9e6;">
          <td style="padding: 12px; border: 1px solid #ddd;"><strong>Total Allowances</strong></td>
          <td style="padding: 12px; border: 1px solid #ddd; text-align: right;"><strong>${Utils.formatCurrency(totalAllowances)}</strong></td>
        </tr>
        <tr style="background-color: #ffe6e6;">
          <td style="padding: 12px; border: 1px solid #ddd;"><strong>Total Deductions</strong></td>
          <td style="padding: 12px; border: 1px solid #ddd; text-align: right;"><strong>${Utils.formatCurrency(totalDeductions)}</strong></td>
        </tr>
        <tr style="background-color: #e8f8f0; border-top: 2px solid #333;">
          <td style="padding: 12px; border: 1px solid #ddd;"><strong>Total Net Payroll</strong></td>
          <td style="padding: 12px; border: 1px solid #ddd; text-align: right; color: #27ae60;"><strong>${Utils.formatCurrency(totalPayroll)}</strong></td>
        </tr>
        <tr style="background-color: #e6f0ff;">
          <td style="padding: 12px; border: 1px solid #ddd;"><strong>Total Paid</strong></td>
          <td style="padding: 12px; border: 1px solid #ddd; text-align: right; color: #2980b9;"><strong>${Utils.formatCurrency(totalPaid)}</strong></td>
        </tr>
      </table>
    </div>

    <div>
      <h4 style="margin-bottom: 15px;">👥 Salary by Position:</h4>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #e74c3c; color: white;">
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Position</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Staff Count</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Total Salary</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Paid</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Pending</th>
          </tr>
        </thead>
        <tbody>
  `;

  const positionData = {};
  yearSalaries.forEach(salary => {
    const staffMember = staff.find(s => s.id === salary.staffId);
    if (!staffMember) return;
    
    const position = staffMember.position;
    if (!positionData[position]) {
      positionData[position] = { count: 0, total: 0, paid: 0, pending: 0 };
    }
    positionData[position].count += 1;
    positionData[position].total += salary.netSalary;
    if (salary.status === 'paid') {
      positionData[position].paid += salary.netSalary;
    } else {
      positionData[position].pending += salary.netSalary;
    }
  });

  Object.keys(positionData).forEach(position => {
    const data = positionData[position];
    html += `
      <tr style="background-color: #f9f9f9;">
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>${position}</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${data.count}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${Utils.formatCurrency(data.total)}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #27ae60;"><strong>${Utils.formatCurrency(data.paid)}</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #f39c12;">${Utils.formatCurrency(data.pending)}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  return html;
}

// ==================== EXPORT OPTIONS ====================
function renderExportOptions() {
  return `
    <h3 style="border-bottom: 2px solid #2980b9; padding-bottom: 10px; margin-bottom: 20px;">📥 Export Data</h3>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
      <div style="background-color: #f0f8ff; padding: 20px; border-radius: 4px; border-left: 4px solid #3498db;">
        <h4 style="margin-top: 0;">📊 Students Data</h4>
        <p>Export all student records with details</p>
        <button class="btn btn-primary" onclick="exportStudentsToCSV()" style="width: 100%; margin-top: 10px;">Export Students</button>
      </div>

      <div style="background-color: #f0fff4; padding: 20px; border-radius: 4px; border-left: 4px solid #27ae60;">
        <h4 style="margin-top: 0;">💼 Staff Data</h4>
        <p>Export all staff member records</p>
        <button class="btn btn-success" onclick="exportStaffToCSV()" style="width: 100%; margin-top: 10px;">Export Staff</button>
      </div>

      <div style="background-color: #fffaf0; padding: 20px; border-radius: 4px; border-left: 4px solid #f39c12;">
        <h4 style="margin-top: 0;">💰 Fee Records</h4>
        <p>Export all fee assignments and collections</p>
        <button class="btn btn-warning" onclick="exportFeesDataToCSV()" style="width: 100%; margin-top: 10px;">Export Fees</button>
      </div>

      <div style="background-color: #fff5f5; padding: 20px; border-radius: 4px; border-left: 4px solid #e74c3c;">
        <h4 style="margin-top: 0;">💵 Salary Records</h4>
        <p>Export all salary entries and payments</p>
        <button class="btn btn-danger" onclick="exportSalaryDataToCSV()" style="width: 100%; margin-top: 10px;">Export Salaries</button>
      </div>

      <div style="background-color: #f5f0ff; padding: 20px; border-radius: 4px; border-left: 4px solid #9b59b6;">
        <h4 style="margin-top: 0;">📈 Financial Summary</h4>
        <p>Export financial report for current year</p>
        <button class="btn btn-info" onclick="exportFinancialSummaryToCSV()" style="width: 100%; margin-top: 10px;">Export Summary</button>
      </div>

      <div style="background-color: #f0f0f0; padding: 20px; border-radius: 4px; border-left: 4px solid #34495e;">
        <h4 style="margin-top: 0;">💾 Complete Backup</h4>
        <p>Export all data in JSON format</p>
        <button class="btn btn-secondary" onclick="exportBackupJSON()" style="width: 100%; margin-top: 10px;">Export Backup</button>
      </div>
    </div>
  `;
}

// ==================== TAB SWITCHING ====================
function switchReportTab(tabName, event) {
  event?.preventDefault();
  currentReportTab = tabName;
  document.getElementById('reportContent').innerHTML = renderReportTabContent(tabName);
}

// ==================== HELPER FUNCTIONS ====================
function getMonthlyFeeBreakdown() {
  const currentYear = CONFIG.academicYear.current;
  const payments = Storage.getCollection('feePayments');
  const fees = Storage.getCollection('fees');

  const monthlyData = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  payments.forEach(payment => {
    const fee = fees.find(f => f.id === payment.feeId);
    if (fee && fee.academicYear === currentYear) {
      const [day, month, year] = payment.paymentDate.split('/');
      const monthKey = `${monthNames[parseInt(month) - 1]}-${year}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + payment.amount;
    }
  });

  let html = '';
  Object.entries(monthlyData).slice(-6).forEach(([month, amount]) => {
    html += `<div style="margin-bottom: 5px;"><strong>${month}:</strong> ${Utils.formatCurrency(amount)}</div>`;
  });

  return html || '<div style="color: #999;">No data available</div>';
}

// ==================== CSV EXPORT FUNCTIONS ====================
function exportStudentsToCSV() {
  const students = Storage.getCollection('students');
  const csvContent = [
    ['ID', 'Name', 'Class', 'Email', 'Phone', 'Parent Phone', 'Academic Year', 'Enrollment Date', 'Status'].join(','),
    ...students.map(s => [
      s.id,
      `"${s.name}"`,
      s.class,
      s.email,
      s.phone,
      s.parentPhone,
      s.academicYear,
      s.enrollmentDate,
      s.status
    ].join(','))
  ].join('\n');

  downloadCSV(csvContent, `Students_${Utils.getTodayDate().replace(/\//g, '-')}.csv`);
}

function exportStaffToCSV() {
  const staff = Storage.getCollection('staff');
  const csvContent = [
    ['ID', 'Name', 'Position', 'Email', 'Phone', 'Department', 'Salary Grade', 'Hire Date', 'Status'].join(','),
    ...staff.map(s => [
      s.id,
      `"${s.name}"`,
      s.position,
      s.email,
      s.phone,
      s.department,
      s.salaryGrade,
      s.hireDate,
      s.status
    ].join(','))
  ].join('\n');

  downloadCSV(csvContent, `Staff_${Utils.getTodayDate().replace(/\//g, '-')}.csv`);
}

function exportFeesDataToCSV() {
  const fees = Storage.getCollection('fees');
  const payments = Storage.getCollection('feePayments');
  const students = Storage.getCollection('students');

  const csvContent = [
    ['Fee ID', 'Student Name', 'Class', 'Fee Type', 'Amount', 'Due Date', 'Status', 'Academic Year'].join(','),
    ...fees.map(f => {
      const student = students.find(s => s.id === f.studentId);
      const feePayments = payments.filter(p => p.feeId === f.id);
      const totalPaid = feePayments.reduce((sum, p) => sum + p.amount, 0);
      const status = totalPaid >= f.amount ? 'Paid' : totalPaid > 0 ? 'Partially Paid' : 'Pending';
      
      return [
        f.id,
        `"${student?.name || 'N/A'}"`,
        student?.class || 'N/A',
        f.feeType,
        f.amount,
        f.dueDate,
        status,
        f.academicYear
      ].join(',');
    })
  ].join('\n');

  downloadCSV(csvContent, `Fees_Data_${Utils.getTodayDate().replace(/\//g, '-')}.csv`);
}

function exportSalaryDataToCSV() {
  const salaries = Storage.getCollection('salaryPayments');
  const staff = Storage.getCollection('staff');

  const csvContent = [
    ['ID', 'Staff Name', 'Position', 'Month', 'Basic', 'Allowances', 'Deductions', 'Net Salary', 'Status', 'Payment Date'].join(','),
    ...salaries.map(s => {
      const staffMember = staff.find(st => st.id === s.staffId);
      return [
        s.id,
        `"${staffMember?.name || 'N/A'}"`,
        staffMember?.position || 'N/A',
        s.month,
        s.basicSalary,
        s.allowances,
        s.deductions,
        s.netSalary,
        s.status,
        s.paymentDate || 'N/A'
      ].join(',');
    })
  ].join('\n');

  downloadCSV(csvContent, `Salary_Data_${Utils.getTodayDate().replace(/\//g, '-')}.csv`);
}

function exportFinancialSummaryToCSV() {
  const currentYear = CONFIG.academicYear.current;
  const fees = Storage.getCollection('fees');
  const payments = Storage.getCollection('feePayments');
  const salaries = Storage.getCollection('salaryPayments');

  const yearFees = fees.filter(f => f.academicYear === currentYear);
  const yearPayments = payments.filter(p => {
    const fee = fees.find(f => f.id === p.feeId);
    return fee && fee.academicYear === currentYear;
  });
  const yearSalaries = salaries.filter(s => s.academicYear === currentYear);

  const totalFeesDue = yearFees.reduce((sum, f) => sum + f.amount, 0);
  const totalFeesCollected = yearPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPayroll = yearSalaries.reduce((sum, s) => sum + s.netSalary, 0);
  const totalSalaryPaid = yearSalaries.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.netSalary, 0);

  const csvContent = [
    'School Management System - Financial Summary',
    `Academic Year: ${currentYear}-${currentYear + 1}`,
    `Generated: ${Utils.formatDate(new Date().toISOString().split('T')[0])}`,
    '',
    'FEE COLLECTION',
    'Metric,Amount',
    `Total Fees Due,${totalFeesDue}`,
    `Total Fees Collected,${totalFeesCollected}`,
    `Outstanding Fees,${totalFeesDue - totalFeesCollected}`,
    `Collection Rate %,${totalFeesDue > 0 ? ((totalFeesCollected / totalFeesDue) * 100).toFixed(2) : 0}`,
    '',
    'SALARY PAYMENTS',
    'Metric,Amount',
    `Total Payroll,${totalPayroll}`,
    `Salaries Paid,${totalSalaryPaid}`,
    `Pending Payments,${totalPayroll - totalSalaryPaid}`
  ].join('\n');

  downloadCSV(csvContent, `Financial_Summary_${currentYear}_${Utils.getTodayDate().replace(/\//g, '-')}.csv`);
}

function exportAllDataAsCSV() {
  alert('Exporting all data... Check your downloads folder.');
  exportStudentsToCSV();
  setTimeout(() => exportStaffToCSV(), 500);
  setTimeout(() => exportFeesDataToCSV(), 1000);
  setTimeout(() => exportSalaryDataToCSV(), 1500);
  setTimeout(() => exportFinancialSummaryToCSV(), 2000);
}

function exportBackupJSON() {
  Storage.exportBackup();
}

// ==================== UTILITY FUNCTIONS ====================
function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
