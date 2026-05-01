/**
 * Fee Management - Record fees, track payments, generate receipts
 * Handles fee assignments, payments, and financial tracking
 */

let currentFees = [];
let currentFeeTab = 'assignment'; // assignment, payments, history

// ==================== RENDER FEES PAGE ====================
function renderFeesPage() {
  const contentArea = document.getElementById('appContent');

  const fees = Storage.getCollection('fees');
  const payments = Storage.getCollection('feePayments');
  currentFees = fees;

  // Calculate statistics
  const totalFeesDue = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingFees = totalFeesDue - totalPaid;

  const overduePayments = fees.filter(f => {
    if (f.status === 'paid') return false;
    const feePayments = payments.filter(p => p.feeId === f.id);
    const totalPaidForFee = feePayments.reduce((sum, p) => sum + p.amount, 0);
    return totalPaidForFee < f.amount && Utils.isOverdue(f.dueDate);
  });

  const html = `
    <div class="card">
      <div class="card-header flex-between">
        <h2>💰 Fee Management</h2>
        <button class="btn btn-success" onclick="showAssignFeeForm()">+ Assign Fees to Student</button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>💵 Total Fees Due</h3>
        <div class="value">${Utils.formatCurrency(totalFeesDue)}</div>
      </div>
      <div class="stat-card">
        <h3>✅ Total Collected</h3>
        <div class="value" style="color: #27ae60;">${Utils.formatCurrency(totalPaid)}</div>
      </div>
      <div class="stat-card">
        <h3>⏳ Pending Amount</h3>
        <div class="value" style="color: #f39c12;">${Utils.formatCurrency(pendingFees)}</div>
      </div>
      <div class="stat-card">
        <h3>⚠️ Overdue Fees</h3>
        <div class="value" style="color: #e74c3c;">${overduePayments.length}</div>
      </div>
    </div>

    <div class="card">
      <div class="tabs">
        <button class="tab ${currentFeeTab === 'assignment' ? 'active' : ''}" onclick="switchFeeTab('assignment', event)">📝 Assign Fees</button>
        <button class="tab ${currentFeeTab === 'payments' ? 'active' : ''}" onclick="switchFeeTab('payments', event)">💳 Record Payment</button>
        <button class="tab ${currentFeeTab === 'history' ? 'active' : ''}" onclick="switchFeeTab('history', event)">📊 Payment History</button>
      </div>

      <div class="card-body">
        <div id="feeContent">
          ${renderFeeTabContent(currentFeeTab, fees, payments)}
        </div>
      </div>
    </div>

    <!-- Assign Fee Modal -->
    <div id="assignFeeModal" class="modal">
      <div class="modal-content" style="max-width: 600px;">
        <span class="close" onclick="closeFeeForm()">&times;</span>
        <h2>Assign Fees to Student</h2>
        <form onsubmit="saveAssignedFees(event)">
          <div class="form-group">
            <label>Select Student *</label>
            <select id="feeStudentSelect" required onchange="onStudentSelected()">
              <option value="">Select Student...</option>
              ${Storage.getCollection('students')
                .filter(s => s.status === 'active')
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(s => 
                  `<option value="${s.id}" data-year="${s.academicYear}">${s.name} (${s.class}) - ${s.academicYear}</option>`
              ).join('')}
            </select>
            <small style="color: #999; display: block; margin-top: 4px;">Shows all active students. Fees will be assigned for their academic year.</small>
          </div>

          <div id="studentFeeInfo" style="display: none; margin-bottom: 15px; padding: 10px; background-color: #f0f0f0; border-radius: 4px;">
            <p><strong>Student:</strong> <span id="selectedStudentName"></span></p>
            <p><strong>Class:</strong> <span id="selectedStudentClass"></span></p>
            <p><strong>Existing Fees:</strong> <span id="existingFeesCount">0</span></p>
          </div>

          <div class="form-group">
            <label>Select Fee Types to Assign *</label>
            <div id="feeTypeCheckboxes" style="border: 1px solid #ddd; padding: 10px; border-radius: 4px;">
              <!-- Dynamically populated -->
            </div>
          </div>

          <div id="feeAssignErrors" class="error-box" style="display: none;"></div>

          <div class="form-row">
            <button type="submit" class="btn btn-success">✅ Assign Fees</button>
            <button type="button" class="btn btn-secondary" onclick="closeFeeForm()">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Record Payment Modal -->
    <div id="recordPaymentModal" class="modal">
      <div class="modal-content">
        <span class="close" onclick="closePaymentForm()">&times;</span>
        <h2>Record Fee Payment</h2>
        <form onsubmit="savePayment(event)">
          <input type="hidden" id="paymentFeeId">
          <input type="hidden" id="paymentStudentId">

          <div id="paymentInfo" style="margin-bottom: 15px; padding: 10px; background-color: #f0f0f0; border-radius: 4px;">
            <p><strong>Student:</strong> <span id="paymentStudentName"></span></p>
            <p><strong>Fee Type:</strong> <span id="paymentFeeType"></span></p>
            <p><strong>Total Due:</strong> <span id="paymentTotalDue"></span></p>
            <p><strong>Already Paid:</strong> <span id="paymentAlreadyPaid"></span></p>
            <p><strong>Outstanding:</strong> <span id="paymentOutstanding"></span></p>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Payment Amount *</label>
              <input type="number" id="paymentAmount" required min="0.01" step="0.01">
            </div>
            <div class="form-group">
              <label>Payment Date *</label>
              <input type="date" id="paymentDate" required value="${Utils.getTodayDate()}">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Payment Method *</label>
              <select id="paymentMethod" required>
                ${CONFIG.paymentMethods.map(m => `<option value="${m}">${m}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Reference Number</label>
              <input type="text" id="paymentReference" placeholder="e.g., Check #, Transaction ID">
            </div>
          </div>

          <div class="form-group">
            <label>Received By</label>
            <input type="text" id="paymentReceivedBy" placeholder="Name of staff member">
          </div>

          <div class="form-group">
            <label>Remarks</label>
            <textarea id="paymentRemarks" placeholder="Additional notes..."></textarea>
          </div>

          <div id="paymentErrors" class="error-box" style="display: none;"></div>

          <div class="form-row">
            <button type="submit" class="btn btn-success">💾 Record Payment</button>
            <button type="button" class="btn btn-secondary" onclick="closePaymentForm()">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;

  contentArea.innerHTML = html;
}

// ==================== RENDER FEE TAB CONTENT ====================
function renderFeeTabContent(tab, fees, payments) {
  switch (tab) {
    case 'assignment':
      return renderFeeAssignmentView(fees, payments);
    case 'payments':
      return renderPaymentRecordingView(fees, payments);
    case 'history':
      return renderPaymentHistoryView(payments);
    default:
      return '';
  }
}

// ==================== FEE ASSIGNMENT VIEW ====================
function renderFeeAssignmentView(fees, payments) {
  if (fees.length === 0) {
    return `
      <div class="search-box" style="margin-bottom: 15px;">
        <div class="search-input">
          <input type="text" placeholder="Search by student name..." onkeyup="filterFees('assignment')" id="feeSearchInput">
        </div>
        <select id="feeClassFilter" onchange="filterFees('assignment')">
          <option value="">All Classes</option>
          ${CONFIG.classes.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
        <select id="feeStatusFilter" onchange="filterFees('assignment')">
          <option value="">All Fee Status</option>
          <option value="pending">Pending</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="paid">Paid</option>
        </select>
      </div>
      <p class="no-data">No fees assigned yet. Click "Assign Fees to Student" to get started.</p>
    `;
  }

  // Group fees by student
  const feesByStudent = Storage.groupBy(fees, 'studentId');

  return `
    <div class="search-box" style="margin-bottom: 15px;">
      <div class="search-input">
        <input type="text" placeholder="Search by student name..." onkeyup="filterFees('assignment')" id="feeSearchInput">
      </div>
      <select id="feeClassFilter" onchange="filterFees('assignment')">
        <option value="">All Classes</option>
        ${CONFIG.classes.map(c => `<option value="${c}">${c}</option>`).join('')}
      </select>
      <select id="feeStatusFilter" onchange="filterFees('assignment')">
        <option value="">All Fee Status</option>
        <option value="pending">Pending</option>
        <option value="partially_paid">Partially Paid</option>
        <option value="paid">Paid</option>
      </select>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Class</th>
            <th>Fee Type</th>
            <th>Amount</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Paid</th>
            <th>Outstanding</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${fees.map(fee => {
            const student = Storage.getItemById('students', fee.studentId);
            const feePayments = payments.filter(p => p.feeId === fee.id);
            const totalPaid = feePayments.reduce((sum, p) => sum + p.amount, 0);
            const outstanding = fee.amount - totalPaid;
            const feeTypeName = CONFIG.fees.types[fee.feeType]?.name || fee.feeType;

            return `
              <tr>
                <td><strong>${student ? student.name : 'Unknown'}</strong></td>
                <td>${student ? student.class : '-'}</td>
                <td>${feeTypeName}</td>
                <td>${Utils.formatCurrency(fee.amount)}</td>
                <td>${Utils.formatDate(fee.dueDate)}</td>
                <td>
                  ${fee.status === 'paid' ? '<span class="status-badge status-green">PAID</span>' :
                    fee.status === 'partially_paid' ? '<span class="status-badge status-blue">PARTIALLY PAID</span>' :
                    Utils.isOverdue(fee.dueDate) ? '<span class="status-badge status-red">OVERDUE</span>' :
                    '<span class="status-badge status-orange">PENDING</span>'}
                </td>
                <td>${Utils.formatCurrency(totalPaid)}</td>
                <td><strong style="color: ${outstanding > 0 ? '#e74c3c' : '#27ae60'};">${Utils.formatCurrency(outstanding)}</strong></td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-primary btn-small" onclick="createPaymentForm('${fee.id}')">Pay</button>
                    <button class="btn btn-info btn-small" onclick="viewFeeDetails('${fee.id}')">Details</button>
                    <button class="btn btn-danger btn-small" onclick="deleteFeeConfirm('${fee.id}')">Delete</button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ==================== PAYMENT RECORDING VIEW ====================
function renderPaymentRecordingView(fees, payments) {
  const pendingFees = fees.filter(f => {
    const feePayments = payments.filter(p => p.feeId === f.id);
    const totalPaid = feePayments.reduce((sum, p) => sum + p.amount, 0);
    return totalPaid < f.amount;
  });

  if (pendingFees.length === 0) {
    return '<p class="no-data">All fees are paid! No pending payments.</p>';
  }

  return `
    <div class="info-message">Select a fee to record a payment for it.</div>
    <div class="grid-2" style="margin-top: 15px;">
      ${pendingFees.map(fee => {
        const student = Storage.getItemById('students', fee.studentId);
        const feePayments = payments.filter(p => p.feeId === fee.id);
        const totalPaid = feePayments.reduce((sum, p) => sum + p.amount, 0);
        const outstanding = fee.amount - totalPaid;
        const feeTypeName = CONFIG.fees.types[fee.feeType]?.name || fee.feeType;

        return `
          <div class="card">
            <div class="card-body">
              <h3>${student ? student.name : 'Unknown'}</h3>
              <p><strong>Class:</strong> ${student ? student.class : '-'}</p>
              <p><strong>Fee Type:</strong> ${feeTypeName}</p>
              <p><strong>Total Due:</strong> ${Utils.formatCurrency(fee.amount)}</p>
              <p><strong>Already Paid:</strong> ${Utils.formatCurrency(totalPaid)}</p>
              <p><strong>Outstanding:</strong> <span style="color: #e74c3c; font-weight: bold;">${Utils.formatCurrency(outstanding)}</span></p>
              <p style="font-size: 12px; color: #999;">Due: ${Utils.formatDate(fee.dueDate)}</p>
              ${Utils.isOverdue(fee.dueDate) ? '<p style="color: #e74c3c; font-weight: bold; font-size: 12px;">⚠️ OVERDUE</p>' : ''}
              <button class="btn btn-success" onclick="createPaymentForm('${fee.id}')" style="width: 100%; margin-top: 10px;">💳 Record Payment</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ==================== PAYMENT HISTORY VIEW ====================
function renderPaymentHistoryView(payments) {
  if (payments.length === 0) {
    return '<p class="no-data">No payments recorded yet.</p>';
  }

  return `
    <div class="search-box" style="margin-bottom: 15px;">
      <div class="search-input">
        <input type="text" placeholder="Search by student name..." onkeyup="filterFees('history')" id="historySearchInput">
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Fee Type</th>
            <th>Amount Paid</th>
            <th>Payment Date</th>
            <th>Payment Method</th>
            <th>Reference</th>
            <th>Received By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${payments.map(payment => {
            const fee = Storage.getItemById('fees', payment.feeId);
            const student = fee ? Storage.getItemById('students', fee.studentId) : null;
            const feeTypeName = fee && CONFIG.fees.types[fee.feeType] ? CONFIG.fees.types[fee.feeType].name : fee?.feeType || '?';

            return `
              <tr>
                <td><strong>${student ? student.name : 'Unknown'}</strong></td>
                <td>${feeTypeName}</td>
                <td>${Utils.formatCurrency(payment.amount)}</td>
                <td>${Utils.formatDate(payment.paymentDate)}</td>
                <td>${payment.paymentMethod}</td>
                <td><small>${payment.referenceNumber || '-'}</small></td>
                <td><small>${payment.receivedBy || '-'}</small></td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-info btn-small" onclick="viewPaymentDetail('${payment.id}')">View</button>
                    <button class="btn btn-danger btn-small" onclick="deletePaymentConfirm('${payment.id}')">Delete</button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ==================== SWITCH FEE TAB ====================
function switchFeeTab(tabName, event) {
  currentFeeTab = tabName;
  const fees = Storage.getCollection('fees');
  const payments = Storage.getCollection('feePayments');
  const content = document.getElementById('feeContent');

  if (content) {
    content.innerHTML = renderFeeTabContent(tabName, fees, payments);
  }

  // Update active tab
  document.querySelectorAll('.tabs .tab').forEach(tab => {
    tab.classList.toggle('active', tab === event.currentTarget);
  });
}

// ==================== FILTER FEES ====================
function filterFees(tab) {
  const fees = Storage.getCollection('fees');
  const payments = Storage.getCollection('feePayments');
  let filtered = [...fees];

  if (tab === 'assignment') {
    const searchInput = document.getElementById('feeSearchInput')?.value || '';
    const classFilter = document.getElementById('feeClassFilter')?.value || '';
    const statusFilter = document.getElementById('feeStatusFilter')?.value || '';

    if (searchInput) {
      filtered = filtered.filter(f => {
        const student = Storage.getItemById('students', f.studentId);
        return student && student.name.toLowerCase().includes(searchInput.toLowerCase());
      });
    }

    if (classFilter) {
      filtered = filtered.filter(f => {
        const student = Storage.getItemById('students', f.studentId);
        return student && student.class === classFilter;
      });
    }

    if (statusFilter) {
      filtered = filtered.filter(f => f.status === statusFilter);
    }

    const content = document.getElementById('feeContent');
    if (content) {
      content.innerHTML = renderFeeAssignmentView(filtered, payments);
    }
  } else if (tab === 'history') {
    const searchInput = document.getElementById('historySearchInput')?.value || '';

    if (searchInput) {
      const filteredPayments = payments.filter(p => {
        const fee = Storage.getItemById('fees', p.feeId);
        const student = fee ? Storage.getItemById('students', fee.studentId) : null;
        return student && student.name.toLowerCase().includes(searchInput.toLowerCase());
      });

      const content = document.getElementById('feeContent');
      if (content) {
        content.innerHTML = renderPaymentHistoryView(filteredPayments);
      }
    }
  }
}

// ==================== SHOW ASSIGN FEE FORM ====================
function showAssignFeeForm() {
  const studentSelect = document.getElementById('feeStudentSelect');
  const activeStudents = Storage.getCollection('students')
    .filter(s => s.status === 'active')
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!studentSelect) {
    showErrorModal('Student selector not found. Please refresh the page.');
    return;
  }

  studentSelect.innerHTML = '<option value="">Select Student...</option>' +
    activeStudents.map(s =>
      `<option value="${s.id}" data-year="${s.academicYear}">${s.name} (${s.class}) - ${s.academicYear}</option>`
    ).join('');

  if (activeStudents.length === 0) {
    Validation.showValidationErrors(['No active students available. Add a student first.'], 'feeAssignErrors');
  } else {
    document.getElementById('feeAssignErrors').style.display = 'none';
  }

  studentSelect.value = '';
  document.getElementById('studentFeeInfo').style.display = 'none';
  document.getElementById('feeTypeCheckboxes').innerHTML = '';

  // Create fee type checkboxes
  const checkboxes = Object.entries(CONFIG.fees.types).map(([key, type]) => `
    <label style="display: block; margin-bottom: 8px;">
      <input type="checkbox" name="feeTypes" value="${key}" class="feeTypeCheckbox">
      ${type.name} ${type.mandatory ? '<span style="color: #e74c3c;">*</span>' : ''}
    </label>
  `).join('');

  document.getElementById('feeTypeCheckboxes').innerHTML = checkboxes;
  document.getElementById('assignFeeModal').classList.add('show');
}

// ==================== ON STUDENT SELECTED ====================
function onStudentSelected() {
  const studentId = document.getElementById('feeStudentSelect').value;
  const studentInfo = document.getElementById('studentFeeInfo');

  if (!studentId) {
    studentInfo.style.display = 'none';
    return;
  }

  const student = Storage.getItemById('students', studentId);
  if (student) {
    const studentFees = Storage.getStudentFeesByYear(studentId, student.academicYear);

    document.getElementById('selectedStudentName').textContent = student.name;
    document.getElementById('selectedStudentClass').textContent = student.class;
    document.getElementById('existingFeesCount').textContent = studentFees.length;

    studentInfo.style.display = 'block';
  }
}

// ==================== SAVE ASSIGNED FEES ====================
function saveAssignedFees(event) {
  event.preventDefault();

  const studentId = document.getElementById('feeStudentSelect').value;
  const student = Storage.getItemById('students', studentId);

  if (!student) {
    Validation.showValidationErrors(['Please select a student'], 'feeAssignErrors');
    return;
  }

  const selectedFeeTypes = Array.from(document.querySelectorAll('.feeTypeCheckbox:checked')).map(cb => cb.value);

  if (selectedFeeTypes.length === 0) {
    Validation.showValidationErrors(['Please select at least one fee type'], 'feeAssignErrors');
    return;
  }

  // Get fee amounts for student's class
  const classFeesConfig = CONFIG.fees.amountPerClass[student.class] || {};

  let successCount = 0;

  selectedFeeTypes.forEach(feeType => {
    // Check if fee already exists
    const existingFee = Storage.getCollection('fees').find(f =>
      f.studentId === studentId &&
      f.academicYear === student.academicYear &&
      f.feeType === feeType
    );

    if (!existingFee) {
      const feeAmount = classFeesConfig[feeType] || 0;

      if (feeAmount > 0) {
        const feeData = {
          id: generateId('FEE'),
          studentId: studentId,
          academicYear: student.academicYear,
          feeType: feeType,
          amount: feeAmount,
          dueDate: new Fee({ academicYear: student.academicYear }).calculateDueDate(),
          status: 'pending',
          createdDate: Utils.getTodayDate()
        };

        if (Storage.addItem('fees', feeData)) {
          successCount++;
        }
      }
    }
  });

  if (successCount > 0) {
    showSuccessModal(`${successCount} fee(s) assigned successfully!`);
    document.getElementById('assignFeeModal').classList.remove('show');
    renderFeesPage();
  } else {
    Validation.showValidationErrors(['No new fees were assigned (may already exist)'], 'feeAssignErrors');
  }
}

// ==================== CREATE PAYMENT FORM ====================
function createPaymentForm(feeId) {
  const fee = Storage.getItemById('fees', feeId);
  const student = Storage.getItemById('students', fee.studentId);
  const payments = Storage.getCollection('feePayments');
  const feePayments = payments.filter(p => p.feeId === feeId);
  const totalPaid = feePayments.reduce((sum, p) => sum + p.amount, 0);
  const outstanding = fee.amount - totalPaid;
  const feeTypeName = CONFIG.fees.types[fee.feeType]?.name || fee.feeType;

  document.getElementById('paymentFeeId').value = feeId;
  document.getElementById('paymentStudentId').value = fee.studentId;
  document.getElementById('paymentStudentName').textContent = student.name;
  document.getElementById('paymentFeeType').textContent = feeTypeName;
  document.getElementById('paymentTotalDue').textContent = Utils.formatCurrency(fee.amount);
  document.getElementById('paymentAlreadyPaid').textContent = Utils.formatCurrency(totalPaid);
  document.getElementById('paymentOutstanding').textContent = Utils.formatCurrency(outstanding);
  document.getElementById('paymentAmount').value = outstanding;
  document.getElementById('paymentDate').value = Utils.getTodayDate();
  document.getElementById('paymentMethod').value = 'Cash';
  document.getElementById('paymentReference').value = '';
  document.getElementById('paymentReceivedBy').value = '';
  document.getElementById('paymentRemarks').value = '';
  document.getElementById('paymentErrors').style.display = 'none';

  document.getElementById('recordPaymentModal').classList.add('show');
}

// ==================== SAVE PAYMENT ====================
function savePayment(event) {
  event.preventDefault();

  const feeId = document.getElementById('paymentFeeId').value;
  const studentId = document.getElementById('paymentStudentId').value;
  const amount = parseFloat(document.getElementById('paymentAmount').value);
  const paymentDate = document.getElementById('paymentDate').value;
  const paymentMethod = document.getElementById('paymentMethod').value;
  const referenceNumber = document.getElementById('paymentReference').value;
  const receivedBy = document.getElementById('paymentReceivedBy').value;
  const remarks = document.getElementById('paymentRemarks').value;

  // Validate
  const paymentData = {
    studentId, feeId, amount, paymentDate, paymentMethod, referenceNumber, receivedBy, remarks
  };

  const validation = Validation.validateFeePayment(paymentData);
  if (!validation.isValid) {
    Validation.showValidationErrors(validation.errors, 'paymentErrors');
    return;
  }

  // Save payment
  const payment = Models.createFeePayment(paymentData);

  if (Storage.addItem('feePayments', payment.toJSON())) {
    // Update fee status
    const fee = Storage.getItemById('fees', feeId);
    const payments = Storage.getCollection('feePayments');
    const feePayments = payments.filter(p => p.feeId === feeId);
    const totalPaidForFee = feePayments.reduce((sum, p) => sum + p.amount, 0);

    let newStatus = 'pending';
    if (totalPaidForFee >= fee.amount) {
      newStatus = 'paid';
    } else if (totalPaidForFee > 0) {
      newStatus = 'partially_paid';
    }

    Storage.updateItem('fees', feeId, { status: newStatus });

    // Generate receipt number
    const receiptNumber = Utils.generateReceiptNumber(studentId, paymentDate);

    showSuccessModal(`Payment recorded successfully!\nReceipt #${receiptNumber}`);
    document.getElementById('recordPaymentModal').classList.remove('show');
    renderFeesPage();
  } else {
    Validation.showValidationErrors(['Failed to save payment'], 'paymentErrors');
  }
}

// ==================== VIEW FEE DETAILS ====================
function viewFeeDetails(feeId) {
  const fee = Storage.getItemById('fees', feeId);
  const student = Storage.getItemById('students', fee.studentId);
  const payments = Storage.getCollection('feePayments');
  const feePayments = payments.filter(p => p.feeId === feeId);
  const totalPaid = feePayments.reduce((sum, p) => sum + p.amount, 0);
  const outstanding = fee.amount - totalPaid;
  const feeTypeName = CONFIG.fees.types[fee.feeType]?.name || fee.feeType;

  let paymentHistory = '';
  if (feePayments.length > 0) {
    paymentHistory = `
      <h4>Payment History</h4>
      <ul style="list-style: none; padding: 0;">
        ${feePayments.map(p => `
          <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
            <strong>${Utils.formatCurrency(p.amount)}</strong> on ${Utils.formatDate(p.paymentDate)}
            <br><small style="color: #999;">via ${p.paymentMethod}${p.referenceNumber ? ' (#' + p.referenceNumber + ')' : ''}</small>
          </li>
        `).join('')}
      </ul>
    `;
  } else {
    paymentHistory = '<p class="no-data">No payments recorded for this fee.</p>';
  }

  const detail = `
    <h3>${feeTypeName}</h3>
    <p><strong>Student:</strong> ${student.name}</p>
    <p><strong>Class:</strong> ${student.class}</p>
    <p><strong>Academic Year:</strong> ${fee.academicYear}-${fee.academicYear + 1}</p>
    <hr>
    <h4>Fee Details</h4>
    <p><strong>Total Amount Due:</strong> ${Utils.formatCurrency(fee.amount)}</p>
    <p><strong>Total Paid:</strong> ${Utils.formatCurrency(totalPaid)}</p>
    <p><strong>Outstanding:</strong> <span style="color: ${outstanding > 0 ? '#e74c3c' : '#27ae60'}; font-weight: bold;">${Utils.formatCurrency(outstanding)}</span></p>
    <p><strong>Due Date:</strong> ${Utils.formatDate(fee.dueDate)}</p>
    <p><strong>Status:</strong> ${Utils.getStatusBadge(fee.status)}</p>
    ${Utils.isOverdue(fee.dueDate) && outstanding > 0 ? `<p style="color: #e74c3c; font-weight: bold;">⚠️ OVERDUE (${Utils.getDaysOverdue(fee.dueDate)} days)</p>` : ''}
    <hr>
    ${paymentHistory}
    <p style="margin-top: 15px;">
      ${outstanding > 0 ? `<button class="btn btn-success btn-small" onclick="createPaymentForm('${fee.id}')">💳 Record Payment</button>` : ''}
      <button class="btn btn-secondary btn-small" onclick="closeModal('detailModal')">Close</button>
    </p>
  `;

  let modal = document.getElementById('detailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'detailModal';
    modal.className = 'modal';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="closeModal('detailModal')">&times;</span>
      <div class="modal-body">${detail}</div>
    </div>
  `;
  modal.classList.add('show');
}

// ==================== VIEW PAYMENT DETAIL ====================
function viewPaymentDetail(paymentId) {
  const payment = Storage.getItemById('feePayments', paymentId);
  const fee = Storage.getItemById('fees', payment.feeId);
  const student = Storage.getItemById('students', fee.studentId);
  const feeTypeName = CONFIG.fees.types[fee.feeType]?.name || fee.feeType;
  const receiptNumber = Utils.generateReceiptNumber(fee.studentId, payment.paymentDate);

  const detail = `
    <h3>Payment Receipt #${receiptNumber}</h3>
    <p><strong>Date:</strong> ${Utils.formatDate(payment.paymentDate)}</p>
    <hr>
    <h4>Student Information</h4>
    <p><strong>Name:</strong> ${student.name}</p>
    <p><strong>Class:</strong> ${student.class}</p>
    <p><strong>Roll Number:</strong> ${student.rollNumber || 'N/A'}</p>
    <hr>
    <h4>Payment Details</h4>
    <p><strong>Fee Type:</strong> ${feeTypeName}</p>
    <p><strong>Amount Paid:</strong> <strong style="font-size: 18px; color: #27ae60;">${Utils.formatCurrency(payment.amount)}</strong></p>
    <p><strong>Payment Method:</strong> ${payment.paymentMethod}</p>
    ${payment.referenceNumber ? `<p><strong>Reference Number:</strong> ${payment.referenceNumber}</p>` : ''}
    ${payment.receivedBy ? `<p><strong>Received By:</strong> ${payment.receivedBy}</p>` : ''}
    ${payment.remarks ? `<p><strong>Remarks:</strong> ${payment.remarks}</p>` : ''}
    <hr>
    <p style="margin-top: 15px;">
      <button class="btn btn-primary btn-small" onclick="printReceipt('${paymentId}')">🖨️ Print Receipt</button>
      <button class="btn btn-secondary btn-small" onclick="closeModal('detailModal')">Close</button>
    </p>
  `;

  let modal = document.getElementById('detailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'detailModal';
    modal.className = 'modal';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="closeModal('detailModal')">&times;</span>
      <div class="modal-body">${detail}</div>
    </div>
  `;
  modal.classList.add('show');
}

// ==================== DELETE FEE ====================
function deleteFeeConfirm(feeId) {
  const fee = Storage.getItemById('fees', feeId);
  showConfirmModal(`Delete this fee assignment? This will also delete all payment records for it.`, () => {
    const payments = Storage.getCollection('feePayments').filter(p => p.feeId === feeId);
    payments.forEach(p => Storage.deleteItem('feePayments', p.id));
    Storage.deleteItem('fees', feeId);
    showSuccessModal('Fee deleted!');
    renderFeesPage();
  });
}

// ==================== DELETE PAYMENT ====================
function deletePaymentConfirm(paymentId) {
  showConfirmModal('Delete this payment record?', () => {
    const payment = Storage.getItemById('feePayments', paymentId);
    Storage.deleteItem('feePayments', paymentId);

    // Update fee status
    const fee = Storage.getItemById('fees', payment.feeId);
    const payments = Storage.getCollection('feePayments').filter(p => p.feeId === payment.feeId);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    let newStatus = 'pending';
    if (totalPaid >= fee.amount) {
      newStatus = 'paid';
    } else if (totalPaid > 0) {
      newStatus = 'partially_paid';
    }

    Storage.updateItem('fees', payment.feeId, { status: newStatus });

    showSuccessModal('Payment deleted!');
    renderFeesPage();
  });
}

// ==================== PRINT RECEIPT ====================
function printReceipt(paymentId) {
  const payment = Storage.getItemById('feePayments', paymentId);
  const fee = Storage.getItemById('fees', payment.feeId);
  const student = Storage.getItemById('students', fee.studentId);
  const feeTypeName = CONFIG.fees.types[fee.feeType]?.name || fee.feeType;
  const receiptNumber = Utils.generateReceiptNumber(fee.studentId, payment.paymentDate);

  const receipt = `
    <div class="document-container">
      <div class="document">
        <div class="receipt-header">
          <h1>${CONFIG.school.name}</h1>
          <p>${CONFIG.school.address}</p>
          <p>Phone: ${CONFIG.school.phone} | Email: ${CONFIG.school.email}</p>
        </div>

        <div class="document-number">
          Receipt #${receiptNumber}
        </div>

        <div class="receipt-section">
          <div class="receipt-section-title">Student Information</div>
          <div class="receipt-item">
            <label>Name:</label>
            <span class="value">${student.name}</span>
          </div>
          <div class="receipt-item">
            <label>Class:</label>
            <span class="value">${student.class}</span>
          </div>
          <div class="receipt-item">
            <label>Roll Number:</label>
            <span class="value">${student.rollNumber || 'N/A'}</span>
          </div>
          <div class="receipt-item">
            <label>Academic Year:</label>
            <span class="value">${fee.academicYear}-${fee.academicYear + 1}</span>
          </div>
        </div>

        <div class="receipt-section">
          <div class="receipt-section-title">Payment Details</div>
          <div class="receipt-item">
            <label>Fee Type:</label>
            <span class="value">${feeTypeName}</span>
          </div>
          <div class="receipt-item">
            <label>Amount Paid:</label>
            <span class="value">${Utils.formatCurrency(payment.amount)}</span>
          </div>
          <div class="receipt-item">
            <label>Payment Method:</label>
            <span class="value">${payment.paymentMethod}</span>
          </div>
          <div class="receipt-item">
            <label>Payment Date:</label>
            <span class="value">${Utils.formatDate(payment.paymentDate)}</span>
          </div>
          ${payment.referenceNumber ? `
            <div class="receipt-item">
              <label>Reference #:</label>
              <span class="value">${payment.referenceNumber}</span>
            </div>
          ` : ''}
        </div>

        <div class="receipt-section">
          <div class="receipt-section-title">Balance Information</div>
          ${(() => {
            const payments = Storage.getCollection('feePayments').filter(p => p.feeId === fee.id);
            const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
            const outstanding = fee.amount - totalPaid;
            return `
              <div class="receipt-item">
                <label>Total Fee Amount:</label>
                <span class="value">${Utils.formatCurrency(fee.amount)}</span>
              </div>
              <div class="receipt-item">
                <label>Total Paid (including this):</label>
                <span class="value">${Utils.formatCurrency(totalPaid)}</span>
              </div>
              <div class="receipt-item">
                <label>Outstanding Balance:</label>
                <span class="value" style="color: ${outstanding > 0 ? '#e74c3c' : '#27ae60'}; font-weight: bold;">${Utils.formatCurrency(outstanding)}</span>
              </div>
            `;
          })()}
        </div>

        <div class="document-footer">
          <p>Thank you for the payment!</p>
          <p>Receipt Date: ${Utils.formatDate(Utils.getTodayDate())}</p>
          <p>Printed from: ${CONFIG.school.name} Management System</p>
        </div>
      </div>
    </div>
  `;

  const receiptWindow = window.open('', '', 'height=600,width=800');
  receiptWindow.document.write('<html><head><title>Fee Receipt</title>');
  receiptWindow.document.write('<link rel="stylesheet" href="css/print.css">');
  receiptWindow.document.write('<style>body { font-family: Arial, sans-serif; }</style>');
  receiptWindow.document.write('</head><body>');
  receiptWindow.document.write(receipt);
  receiptWindow.document.write('</body></html>');
  receiptWindow.document.close();
  receiptWindow.print();
}

// ==================== CLOSE FORMS ====================
function closeFeeForm() {
  document.getElementById('assignFeeModal').classList.remove('show');
}

function closePaymentForm() {
  document.getElementById('recordPaymentModal').classList.remove('show');
}
