/**
 * Main Application File - Navigation, initialization, and global functions
 */

let currentPage = 'dashboard';
let confirmCallback = null;

// ==================== APP INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // Initialize storage
  Storage.init();

  // Setup school information
  document.getElementById('schoolName').textContent = CONFIG.school.name;
  updateAcademicYearDisplay();

  // Populate academic year dropdown
  populateAcademicYears();

  // Update storage info
  updateStorageInfo();

  // Navigate to dashboard initially
  navigateTo('dashboard');
}

// ==================== ACADEMIC YEAR MANAGEMENT ====================
function populateAcademicYears() {
  const select = document.getElementById('academicYearSelect');
  select.innerHTML = '';

  CONFIG.academicYear.available.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = `Academic Year ${year}-${year + 1}`;
    if (year === CONFIG.academicYear.current) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  select.value = CONFIG.academicYear.current;
}

function changeAcademicYear(year) {
  if (year) {
    CONFIG.academicYear.current = parseInt(year);
    updateAcademicYearDisplay();

    // Reload current page to show data for new academic year
    navigateTo(currentPage);
  }
}

function updateAcademicYearDisplay() {
  const yearDisplay = document.getElementById('schoolYear');
  if (yearDisplay) {
    yearDisplay.textContent = `Academic Year: ${CONFIG.academicYear.current}-${CONFIG.academicYear.current + 1}`;
  }
}

// ==================== NAVIGATION ====================
function navigateTo(page) {
  currentPage = page;
  const contentArea = document.getElementById('appContent');

  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });

  // Remove all page sections
  contentArea.innerHTML = '';

  // Route to appropriate page
  switch (page) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'students':
      contentArea.innerHTML = '<div class="loading">Loading Students...</div>';
      loadStudentsPage();
      break;
    case 'staff':
      contentArea.innerHTML = '<div class="loading">Loading Staff...</div>';
      loadStaffPage();
      break;
    case 'fees':
      contentArea.innerHTML = '<div class="loading">Loading Fees...</div>';
      loadFeesPage();
      break;
    case 'salary':
      contentArea.innerHTML = '<div class="loading">Loading Salary...</div>';
      loadSalaryPage();
      break;
    case 'reports':
      contentArea.innerHTML = '<div class="loading">Loading Reports...</div>';
      loadReportsPage();
      break;
    case 'settings':
      loadSettingsPage();
      break;
    default:
      loadDashboard();
  }

  // Mark nav link as active
  const activeLink = document.querySelector(`[onclick="navigateTo('${page}')"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }

  // Scroll to top
  window.scrollTo(0, 0);
}

// ==================== DASHBOARD ====================
function loadDashboard() {
  const contentArea = document.getElementById('appContent');

  const students = Storage.getCollection('students').filter(s => s.status === 'active');
  const staff = Storage.getCollection('staff').filter(s => s.status === 'active');
  const totalFeesCollected = Storage.getTotalFeesCollected(CONFIG.academicYear.current);
  const totalSalariesPaid = Storage.getTotalSalariesPaid(CONFIG.academicYear.current);

  // Calculate pending fees
  const fees = Storage.getCollection('fees').filter(f => f.academicYear === CONFIG.academicYear.current);
  const payments = Storage.getCollection('feePayments');
  const totalFeesDue = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = payments
    .filter(p => fees.some(f => f.id === p.feeId))
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingFees = totalFeesDue - totalPaid;

  const html = `
    <div class="card">
      <div class="card-header">
        <h2>📊 Dashboard</h2>
      </div>
      <div class="card-body">
        <p>Welcome to ${CONFIG.school.name} Management System</p>
        <p class="text-muted">Academic Year: ${CONFIG.academicYear.current}-${CONFIG.academicYear.current + 1}</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>👥 Active Students</h3>
        <div class="value">${students.length}</div>
      </div>
      <div class="stat-card">
        <h3>👨‍💼 Active Staff</h3>
        <div class="value">${staff.length}</div>
      </div>
      <div class="stat-card">
        <h3>💰 Fees Collected</h3>
        <div class="value">${Utils.formatCurrency(totalFeesCollected)}</div>
      </div>
      <div class="stat-card">
        <h3>💵 Salaries Paid</h3>
        <div class="value">${Utils.formatCurrency(totalSalariesPaid)}</div>
      </div>
      <div class="stat-card">
        <h3>📍 Pending Fees</h3>
        <div class="value" style="color: #e74c3c;">${Utils.formatCurrency(pendingFees)}</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <h3>Recent Students</h3>
        </div>
        <div class="card-body">
          ${students.length > 0 ? `
            <ul style="list-style: none; padding: 0;">
              ${students.slice(0, 5).map(s => `
                <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
                  <strong>${s.name}</strong><br>
                  <small class="text-muted">${s.class}</small>
                </li>
              `).join('')}
            </ul>
            <button class="btn btn-primary btn-small" onclick="navigateTo('students')">View All Students</button>
          ` : '<p class="no-data">No students found</p>'}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Recent Staff</h3>
        </div>
        <div class="card-body">
          ${staff.length > 0 ? `
            <ul style="list-style: none; padding: 0;">
              ${staff.slice(0, 5).map(s => `
                <li style="padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
                  <strong>${s.name}</strong><br>
                  <small class="text-muted">${s.position}</small>
                </li>
              `).join('')}
            </ul>
            <button class="btn btn-primary btn-small" onclick="navigateTo('staff')">View All Staff</button>
          ` : '<p class="no-data">No staff found</p>'}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>⚡ Quick Actions</h3>
      </div>
      <div class="card-body">
        <div class="btn-group">
          <button class="btn btn-primary" onclick="navigateTo('students')">Add New Student</button>
          <button class="btn btn-primary" onclick="navigateTo('staff')">Add New Staff</button>
          <button class="btn btn-success" onclick="navigateTo('fees')">Record Fee Payment</button>
          <button class="btn btn-success" onclick="navigateTo('salary')">Record Salary Payment</button>
          <button class="btn btn-warning" onclick="navigateTo('reports')">View Reports</button>
        </div>
      </div>
    </div>
  `;

  contentArea.innerHTML = html;
}

// ==================== PAGE LOADERS (STUBS - Will be implemented in separate files) ====================
function loadStudentsPage() {
  // This will be implemented in students.js
  if (typeof renderStudentsPage === 'function') {
    renderStudentsPage();
  } else {
    console.warn('Students page not yet loaded');
  }
}

function loadStaffPage() {
  // This will be implemented in staff.js
  if (typeof renderStaffPage === 'function') {
    renderStaffPage();
  } else {
    console.warn('Staff page not yet loaded');
  }
}

function loadFeesPage() {
  // This will be implemented in fees.js
  if (typeof renderFeesPage === 'function') {
    renderFeesPage();
  } else {
    console.warn('Fees page not yet loaded');
  }
}

function loadSalaryPage() {
  // This will be implemented in salary.js
  if (typeof renderSalaryPage === 'function') {
    renderSalaryPage();
  } else {
    console.warn('Salary page not yet loaded');
  }
}

function loadReportsPage() {
  // This will be implemented in reports.js
  if (typeof renderReportsPage === 'function') {
    renderReportsPage();
  } else {
    console.warn('Reports page not yet loaded');
  }
}

function loadFeesPageAlias() {
  loadFeesPage();
}

function loadSalaryPageAlias() {
  loadSalaryPage();
}

function loadSettingsPage() {
  const contentArea = document.getElementById('appContent');

  const html = `
    <div class="card">
      <div class="card-header">
        <h2>⚙️ Settings</h2>
      </div>
      <div class="card-body">
        <h3>School Information</h3>
        <div class="form-group">
          <label>School Name</label>
          <input type="text" id="settingSchoolName" value="${CONFIG.school.name}" disabled>
        </div>
        <div class="form-group">
          <label>Address</label>
          <input type="text" id="settingSchoolAddress" value="${CONFIG.school.address}" disabled>
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input type="tel" id="settingSchoolPhone" value="${CONFIG.school.phone}" disabled>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="settingSchoolEmail" value="${CONFIG.school.email}" disabled>
        </div>
        <p class="info-message">📝 Note: To edit school information, update the values in js/config.js and reload the page.</p>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>💾 Data Management</h2>
      </div>
      <div class="card-body">
        <h3>Backup & Restore</h3>
        <div class="btn-group">
          <button class="btn btn-success" onclick="exportBackup()">📥 Export Backup</button>
          <button class="btn btn-info" onclick="importBackup()">📤 Import Backup</button>
        </div>
        
        <h3 style="margin-top: 20px;">Export Data</h3>
        <div class="btn-group">
          <button class="btn btn-info" onclick="exportToCSV('students', 'students.csv')">Export Students to CSV</button>
          <button class="btn btn-info" onclick="exportToCSV('staff', 'staff.csv')">Export Staff to CSV</button>
          <button class="btn btn-info" onclick="exportToCSV('fees', 'fees.csv')">Export Fees to CSV</button>
        </div>

        <h3 style="margin-top: 20px;">Storage Usage</h3>
        <div id="storageInfoDetail" style="margin-top: 10px;"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>⚠️ Danger Zone</h2>
      </div>
      <div class="card-body">
        <p class="warning-message">⚠️ Warning: The following actions cannot be undone!</p>
        <button class="btn btn-danger" onclick="clearAllDataConfirm()">🗑️ Clear All Data</button>
      </div>
    </div>

    <input type="file" id="backupFileInput" accept=".json" style="display: none;" onchange="handleBackupImport(event)">
  `;

  contentArea.innerHTML = html;

  // Update storage info
  const info = Storage.getStorageInfo();
  const detailDiv = document.getElementById('storageInfoDetail');
  if (detailDiv) {
    detailDiv.innerHTML = `
      <div class="info-message">
        <strong>Space Used:</strong> ${info.mb.toFixed(2)} MB / 5 MB (${info.percentage}%)<br>
        <strong>Bytes:</strong> ${info.bytes.toLocaleString()}
      </div>
    `;
  }
}

// ==================== MODAL FUNCTIONS ====================
function showErrorModal(message) {
  document.getElementById('errorMessage').textContent = message;
  document.getElementById('errorModal').classList.add('show');
}

function showSuccessModal(message) {
  document.getElementById('successMessage').textContent = message;
  document.getElementById('successModal').classList.add('show');
}

function showConfirmModal(message, yesCallback) {
  confirmCallback = yesCallback;
  document.getElementById('confirmMessage').textContent = message;
  document.getElementById('confirmModal').classList.add('show');
}

function confirmYes() {
  if (typeof confirmCallback === 'function') {
    confirmCallback();
  }
  closeModal('confirmModal');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('show');
  confirmCallback = null;
}

// Close modal when clicking outside
window.onclick = function (event) {
  if (event.target.classList.contains('modal')) {
    event.target.classList.remove('show');
  }
};

// ==================== STORAGE & BACKUP FUNCTIONS ====================
function updateStorageInfo() {
  const info = Storage.getStorageInfo();
  const storageDiv = document.querySelector('.storage-info');
  if (storageDiv) {
    storageDiv.textContent = `Storage: ${info.percentage}%`;
  }
}

function exportBackup() {
  Storage.exportBackup();
  showSuccessModal('Backup exported successfully!');
}

function importBackup() {
  document.getElementById('backupFileInput').click();
}

function handleBackupImport(event) {
  const file = event.target.files[0];
  if (file) {
    Storage.importBackup(file)
      .then(() => {
        showSuccessModal('Backup imported successfully! Reloading page...');
        setTimeout(() => location.reload(), 2000);
      })
      .catch(error => {
        showErrorModal(`Import failed: ${error.message}`);
      });
  }
}

function exportToCSV(collection, filename) {
  Storage.exportToCSV(collection, filename);
  showSuccessModal(`${collection.charAt(0).toUpperCase() + collection.slice(1)} exported to CSV!`);
}

function clearAllDataConfirm() {
  showConfirmModal('Are you absolutely sure? All data will be deleted permanently!', () => {
    Storage.clearAllData();
    showSuccessModal('All data cleared. Reloading...');
    setTimeout(() => location.reload(), 2000);
  });
}

// ==================== UTILITY FUNCTIONS ====================
function navigateToWithoutReload(page) {
  navigateTo(page);
}

// Log app initialization
console.log('School Management System initialized');
console.log('Configuration:', CONFIG);
