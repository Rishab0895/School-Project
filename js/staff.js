/**
 * Staff Management - Add, Edit, Delete, View Staff Members
 */

let currentStaff = [];
let currentStaffFilter = 'active';

// ==================== RENDER STAFF PAGE ====================
function renderStaffPage() {
  const contentArea = document.getElementById('appContent');

  const staff = Storage.getCollection('staff');
  currentStaff = staff;

  const html = `
    <div class="card">
      <div class="card-header flex-between">
        <h2>👨‍💼 Staff Management</h2>
        <button class="btn btn-success" onclick="showAddStaffForm()">+ Add New Staff Member</button>
      </div>
      <div class="card-body">
        <div class="search-box">
          <div class="search-input">
            <input type="text" id="staffSearch" placeholder="Search by name, email, or phone..." onkeyup="filterStaff()">
          </div>
          <div class="filter-group">
            <select id="staffPositionFilter" onchange="filterStaff()">
              <option value="">All Positions</option>
              ${CONFIG.staff.positions.map(p => `<option value="${p}">${p}</option>`).join('')}
            </select>
            <select id="staffStatusFilter" onchange="filterStaff()">
              <option value="active">Active Staff</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
              <option value="retired">Retired</option>
              <option value="">All Statuses</option>
            </select>
          </div>
        </div>

        <div id="staffTable">
          ${renderStaffTable(staff)}
        </div>
      </div>
    </div>

    <!-- Add/Edit Staff Modal -->
    <div id="staffFormModal" class="modal">
      <div class="modal-content">
        <span class="close" onclick="closeStaffForm()">&times;</span>
        <h2 id="staffFormTitle">Add New Staff Member</h2>
        <form onsubmit="saveStaff(event)">
          <input type="hidden" id="staffId">

          <div class="form-row">
            <div class="form-group">
              <label>Staff Name *</label>
              <input type="text" id="staffName" required>
            </div>
            <div class="form-group">
              <label>Position *</label>
              <select id="staffPosition" required>
                <option value="">Select Position</option>
                ${CONFIG.staff.positions.map(p => `<option value="${p}">${p}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Department</label>
              <select id="staffDepartment">
                ${CONFIG.staff.departments.map(d => `<option value="${d}">${d}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Salary Grade</label>
              <select id="staffSalaryGrade">
                ${Object.keys(CONFIG.staff.grades).map(g => `<option value="${g}">${g}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Status</label>
              <select id="staffStatus">
                ${CONFIG.status.staff.map(s => `<option value="${s}">${Utils.toTitleCase(s.replace(/_/g, ' '))}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Hire Date</label>
              <input type="date" id="staffHireDate">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Date of Birth</label>
              <input type="date" id="staffDOB">
            </div>
            <div class="form-group">
              <label>Gender</label>
              <select id="staffGender">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="staffEmail">
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="tel" id="staffPhone">
            </div>
          </div>

          <div class="form-group">
            <label>Address</label>
            <input type="text" id="staffAddress">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Bank Account Number</label>
              <input type="text" id="staffBankAccount">
            </div>
            <div class="form-group">
              <label>Bank Name</label>
              <input type="text" id="staffBankName">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>IFSC Code</label>
              <input type="text" id="staffIFSCCode">
            </div>
            <div class="form-group">
              <label>Account Holder Name</label>
              <input type="text" id="staffAccountHolderName">
            </div>
          </div>

          <div style="background-color: #f0f8ff; padding: 15px; border-radius: 4px; margin-bottom: 15px; border-left: 4px solid #3498db;">
            <h4 style="margin-top: 0; margin-bottom: 15px;">💰 Monthly Salary Structure (Auto-generated each month)</h4>
            
            <div class="form-row">
              <div class="form-group">
                <label>Basic Salary *</label>
                <input type="number" id="staffBasicSalary" min="0" step="0.01" placeholder="Monthly basic salary" required>
              </div>
              <div class="form-group">
                <label>Allowances</label>
                <input type="number" id="staffAllowances" min="0" step="0.01" placeholder="Monthly allowances" value="0">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Deductions</label>
                <input type="number" id="staffDeductions" min="0" step="0.01" placeholder="Monthly deductions" value="0">
              </div>
              <div class="form-group">
                <label>Expected Net Salary</label>
                <input type="text" id="staffNetSalaryPreview" disabled style="background-color: #f9f9f9;" value="0">
              </div>
            </div>

            <div style="background-color: white; padding: 10px; border-radius: 3px; font-size: 12px; color: #666;">
              <strong>ℹ️ Note:</strong> These salary components will be automatically generated each month. You won't need to enter them manually.
            </div>
          </div>

          <div class="form-group">
            <label>Remarks</label>
            <textarea id="staffRemarks" placeholder="Any additional notes..."></textarea>
          </div>

          <div id="staffFormErrors" class="error-box" style="display: none;"></div>

          <div class="form-row">
            <button type="submit" class="btn btn-primary">💾 Save Staff Member</button>
            <button type="button" class="btn btn-secondary" onclick="closeStaffForm()">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;

  contentArea.innerHTML = html;

  // Set default values
  setTimeout(() => {
    const statusSelect = document.getElementById('staffStatus');
    if (statusSelect) {
      statusSelect.value = 'active';
    }
    const deptSelect = document.getElementById('staffDepartment');
    if (deptSelect) {
      deptSelect.value = CONFIG.staff.departments[0];
    }
    const gradeSelect = document.getElementById('staffSalaryGrade');
    if (gradeSelect) {
      gradeSelect.value = Object.keys(CONFIG.staff.grades)[0];
    }

    // Add event listeners for salary calculation
    const basicInput = document.getElementById('staffBasicSalary');
    const allowancesInput = document.getElementById('staffAllowances');
    const deductionsInput = document.getElementById('staffDeductions');
    
    [basicInput, allowancesInput, deductionsInput].forEach(input => {
      if (input) {
        input.addEventListener('input', updateSalaryPreview);
      }
    });
  }, 0);
}

// ==================== RENDER STAFF TABLE ====================
function renderStaffTable(staff) {
  if (staff.length === 0) {
    return '<p class="no-data">No staff members found. Add a new staff member to get started.</p>';
  }

  return `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Department</th>
            <th>Salary Grade</th>
            <th>Status</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${staff.map(member => `
            <tr>
              <td><strong>${member.name}</strong></td>
              <td>${member.position}</td>
              <td>${member.department}</td>
              <td><small>${member.salaryGrade}</small></td>
              <td>${Utils.getStatusBadge(member.status)}</td>
              <td><small>${member.phone || '-'}</small></td>
              <td><small>${member.email || '-'}</small></td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-primary btn-small" onclick="editStaff('${member.id}')">Edit</button>
                  <button class="btn btn-danger btn-small" onclick="deleteStaffConfirm('${member.id}', '${member.name}')">Delete</button>
                  <button class="btn btn-info btn-small" onclick="viewStaffDetail('${member.id}')">View</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ==================== FILTER STAFF ====================
function filterStaff() {
  const searchInput = document.getElementById('staffSearch');
  const positionFilter = document.getElementById('staffPositionFilter');
  const statusFilter = document.getElementById('staffStatusFilter');

  const searchTerm = searchInput ? searchInput.value : '';
  const positionValue = positionFilter ? positionFilter.value : '';
  const statusValue = statusFilter ? statusFilter.value : '';

  let filtered = Storage.getCollection('staff');

  // Filter by search term
  if (searchTerm) {
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.phone && s.phone.includes(searchTerm))
    );
  }

  // Filter by position
  if (positionValue) {
    filtered = filtered.filter(s => s.position === positionValue);
  }

  // Filter by status
  if (statusValue) {
    filtered = filtered.filter(s => s.status === statusValue);
  }

  // Update table
  const tableDiv = document.getElementById('staffTable');
  if (tableDiv) {
    tableDiv.innerHTML = renderStaffTable(filtered);
  }
}

// ==================== SHOW ADD FORM ====================
function showAddStaffForm() {
  // Clear form
  document.getElementById('staffId').value = '';
  document.getElementById('staffName').value = '';
  document.getElementById('staffPosition').value = '';
  document.getElementById('staffDepartment').value = CONFIG.staff.departments[0];
  document.getElementById('staffSalaryGrade').value = Object.keys(CONFIG.staff.grades)[0];
  document.getElementById('staffStatus').value = 'active';
  document.getElementById('staffDOB').value = '';
  document.getElementById('staffHireDate').value = Utils.getTodayDate();
  document.getElementById('staffGender').value = '';
  document.getElementById('staffEmail').value = '';
  document.getElementById('staffPhone').value = '';
  document.getElementById('staffAddress').value = '';
  document.getElementById('staffBankAccount').value = '';
  document.getElementById('staffBankName').value = '';
  document.getElementById('staffIFSCCode').value = '';
  document.getElementById('staffAccountHolderName').value = '';
  document.getElementById('staffRemarks').value = '';
  document.getElementById('staffFormTitle').textContent = 'Add New Staff Member';
  document.getElementById('staffFormErrors').style.display = 'none';

  document.getElementById('staffFormModal').classList.add('show');
}

// ==================== EDIT STAFF ====================
function editStaff(staffId) {
  const member = Storage.getItemById('staff', staffId);
  if (!member) {
    showErrorModal('Staff member not found');
    return;
  }

  document.getElementById('staffId').value = member.id;
  document.getElementById('staffName').value = member.name;
  document.getElementById('staffPosition').value = member.position;
  document.getElementById('staffDepartment').value = member.department;
  document.getElementById('staffSalaryGrade').value = member.salaryGrade;
  document.getElementById('staffStatus').value = member.status;
  document.getElementById('staffDOB').value = member.dateOfBirth || '';
  document.getElementById('staffHireDate').value = member.hireDate || '';
  document.getElementById('staffGender').value = member.gender || '';
  document.getElementById('staffEmail').value = member.email || '';
  document.getElementById('staffPhone').value = member.phone || '';
  document.getElementById('staffAddress').value = member.address || '';
  document.getElementById('staffBankAccount').value = member.bankAccount || '';
  document.getElementById('staffBankName').value = member.bankName || '';
  document.getElementById('staffIFSCCode').value = member.ifscCode || '';
  document.getElementById('staffAccountHolderName').value = member.accountHolderName || '';
  document.getElementById('staffBasicSalary').value = member.basicSalary || '';
  document.getElementById('staffAllowances').value = member.allowances || 0;
  document.getElementById('staffDeductions').value = member.deductions || 0;
  document.getElementById('staffRemarks').value = member.remarks || '';
  document.getElementById('staffFormTitle').textContent = 'Edit Staff Member';
  document.getElementById('staffFormErrors').style.display = 'none';

  // Calculate net salary preview
  updateSalaryPreview();

  document.getElementById('staffFormModal').classList.add('show');
}

// ==================== UPDATE SALARY PREVIEW ====================
function updateSalaryPreview() {
  const basic = parseFloat(document.getElementById('staffBasicSalary')?.value || 0);
  const allowances = parseFloat(document.getElementById('staffAllowances')?.value || 0);
  const deductions = parseFloat(document.getElementById('staffDeductions')?.value || 0);
  const netSalary = basic + allowances - deductions;

  document.getElementById('staffNetSalaryPreview').value = Utils.formatCurrency(netSalary);
}

// ==================== SAVE STAFF ====================
function saveStaff(event) {
  event.preventDefault();

  const staffId = document.getElementById('staffId').value;
  const staffData = {
    id: staffId || generateId('STF'),
    name: document.getElementById('staffName').value,
    position: document.getElementById('staffPosition').value,
    department: document.getElementById('staffDepartment').value,
    salaryGrade: document.getElementById('staffSalaryGrade').value,
    status: document.getElementById('staffStatus').value,
    dateOfBirth: document.getElementById('staffDOB').value,
    hireDate: document.getElementById('staffHireDate').value,
    gender: document.getElementById('staffGender').value,
    email: document.getElementById('staffEmail').value,
    phone: document.getElementById('staffPhone').value,
    address: document.getElementById('staffAddress').value,
    bankAccount: document.getElementById('staffBankAccount').value,
    bankName: document.getElementById('staffBankName').value,
    ifscCode: document.getElementById('staffIFSCCode').value,
    accountHolderName: document.getElementById('staffAccountHolderName').value,
    basicSalary: parseFloat(document.getElementById('staffBasicSalary').value || 0),
    allowances: parseFloat(document.getElementById('staffAllowances').value || 0),
    deductions: parseFloat(document.getElementById('staffDeductions').value || 0),
    remarks: document.getElementById('staffRemarks').value
  };

  // Validate
  const validation = Validation.validateStaff(staffData);
  if (!validation.isValid) {
    Validation.showValidationErrors(validation.errors, 'staffFormErrors');
    return;
  }

  // Save or update
  const staff = Models.createStaff(staffData);
  let success = false;

  if (staffId) {
    success = Storage.updateItem('staff', staffId, staff.toJSON());
  } else {
    success = Storage.addItem('staff', staff.toJSON());
  }

  if (success) {
    showSuccessModal(staffId ? 'Staff member updated successfully!' : 'Staff member added successfully!');
    closeStaffForm();
    renderStaffPage();
  } else {
    showErrorModal('Failed to save staff member. Please try again.');
  }
}

// ==================== DELETE STAFF ====================
function deleteStaffConfirm(staffId, staffName) {
  showConfirmModal(`Are you sure you want to delete ${staffName}? This will also remove their salary records.`, () => {
    deleteStaff(staffId);
  });
}

function deleteStaff(staffId) {
  const success = Storage.deleteItem('staff', staffId);

  if (success) {
    // Also delete associated salary records
    const salaries = Storage.getCollection('salaryPayments').filter(s => s.staffId === staffId);
    salaries.forEach(salary => {
      Storage.deleteItem('salaryPayments', salary.id);
    });

    showSuccessModal('Staff member deleted successfully!');
    renderStaffPage();
  } else {
    showErrorModal('Failed to delete staff member.');
  }
}

// ==================== VIEW STAFF DETAIL ====================
function viewStaffDetail(staffId) {
  const member = Storage.getItemById('staff', staffId);
  if (!member) {
    showErrorModal('Staff member not found');
    return;
  }

  // Get salary records
  const salaryRecords = Storage.getStaffSalaryRecords(staffId);
  const totalSalariesPaid = salaryRecords
    .filter(s => s.status === 'paid')
    .reduce((sum, s) => sum + s.netSalary, 0);

  const gradeInfo = CONFIG.staff.grades[member.salaryGrade] || {};
  const basicSalary = gradeInfo.basic || 0;

  const detail = `
    <h3>${member.name}</h3>
    <p><strong>Position:</strong> ${member.position}</p>
    <p><strong>Department:</strong> ${member.department}</p>
    <p><strong>Status:</strong> ${Utils.getStatusBadge(member.status)}</p>
    <p><strong>Salary Grade:</strong> ${member.salaryGrade}</p>
    <p><strong>Date of Birth:</strong> ${member.dateOfBirth ? Utils.formatDate(member.dateOfBirth) : 'N/A'}</p>
    <p><strong>Gender:</strong> ${member.gender || 'N/A'}</p>
    <p><strong>Hire Date:</strong> ${member.hireDate ? Utils.formatDate(member.hireDate) : 'N/A'}</p>
    <p><strong>Email:</strong> ${member.email || 'N/A'}</p>
    <p><strong>Phone:</strong> ${member.phone || 'N/A'}</p>
    <p><strong>Address:</strong> ${member.address || 'N/A'}</p>
    <hr>
    <h4>Banking Information</h4>
    <p><strong>Account Number:</strong> ${member.bankAccount ? member.bankAccount.slice(-4).padStart(member.bankAccount.length, '*') : 'N/A'}</p>
    <p><strong>Bank Name:</strong> ${member.bankName || 'N/A'}</p>
    <p><strong>IFSC Code:</strong> ${member.ifscCode || 'N/A'}</p>
    <p><strong>Account Holder:</strong> ${member.accountHolderName || 'N/A'}</p>
    <hr>
    <h4>Salary Summary</h4>
    <p><strong>Salary Grade:</strong> ${member.salaryGrade}</p>
    <p><strong>Basic Salary:</strong> ${Utils.formatCurrency(basicSalary)}</p>
    <p><strong>Total Salaries Paid:</strong> ${Utils.formatCurrency(totalSalariesPaid)}</p>
    <p><strong>Total Salary Records:</strong> ${salaryRecords.length}</p>
    <p><strong>Remarks:</strong> ${member.remarks || 'None'}</p>
    <p style="margin-top: 15px;">
      <button class="btn btn-primary btn-small" onclick="editStaff('${member.id}')">Edit</button>
      <button class="btn btn-secondary btn-small" onclick="closeModal('detailModal')">Close</button>
    </p>
  `;

  document.getElementById('detailModal') = document.getElementById('detailModal') || document.createElement('div');
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

// ==================== CLOSE FORM ====================
function closeStaffForm() {
  document.getElementById('staffFormModal').classList.remove('show');
}
