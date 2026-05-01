/**
 * Salary Management - Record salaries, track payments, generate salary slips
 * Handles salary assignments, payments, and financial tracking
 */

let currentSalaries = [];
let currentSalaryTab = 'assignment'; // assignment, payments, history

// ==================== RENDER SALARY PAGE ====================
function renderSalaryPage() {
  const contentArea = document.getElementById('appContent');

  const salaries = Storage.getCollection('salaryPayments');
  const staff = Storage.getCollection('staff');
  currentSalaries = salaries;

  // Calculate statistics
  const totalPayroll = salaries
    .filter(s => s.academicYear === CONFIG.academicYear.current)
    .reduce((sum, s) => sum + (s.netSalary || 0), 0);
  
  const totalPaid = salaries
    .filter(s => s.academicYear === CONFIG.academicYear.current && s.status === 'paid')
    .reduce((sum, s) => sum + (s.netSalary || 0), 0);
  
  const pendingSalaries = salaries
    .filter(s => s.academicYear === CONFIG.academicYear.current && s.status === 'pending')
    .reduce((sum, s) => sum + (s.netSalary || 0), 0);

  const staffCount = staff.filter(s => s.status === 'active').length;

  const html = `
    <div class="card">
      <div class="card-header flex-between">
        <h2>💵 Salary Management</h2>
        <div class="header-buttons">
          <button class="btn btn-info" onclick="generateMonthlySalaries()" title="Auto-generate salaries for all active staff based on their profiles">🔄 Generate Monthly Salaries</button>
          <button class="btn btn-success" onclick="showAssignSalaryForm()">+ Assign Salary Manually</button>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>👥 Active Staff</h3>
        <div class="value">${staffCount}</div>
      </div>
      <div class="stat-card">
        <h3>💸 Total Payroll</h3>
        <div class="value">${Utils.formatCurrency(totalPayroll)}</div>
      </div>
      <div class="stat-card">
        <h3>✅ Total Paid</h3>
        <div class="value" style="color: #27ae60;">${Utils.formatCurrency(totalPaid)}</div>
      </div>
      <div class="stat-card">
        <h3>⏳ Pending Amount</h3>
        <div class="value" style="color: #f39c12;">${Utils.formatCurrency(pendingSalaries)}</div>
      </div>
    </div>

    <div class="card">
      <div class="tabs">
        <button class="tab ${currentSalaryTab === 'assignment' ? 'active' : ''}" onclick="switchSalaryTab('assignment', event)">📝 Assign Salary</button>
        <button class="tab ${currentSalaryTab === 'payments' ? 'active' : ''}" onclick="switchSalaryTab('payments', event)">💳 Record Payment</button>
        <button class="tab ${currentSalaryTab === 'history' ? 'active' : ''}" onclick="switchSalaryTab('history', event)">📊 Payment History</button>
      </div>

      <div class="card-body">
        <div id="salaryContent">
          ${renderSalaryTabContent(currentSalaryTab, salaries, staff)}
        </div>
      </div>
    </div>

    <!-- Assign Salary Modal -->
    <div id="assignSalaryModal" class="modal">
      <div class="modal-content" style="max-width: 600px;">
        <span class="close" onclick="closeSalaryForm()">&times;</span>
        <h2>Assign Salary to Staff</h2>
        <form onsubmit="saveAssignedSalary(event)">
          <div class="form-group">
            <label>Select Staff Member *</label>
            <select id="salaryStaffSelect" required onchange="onStaffSelected()">
              <option value="">Select Staff...</option>
              ${staff
                .filter(s => s.status === 'active')
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(s => 
                  `<option value="${s.id}" data-position="${s.position}" data-grade="${s.salaryGrade}">${s.name} (${s.position})</option>`
              ).join('')}
            </select>
          </div>

          <div id="staffSalaryInfo" style="display: none; margin-bottom: 15px; padding: 10px; background-color: #f0f0f0; border-radius: 4px;">
            <p><strong>Staff:</strong> <span id="selectedStaffName"></span></p>
            <p><strong>Position:</strong> <span id="selectedStaffPosition"></span></p>
            <p><strong>Salary Grade:</strong> <span id="selectedStaffGrade"></span></p>
          </div>

          <div class="form-group">
            <label>Month (YYYY-MM) *</label>
            <input type="month" id="salaryMonth" required>
          </div>

          <div class="form-group">
            <label>Basic Salary *</label>
            <input type="number" id="basicSalary" required min="0" step="0.01" placeholder="Enter basic salary">
          </div>

          <div class="form-group">
            <label>Allowances</label>
            <input type="number" id="allowances" min="0" step="0.01" placeholder="Enter total allowances" value="0">
          </div>

          <div class="form-group">
            <label>Deductions</label>
            <input type="number" id="deductions" min="0" step="0.01" placeholder="Enter total deductions" value="0">
          </div>

          <div style="background-color: #f0f0f0; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
            <p><strong>Net Salary:</strong> <span id="netSalaryPreview">0</span></p>
          </div>

          <div class="form-group">
            <label>Status</label>
            <select id="salaryStatus">
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div class="form-buttons">
            <button type="submit" class="btn btn-primary">Save Salary</button>
            <button type="button" class="btn btn-secondary" onclick="closeSalaryForm()">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Record Payment Modal -->
    <div id="recordSalaryPaymentModal" class="modal">
      <div class="modal-content" style="max-width: 600px;">
        <span class="close" onclick="closeSalaryPaymentForm()">&times;</span>
        <h2>Record Salary Payment</h2>
        <form onsubmit="saveSalaryPayment(event)">
          <div id="pendingSalariesList">
            <!-- Dynamically populated with pending salaries -->
          </div>
        </form>
      </div>
    </div>
  `;
  contentArea.innerHTML = html;

  // Set current month as default
  const today = new Date();
  const currentMonth = Utils.getTodayDate().slice(0, 7).replace('/', '-');
  const monthInput = document.getElementById('salaryMonth');
  if (monthInput) {
    monthInput.value = currentMonth;
  }

  // Add event listeners for net salary calculation
  const basicInput = document.getElementById('basicSalary');
  const allowancesInput = document.getElementById('allowances');
  const deductionsInput = document.getElementById('deductions');
  if (basicInput) {
    basicInput.addEventListener('input', calculateNetSalary);
  }
  if (allowancesInput) {
    allowancesInput.addEventListener('input', calculateNetSalary);
  }
  if (deductionsInput) {
    deductionsInput.addEventListener('input', calculateNetSalary);
  }
}

// ==================== TAB CONTENT RENDERING ====================
function renderSalaryTabContent(tab, salaries, staff) {
  switch (tab) {
    case 'assignment':
      return renderSalaryAssignmentView(salaries, staff);
    case 'payments':
      return renderSalaryRecordingView(salaries, staff);
    case 'history':
      return renderSalaryHistoryView(salaries, staff);
    default:
      return '<p>Invalid tab</p>';
  }
}

function renderSalaryAssignmentView(salaries, staff) {
  const academicYear = CONFIG.academicYear.current;
  const yearSalaries = salaries.filter(s => s.academicYear === academicYear);

  if (yearSalaries.length === 0) {
    return `
      <div class="no-data-container">
        <p class="no-data">No salaries assigned yet. Click "Assign Salary to Staff" to get started.</p>
      </div>
    `;
  }

  // Group salaries by staff
  const byStaff = Storage.groupBy(yearSalaries, 'staffId');

  let html = `
    <div class="search-box" style="margin-bottom: 15px;">
      <div class="search-input">
        <input type="text" placeholder="Search by staff name..." onkeyup="filterSalaries('assignment')" id="salarySearchInput">
      </div>
      <select id="salaryPositionFilter" onchange="filterSalaries('assignment')">
        <option value="">All Positions</option>
        ${[...new Set(staff.map(s => s.position))].map(pos => `<option value="${pos}">${pos}</option>`).join('')}
      </select>
      <select id="salaryStatusFilter" onchange="filterSalaries('assignment')">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
      </select>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Staff Name</th>
          <th>Position</th>
          <th>Month</th>
          <th>Basic</th>
          <th>Allowances</th>
          <th>Deductions</th>
          <th>Net Salary</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
  `;

  yearSalaries.forEach(salary => {
    const staffMember = staff.find(s => s.id === salary.staffId);
    if (!staffMember) return;

    html += `
      <tr>
        <td>${staffMember.name}</td>
        <td>${staffMember.position}</td>
        <td>${salary.month}</td>
        <td>${Utils.formatCurrency(salary.basicSalary)}</td>
        <td>${Utils.formatCurrency(salary.allowances)}</td>
        <td>${Utils.formatCurrency(salary.deductions)}</td>
        <td><strong>${Utils.formatCurrency(salary.netSalary)}</strong></td>
        <td><span class="badge badge-${salary.status === 'paid' ? 'success' : 'warning'}">${salary.status.toUpperCase()}</span></td>
        <td>
          <button class="btn-small btn-info" onclick="viewSalaryDetail('${salary.id}')">View</button>
          <button class="btn-small btn-danger" onclick="deleteSalaryConfirm('${salary.id}')">Delete</button>
        </td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  return html;
}

function renderSalaryRecordingView(salaries, staff) {
  const academicYear = CONFIG.academicYear.current;
  const pendingSalaries = salaries.filter(s => 
    s.academicYear === academicYear && s.status === 'pending'
  );

  if (pendingSalaries.length === 0) {
    return `
      <div class="no-data-container">
        <p class="no-data">No pending salaries to record payment. All salaries have been paid!</p>
      </div>
    `;
  }

  let html = `
    <div style="margin-bottom: 15px;">
      <p><strong>Pending Salaries:</strong> ${pendingSalaries.length}</p>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Staff Name</th>
          <th>Position</th>
          <th>Month</th>
          <th>Net Salary</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
  `;

  pendingSalaries.forEach(salary => {
    const staffMember = staff.find(s => s.id === salary.staffId);
    if (!staffMember) return;

    html += `
      <tr>
        <td>${staffMember.name}</td>
        <td>${staffMember.position}</td>
        <td>${salary.month}</td>
        <td>${Utils.formatCurrency(salary.netSalary)}</td>
        <td>
          <button class="btn-small btn-success" onclick="showRecordSalaryPaymentForm('${salary.id}')">Record Payment</button>
        </td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  return html;
}

function renderSalaryHistoryView(salaries, staff) {
  const academicYear = CONFIG.academicYear.current;
  const yearSalaries = salaries.filter(s => s.academicYear === academicYear);
  const paidSalaries = yearSalaries.filter(s => s.status === 'paid');

  if (paidSalaries.length === 0) {
    return `
      <div class="no-data-container">
        <p class="no-data">No payment history available yet.</p>
      </div>
    `;
  }

  let html = `
    <div class="search-box" style="margin-bottom: 15px;">
      <div class="search-input">
        <input type="text" placeholder="Search by staff name..." onkeyup="filterSalaries('history')" id="salaryHistorySearchInput">
      </div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Staff Name</th>
          <th>Position</th>
          <th>Month</th>
          <th>Net Salary</th>
          <th>Payment Date</th>
          <th>Method</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
  `;

  paidSalaries.forEach(salary => {
    const staffMember = staff.find(s => s.id === salary.staffId);
    if (!staffMember) return;

    html += `
      <tr>
        <td>${staffMember.name}</td>
        <td>${staffMember.position}</td>
        <td>${salary.month}</td>
        <td>${Utils.formatCurrency(salary.netSalary)}</td>
        <td>${salary.paymentDate || 'N/A'}</td>
        <td>${salary.paymentMethod || 'N/A'}</td>
        <td>
          <button class="btn-small btn-info" onclick="printSalarySlip('${salary.id}')">Print Slip</button>
          <button class="btn-small btn-secondary" onclick="viewSalaryDetail('${salary.id}')">View</button>
        </td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  return html;
}

// ==================== TAB SWITCHING ====================
function switchSalaryTab(tabName, event) {
  event?.preventDefault();
  currentSalaryTab = tabName;
  const salaries = Storage.getCollection('salaryPayments');
  const staff = Storage.getCollection('staff');
  document.getElementById('salaryContent').innerHTML = renderSalaryTabContent(tabName, salaries, staff);
}

// ==================== FILTER AND SEARCH ====================
function filterSalaries(tab) {
  const salaries = Storage.getCollection('salaryPayments');
  const staff = Storage.getCollection('staff');
  
  if (tab === 'assignment') {
    const searchInput = document.getElementById('salarySearchInput')?.value.toLowerCase() || '';
    const positionFilter = document.getElementById('salaryPositionFilter')?.value || '';
    const statusFilter = document.getElementById('salaryStatusFilter')?.value || '';

    const filteredSalaries = salaries.filter(salary => {
      const staffMember = staff.find(s => s.id === salary.staffId);
      if (!staffMember) return false;

      const matchesSearch = staffMember.name.toLowerCase().includes(searchInput);
      const matchesPosition = !positionFilter || staffMember.position === positionFilter;
      const matchesStatus = !statusFilter || salary.status === statusFilter;
      const matchesYear = salary.academicYear === CONFIG.academicYear.current;

      return matchesSearch && matchesPosition && matchesStatus && matchesYear;
    });

    document.querySelector('table tbody').innerHTML = filteredSalaries.map(salary => {
      const staffMember = staff.find(s => s.id === salary.staffId);
      return `
        <tr>
          <td>${staffMember.name}</td>
          <td>${staffMember.position}</td>
          <td>${salary.month}</td>
          <td>${Utils.formatCurrency(salary.basicSalary)}</td>
          <td>${Utils.formatCurrency(salary.allowances)}</td>
          <td>${Utils.formatCurrency(salary.deductions)}</td>
          <td><strong>${Utils.formatCurrency(salary.netSalary)}</strong></td>
          <td><span class="badge badge-${salary.status === 'paid' ? 'success' : 'warning'}">${salary.status.toUpperCase()}</span></td>
          <td>
            <button class="btn-small btn-info" onclick="viewSalaryDetail('${salary.id}')">View</button>
            <button class="btn-small btn-danger" onclick="deleteSalaryConfirm('${salary.id}')">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
  } else if (tab === 'history') {
    const searchInput = document.getElementById('salaryHistorySearchInput')?.value.toLowerCase() || '';
    const paidSalaries = salaries.filter(s => s.status === 'paid' && s.academicYear === CONFIG.academicYear.current);

    const filteredSalaries = paidSalaries.filter(salary => {
      const staffMember = staff.find(s => s.id === salary.staffId);
      return staffMember && staffMember.name.toLowerCase().includes(searchInput);
    });

    document.querySelector('table tbody').innerHTML = filteredSalaries.map(salary => {
      const staffMember = staff.find(s => s.id === salary.staffId);
      return `
        <tr>
          <td>${staffMember.name}</td>
          <td>${staffMember.position}</td>
          <td>${salary.month}</td>
          <td>${Utils.formatCurrency(salary.netSalary)}</td>
          <td>${salary.paymentDate || 'N/A'}</td>
          <td>${salary.paymentMethod || 'N/A'}</td>
          <td>
            <button class="btn-small btn-info" onclick="printSalarySlip('${salary.id}')">Print Slip</button>
            <button class="btn-small btn-secondary" onclick="viewSalaryDetail('${salary.id}')">View</button>
          </td>
        </tr>
      `;
    }).join('');
  }
}

// ==================== SALARY ASSIGNMENT ====================
function showAssignSalaryForm() {
  document.getElementById('assignSalaryModal').classList.add('show');
  document.getElementById('staffSalaryInfo').style.display = 'none';
}

function onStaffSelected() {
  const select = document.getElementById('salaryStaffSelect');
  const option = select.options[select.selectedIndex];

  if (option.value) {
    document.getElementById('staffSalaryInfo').style.display = 'block';
    document.getElementById('selectedStaffName').textContent = option.text.split('(')[0].trim();
    document.getElementById('selectedStaffPosition').textContent = option.dataset.position;
    document.getElementById('selectedStaffGrade').textContent = option.dataset.grade;
  } else {
    document.getElementById('staffSalaryInfo').style.display = 'none';
  }
}

function calculateNetSalary() {
  const basic = parseFloat(document.getElementById('basicSalary')?.value || 0);
  const allowances = parseFloat(document.getElementById('allowances')?.value || 0);
  const deductions = parseFloat(document.getElementById('deductions')?.value || 0);
  const netSalary = basic + allowances - deductions;

  document.getElementById('netSalaryPreview').textContent = Utils.formatCurrency(netSalary);
}

function saveAssignedSalary(event) {
  event.preventDefault();

  const staffId = document.getElementById('salaryStaffSelect').value;
  const month = document.getElementById('salaryMonth').value;
  const basicSalary = parseFloat(document.getElementById('basicSalary').value);
  const allowances = parseFloat(document.getElementById('allowances').value || 0);
  const deductions = parseFloat(document.getElementById('deductions').value || 0);
  const status = document.getElementById('salaryStatus').value;

  // Validation
  if (!staffId || !month || !basicSalary) {
    alert('Please fill in all required fields');
    return;
  }

  // Check for duplicate salary entry
  const salaries = Storage.getCollection('salaryPayments');
  const exists = salaries.some(s => 
    s.staffId === staffId && 
    s.month === month && 
    s.academicYear === CONFIG.academicYear.current
  );

  if (exists) {
    alert('Salary already assigned for this staff member in this month');
    return;
  }

  const netSalary = basicSalary + allowances - deductions;

  const salary = new Salary(
    staffId,
    month,
    CONFIG.academicYear.current,
    basicSalary,
    allowances,
    deductions,
    netSalary,
    status
  );

  if (Storage.addItem('salaryPayments', salary)) {
    alert('Salary assigned successfully!');
    closeSalaryForm();
    renderSalaryPage();
  } else {
    alert('Error saving salary. Please try again.');
  }
}

// ==================== SALARY PAYMENT RECORDING ====================
function showRecordSalaryPaymentForm(salaryId) {
  const salary = Storage.getItemById('salaryPayments', salaryId);
  if (!salary) {
    alert('Salary record not found');
    return;
  }

  const staff = Storage.getItemById('staff', salary.staffId);
  const modal = document.getElementById('recordSalaryPaymentModal');
  const form = modal.querySelector('form');

  form.innerHTML = `
    <div class="form-group">
      <label>Staff:</label>
      <p>${staff.name} (${staff.position})</p>
    </div>

    <div class="form-group">
      <label>Month:</label>
      <p>${salary.month}</p>
    </div>

    <div class="form-group">
      <label>Net Salary:</label>
      <p><strong>${Utils.formatCurrency(salary.netSalary)}</strong></p>
    </div>

    <div class="form-group">
      <label>Payment Method *</label>
      <select id="paymentMethod" required>
        <option value="">Select Method...</option>
        <option value="cash">Cash</option>
        <option value="check">Check</option>
        <option value="bank_transfer">Bank Transfer</option>
        <option value="online">Online Payment</option>
      </select>
    </div>

    <div class="form-group">
      <label>Reference Number (Check#, Transaction ID, etc.)</label>
      <input type="text" id="referenceNumber" placeholder="Optional reference">
    </div>

    <div class="form-group">
      <label>Payment Date *</label>
      <input type="date" id="paymentDate" required value="${Utils.getTodayDate().split('/').reverse().join('-')}">
    </div>

    <div class="form-group">
      <label>Notes</label>
      <textarea id="paymentNotes" placeholder="Optional notes" rows="2"></textarea>
    </div>

    <div class="form-buttons">
      <button type="button" class="btn btn-primary" onclick="saveSalaryPaymentRecord('${salaryId}')">Record Payment</button>
      <button type="button" class="btn btn-secondary" onclick="closeSalaryPaymentForm()">Cancel</button>
    </div>
  `;

  modal.classList.add('show');
}

function saveSalaryPaymentRecord(salaryId) {
  const paymentMethod = document.getElementById('paymentMethod').value;
  const referenceNumber = document.getElementById('referenceNumber').value;
  const paymentDate = document.getElementById('paymentDate').value;
  const notes = document.getElementById('paymentNotes').value;

  if (!paymentMethod || !paymentDate) {
    alert('Please fill in all required fields');
    return;
  }

  const salary = Storage.getItemById('salaryPayments', salaryId);
  if (!salary) {
    alert('Salary record not found');
    return;
  }

  // Update salary status to paid
  const updates = {
    status: 'paid',
    paymentDate: paymentDate.split('-').reverse().join('/'),
    paymentMethod: paymentMethod,
    referenceNumber: referenceNumber,
    notes: notes
  };

  if (Storage.updateItem('salaryPayments', salaryId, updates)) {
    alert('Payment recorded successfully!');
    closeSalaryPaymentForm();
    renderSalaryPage();
  } else {
    alert('Error recording payment. Please try again.');
  }
}

// ==================== SALARY DETAILS & DELETION ====================
function viewSalaryDetail(salaryId) {
  const salary = Storage.getItemById('salaryPayments', salaryId);
  if (!salary) {
    alert('Salary record not found');
    return;
  }

  const staff = Storage.getItemById('staff', salary.staffId);

  const details = `
    <strong>Staff:</strong> ${staff.name}<br>
    <strong>Position:</strong> ${staff.position}<br>
    <strong>Month:</strong> ${salary.month}<br>
    <strong>Basic Salary:</strong> ${Utils.formatCurrency(salary.basicSalary)}<br>
    <strong>Allowances:</strong> ${Utils.formatCurrency(salary.allowances)}<br>
    <strong>Deductions:</strong> ${Utils.formatCurrency(salary.deductions)}<br>
    <strong>Net Salary:</strong> ${Utils.formatCurrency(salary.netSalary)}<br>
    <strong>Status:</strong> ${salary.status}<br>
    ${salary.paymentDate ? `<strong>Payment Date:</strong> ${salary.paymentDate}<br>` : ''}
    ${salary.paymentMethod ? `<strong>Payment Method:</strong> ${salary.paymentMethod}<br>` : ''}
  `;

  alert(details);
}

function deleteSalaryConfirm(salaryId) {
  const salary = Storage.getItemById('salaryPayments', salaryId);
  const staff = Storage.getItemById('staff', salary.staffId);

  if (confirm(`Delete salary record for ${staff.name} (${salary.month})? This action cannot be undone.`)) {
    if (Storage.deleteItem('salaryPayments', salaryId)) {
      alert('Salary record deleted successfully');
      renderSalaryPage();
    } else {
      alert('Error deleting record');
    }
  }
}

// ==================== SALARY SLIP GENERATION ====================
function printSalarySlip(salaryId) {
  const salary = Storage.getItemById('salaryPayments', salaryId);
  if (!salary) {
    alert('Salary record not found');
    return;
  }

  const staff = Storage.getItemById('staff', salary.staffId);
  const slipNumber = 'SAL-' + salary.month.replace('-', '') + '-' + salaryId.slice(-6);

  const slipHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Salary Slip - ${staff.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .slip-container { max-width: 600px; margin: 0 auto; border: 2px solid #333; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .school-name { font-size: 24px; font-weight: bold; }
        .slip-title { font-size: 18px; font-weight: bold; margin-top: 10px; }
        .info-section { margin-bottom: 20px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 0; }
        .info-label { font-weight: bold; width: 40%; }
        .info-value { width: 55%; }
        .earnings { background-color: #f0f0f0; padding: 10px; margin-bottom: 10px; }
        .deductions { background-color: #ffe6e6; padding: 10px; margin-bottom: 10px; }
        .totals { background-color: #e6f0ff; padding: 10px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 0; }
        .total-label { font-weight: bold; width: 40%; }
        .total-value { width: 55%; text-align: right; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="slip-container">
        <div class="header">
          <div class="school-name">${CONFIG.school.name}</div>
          <div class="slip-title">SALARY SLIP</div>
          <div style="font-size: 12px; color: #666;">Slip No: ${slipNumber}</div>
        </div>

        <div class="info-section">
          <div class="info-row">
            <span class="info-label">Employee Name:</span>
            <span class="info-value">${staff.name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Position:</span>
            <span class="info-value">${staff.position}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Salary Grade:</span>
            <span class="info-value">${staff.salaryGrade || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">For Month:</span>
            <span class="info-value">${salary.month}</span>
          </div>
        </div>

        <div class="earnings">
          <div style="font-weight: bold; margin-bottom: 8px;">EARNINGS:</div>
          <div class="info-row">
            <span class="info-label">Basic Salary:</span>
            <span class="info-value">${Utils.formatCurrency(salary.basicSalary)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Allowances:</span>
            <span class="info-value">${Utils.formatCurrency(salary.allowances)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Gross Salary:</span>
            <span class="info-value"><strong>${Utils.formatCurrency(salary.basicSalary + salary.allowances)}</strong></span>
          </div>
        </div>

        <div class="deductions">
          <div style="font-weight: bold; margin-bottom: 8px;">DEDUCTIONS:</div>
          <div class="info-row">
            <span class="info-label">Deductions:</span>
            <span class="info-value">${Utils.formatCurrency(salary.deductions)}</span>
          </div>
        </div>

        <div class="totals">
          <div class="total-row">
            <span class="total-label">NET SALARY:</span>
            <span class="total-value">${Utils.formatCurrency(salary.netSalary)}</span>
          </div>
          <div class="total-row">
            <span class="total-label">Status:</span>
            <span class="total-value">${salary.status.toUpperCase()}</span>
          </div>
          ${salary.paymentDate ? `
            <div class="total-row">
              <span class="total-label">Payment Date:</span>
              <span class="total-value">${salary.paymentDate}</span>
            </div>
          ` : ''}
        </div>

        <div class="footer">
          <p>This is an official salary slip. Generated on ${Utils.formatDate(new Date().toISOString().split('T')[0])}</p>
          <p>${CONFIG.school.name}</p>
        </div>
      </div>

      <script>
        window.print();
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write(slipHTML);
  printWindow.document.close();
}

// ==================== CLOSE FORMS ====================
function closeSalaryForm() {
  document.getElementById('assignSalaryModal').classList.remove('show');
  document.getElementById('assignSalaryModal').querySelector('form').reset();
}

function closeSalaryPaymentForm() {
  document.getElementById('recordSalaryPaymentModal').classList.remove('show');
}

// ==================== AUTO-GENERATE MONTHLY SALARIES ====================
function generateMonthlySalaries() {
  const staff = Storage.getCollection('staff');
  const salaries = Storage.getCollection('salaryPayments');
  const activeStaff = staff.filter(s => s.status === 'active');

  // Get current month and year
  const today = new Date();
  const currentMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
  const currentYear = CONFIG.academicYear.current;

  if (activeStaff.length === 0) {
    showErrorModal('No active staff members found. Please add staff first.');
    return;
  }

  // Check which staff members need salary generated this month
  const staffNeedingSalary = [];
  const staffAlreadyPaid = [];

  activeStaff.forEach(staffMember => {
    // Check if staff has salary configuration
    if (!staffMember.basicSalary || staffMember.basicSalary === 0) {
      return; // Skip if no salary configured
    }

    // Check if salary already exists for this month
    const exists = salaries.some(s => 
      s.staffId === staffMember.id && 
      s.month === currentMonth && 
      s.academicYear === currentYear
    );

    if (exists) {
      staffAlreadyPaid.push(staffMember.name);
    } else {
      staffNeedingSalary.push(staffMember);
    }
  });

  if (staffNeedingSalary.length === 0) {
    let message = 'No staff members need salary generation for ' + currentMonth;
    if (staffAlreadyPaid.length > 0) {
      message += `\n\nAlready processed: ${staffAlreadyPaid.join(', ')}`;
    }
    showInfoModal(message);
    return;
  }

  // Show confirmation dialog
  let confirmMessage = `Auto-generate salary for ${staffNeedingSalary.length} staff member(s)?\n\nStaff members:\n`;
  confirmMessage += staffNeedingSalary.map(s => `• ${s.name} - ${Utils.formatCurrency(s.basicSalary)}`).join('\n');
  
  if (staffAlreadyPaid.length > 0) {
    confirmMessage += `\n\nAlready processed (${staffAlreadyPaid.length}): ${staffAlreadyPaid.join(', ')}`;
  }

  if (confirm(confirmMessage)) {
    let successCount = 0;

    // Create salary records for each staff member
    staffNeedingSalary.forEach(staffMember => {
      const basicSalary = parseFloat(staffMember.basicSalary || 0);
      const allowances = parseFloat(staffMember.allowances || 0);
      const deductions = parseFloat(staffMember.deductions || 0);
      const netSalary = basicSalary + allowances - deductions;

      const salary = new Salary(
        staffMember.id,
        currentMonth,
        currentYear,
        basicSalary,
        allowances,
        deductions,
        netSalary,
        'pending'
      );

      if (Storage.addItem('salaryPayments', salary.toJSON())) {
        successCount++;
      }
    });

    if (successCount > 0) {
      showSuccessModal(`✅ Successfully generated salary for ${successCount} staff member(s) for ${currentMonth}!\n\nAll salaries set to "Pending" status. Record payments when ready.`);
      renderSalaryPage(); // Refresh the page
    } else {
      showErrorModal('Failed to generate salaries. Please try again.');
    }
  }
}

// ==================== INFO MODAL (for non-error information) ====================
function showInfoModal(message) {
  const modal = document.getElementById('successModal');
  if (modal) {
    modal.querySelector('.modal-content p').textContent = message;
    modal.classList.add('show');
  } else {
    alert(message);
  }
}

function closeSalaryPaymentForm() {
  document.getElementById('recordSalaryPaymentModal').classList.remove('show');
}

// ==================== SALARY MODEL CLASS ====================
class Salary {
  constructor(staffId, month, academicYear, basicSalary, allowances, deductions, netSalary, status = 'pending') {
    this.id = generateId('SAL');
    this.staffId = staffId;
    this.month = month;
    this.academicYear = academicYear;
    this.basicSalary = basicSalary;
    this.allowances = allowances;
    this.deductions = deductions;
    this.netSalary = netSalary;
    this.status = status;
    this.paymentDate = null;
    this.paymentMethod = null;
    this.referenceNumber = null;
    this.notes = null;
  }

  toJSON() {
    return {
      id: this.id,
      staffId: this.staffId,
      month: this.month,
      academicYear: this.academicYear,
      basicSalary: this.basicSalary,
      allowances: this.allowances,
      deductions: this.deductions,
      netSalary: this.netSalary,
      status: this.status,
      paymentDate: this.paymentDate,
      paymentMethod: this.paymentMethod,
      referenceNumber: this.referenceNumber,
      notes: this.notes
    };
  }
}
