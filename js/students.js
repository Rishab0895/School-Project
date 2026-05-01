/**
 * Student Management - Add, Edit, Delete, View Students
 */

let currentStudents = [];
let currentStudentFilter = 'active';
let currentStudentSearch = '';

// ==================== RENDER STUDENTS PAGE ====================
function renderStudentsPage() {
  const contentArea = document.getElementById('appContent');

  const students = Storage.getCollection('students');
  currentStudents = students;

  const html = `
    <div class="card">
      <div class="card-header flex-between">
        <h2>👥 Student Management</h2>
        <button class="btn btn-success" onclick="showAddStudentForm()">+ Add New Student</button>
      </div>
      <div class="card-body">
        <div class="search-box">
          <div class="search-input">
            <input type="text" id="studentSearch" placeholder="Search by name, email, or phone..." onkeyup="filterStudents()">
          </div>
          <div class="filter-group">
            <select id="studentClassFilter" onchange="filterStudents()">
              <option value="">All Classes</option>
              ${CONFIG.classes.map(cls => `<option value="${cls}">${cls}</option>`).join('')}
            </select>
            <select id="studentStatusFilter" onchange="filterStudents()">
              <option value="active">Active Students</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
              <option value="transferred">Transferred</option>
              <option value="">All Statuses</option>
            </select>
          </div>
        </div>

        <div id="studentTable">
          ${renderStudentsTable(students)}
        </div>
      </div>
    </div>

    <!-- Add/Edit Student Modal -->
    <div id="studentFormModal" class="modal">
      <div class="modal-content">
        <span class="close" onclick="closeStudentForm()">&times;</span>
        <h2 id="studentFormTitle">Add New Student</h2>
        <form onsubmit="saveStudent(event)">
          <input type="hidden" id="studentId">

          <div class="form-row">
            <div class="form-group">
              <label>Student Name *</label>
              <input type="text" id="studentName" required>
            </div>
            <div class="form-group">
              <label>Roll Number</label>
              <input type="text" id="studentRollNumber">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Class *</label>
              <select id="studentClass" required>
                <option value="">Select Class</option>
                ${CONFIG.classes.map(cls => `<option value="${cls}">${cls}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select id="studentStatus">
                ${CONFIG.status.student.map(s => `<option value="${s}">${Utils.toTitleCase(s.replace(/_/g, ' '))}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Date of Birth</label>
              <input type="date" id="studentDOB">
            </div>
            <div class="form-group">
              <label>Academic Year</label>
              <select id="studentAcademicYear">
                ${CONFIG.academicYear.available.map(y => `<option value="${y}">${y}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="studentEmail">
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="tel" id="studentPhone">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Parent/Guardian Name</label>
              <input type="text" id="studentParentName">
            </div>
            <div class="form-group">
              <label>Parent Phone</label>
              <input type="tel" id="studentParentPhone">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Parent Email</label>
              <input type="email" id="studentParentEmail">
            </div>
            <div class="form-group">
              <label>Address</label>
              <input type="text" id="studentAddress">
            </div>
          </div>

          <div class="form-group">
            <label>Remarks</label>
            <textarea id="studentRemarks" placeholder="Any additional notes..."></textarea>
          </div>

          <div id="studentFormErrors" class="error-box" style="display: none;"></div>

          <div class="form-row">
            <button type="submit" class="btn btn-primary">💾 Save Student</button>
            <button type="button" class="btn btn-secondary" onclick="closeStudentForm()">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;

  contentArea.innerHTML = html;

  // Set default status
  setTimeout(() => {
    const statusSelect = document.getElementById('studentStatus');
    if (statusSelect) {
      statusSelect.value = 'active';
    }
    const yearSelect = document.getElementById('studentAcademicYear');
    if (yearSelect) {
      yearSelect.value = CONFIG.academicYear.current;
    }
  }, 0);
}

// ==================== RENDER STUDENTS TABLE ====================
function renderStudentsTable(students) {
  if (students.length === 0) {
    return '<p class="no-data">No students found. Add a new student to get started.</p>';
  }

  return `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll Number</th>
            <th>Class</th>
            <th>Status</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Parent</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(student => `
            <tr>
              <td><strong>${student.name}</strong></td>
              <td>${student.rollNumber || '-'}</td>
              <td>${student.class}</td>
              <td>${Utils.getStatusBadge(student.status)}</td>
              <td><small>${student.phone || '-'}</small></td>
              <td><small>${student.email || '-'}</small></td>
              <td><small>${student.parentName || '-'}</small></td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-primary btn-small" onclick="editStudent('${student.id}')">Edit</button>
                  <button class="btn btn-danger btn-small" onclick="deleteStudentConfirm('${student.id}', '${student.name}')">Delete</button>
                  <button class="btn btn-info btn-small" onclick="viewStudentDetail('${student.id}')">View</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ==================== FILTER STUDENTS ====================
function filterStudents() {
  const searchInput = document.getElementById('studentSearch');
  const classFilter = document.getElementById('studentClassFilter');
  const statusFilter = document.getElementById('studentStatusFilter');

  const searchTerm = searchInput ? searchInput.value : '';
  const classValue = classFilter ? classFilter.value : '';
  const statusValue = statusFilter ? statusFilter.value : '';

  let filtered = Storage.getCollection('students');

  // Filter by search term
  if (searchTerm) {
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.phone && s.phone.includes(searchTerm))
    );
  }

  // Filter by class
  if (classValue) {
    filtered = filtered.filter(s => s.class === classValue);
  }

  // Filter by status
  if (statusValue) {
    filtered = filtered.filter(s => s.status === statusValue);
  }

  // Update table
  const tableDiv = document.getElementById('studentTable');
  if (tableDiv) {
    tableDiv.innerHTML = renderStudentsTable(filtered);
  }
}

// ==================== SHOW ADD FORM ====================
function showAddStudentForm() {
  // Clear form
  document.getElementById('studentId').value = '';
  document.getElementById('studentName').value = '';
  document.getElementById('studentRollNumber').value = '';
  document.getElementById('studentClass').value = '';
  document.getElementById('studentStatus').value = 'active';
  document.getElementById('studentDOB').value = '';
  document.getElementById('studentEmail').value = '';
  document.getElementById('studentPhone').value = '';
  document.getElementById('studentParentName').value = '';
  document.getElementById('studentParentPhone').value = '';
  document.getElementById('studentParentEmail').value = '';
  document.getElementById('studentAddress').value = '';
  document.getElementById('studentRemarks').value = '';
  document.getElementById('studentFormTitle').textContent = 'Add New Student';
  document.getElementById('studentFormErrors').style.display = 'none';

  document.getElementById('studentFormModal').classList.add('show');
}

// ==================== EDIT STUDENT ====================
function editStudent(studentId) {
  const student = Storage.getItemById('students', studentId);
  if (!student) {
    showErrorModal('Student not found');
    return;
  }

  document.getElementById('studentId').value = student.id;
  document.getElementById('studentName').value = student.name;
  document.getElementById('studentRollNumber').value = student.rollNumber || '';
  document.getElementById('studentClass').value = student.class;
  document.getElementById('studentStatus').value = student.status;
  document.getElementById('studentDOB').value = student.dateOfBirth || '';
  document.getElementById('studentAcademicYear').value = student.academicYear;
  document.getElementById('studentEmail').value = student.email || '';
  document.getElementById('studentPhone').value = student.phone || '';
  document.getElementById('studentParentName').value = student.parentName || '';
  document.getElementById('studentParentPhone').value = student.parentPhone || '';
  document.getElementById('studentParentEmail').value = student.parentEmail || '';
  document.getElementById('studentAddress').value = student.address || '';
  document.getElementById('studentRemarks').value = student.remarks || '';
  document.getElementById('studentFormTitle').textContent = 'Edit Student';
  document.getElementById('studentFormErrors').style.display = 'none';

  document.getElementById('studentFormModal').classList.add('show');
}

// ==================== SAVE STUDENT ====================
function saveStudent(event) {
  event.preventDefault();

  const studentId = document.getElementById('studentId').value;
  const studentData = {
    id: studentId || generateId('STU'),
    name: document.getElementById('studentName').value,
    rollNumber: document.getElementById('studentRollNumber').value,
    class: document.getElementById('studentClass').value,
    status: document.getElementById('studentStatus').value,
    dateOfBirth: document.getElementById('studentDOB').value,
    academicYear: parseInt(document.getElementById('studentAcademicYear').value),
    email: document.getElementById('studentEmail').value,
    phone: document.getElementById('studentPhone').value,
    parentName: document.getElementById('studentParentName').value,
    parentPhone: document.getElementById('studentParentPhone').value,
    parentEmail: document.getElementById('studentParentEmail').value,
    address: document.getElementById('studentAddress').value,
    remarks: document.getElementById('studentRemarks').value,
    enrollmentDate: studentId ? Storage.getItemById('students', studentId).enrollmentDate : new Date().toISOString().split('T')[0]
  };

  // Validate
  const validation = Validation.validateStudent(studentData);
  if (!validation.isValid) {
    Validation.showValidationErrors(validation.errors, 'studentFormErrors');
    return;
  }

  // Save or update
  const student = Models.createStudent(studentData);
  let success = false;

  if (studentId) {
    success = Storage.updateItem('students', studentId, student.toJSON());
  } else {
    success = Storage.addItem('students', student.toJSON());
  }

  if (success) {
    showSuccessModal(studentId ? 'Student updated successfully!' : 'Student added successfully!');
    closeStudentForm();
    renderStudentsPage();
  } else {
    showErrorModal('Failed to save student. Please try again.');
  }
}

// ==================== DELETE STUDENT ====================
function deleteStudentConfirm(studentId, studentName) {
  showConfirmModal(`Are you sure you want to delete ${studentName}? This will also remove their fee records.`, () => {
    deleteStudent(studentId);
  });
}

function deleteStudent(studentId) {
  const success = Storage.deleteItem('students', studentId);

  if (success) {
    // Also delete associated fees
    const fees = Storage.getCollection('fees').filter(f => f.studentId === studentId);
    fees.forEach(fee => {
      Storage.deleteItem('fees', fee.id);
      // Delete associated payments
      const payments = Storage.getCollection('feePayments').filter(p => p.feeId === fee.id);
      payments.forEach(payment => {
        Storage.deleteItem('feePayments', payment.id);
      });
    });

    showSuccessModal('Student deleted successfully!');
    renderStudentsPage();
  } else {
    showErrorModal('Failed to delete student.');
  }
}

// ==================== VIEW STUDENT DETAIL ====================
function viewStudentDetail(studentId) {
  const student = Storage.getItemById('students', studentId);
  if (!student) {
    showErrorModal('Student not found');
    return;
  }

  // Get student's fees
  const fees = Storage.getStudentFeesByYear(studentId, student.academicYear);
  const payments = Storage.getCollection('feePayments');
  let totalFeesDue = 0;
  let totalPaid = 0;

  fees.forEach(fee => {
    totalFeesDue += fee.amount;
    const feePayments = payments.filter(p => p.feeId === fee.id);
    feePayments.forEach(p => {
      totalPaid += p.amount;
    });
  });

  const outstanding = totalFeesDue - totalPaid;

  const detail = `
    <h3>${student.name}</h3>
    <p><strong>Roll Number:</strong> ${student.rollNumber || 'N/A'}</p>
    <p><strong>Class:</strong> ${student.class}</p>
    <p><strong>Status:</strong> ${Utils.getStatusBadge(student.status)}</p>
    <p><strong>Date of Birth:</strong> ${student.dateOfBirth ? Utils.formatDate(student.dateOfBirth) : 'N/A'}</p>
    <p><strong>Age:</strong> ${student.dateOfBirth ? Utils.calculateAge(student.dateOfBirth) + ' years' : 'N/A'}</p>
    <p><strong>Email:</strong> ${student.email || 'N/A'}</p>
    <p><strong>Phone:</strong> ${student.phone || 'N/A'}</p>
    <p><strong>Academic Year:</strong> ${student.academicYear}-${student.academicYear + 1}</p>
    <hr>
    <p><strong>Parent/Guardian:</strong> ${student.parentName || 'N/A'}</p>
    <p><strong>Parent Phone:</strong> ${student.parentPhone || 'N/A'}</p>
    <p><strong>Parent Email:</strong> ${student.parentEmail || 'N/A'}</p>
    <p><strong>Address:</strong> ${student.address || 'N/A'}</p>
    <hr>
    <h4>Fee Summary (${student.academicYear}-${student.academicYear + 1})</h4>
    <p><strong>Total Fees Due:</strong> ${Utils.formatCurrency(totalFeesDue)}</p>
    <p><strong>Total Paid:</strong> ${Utils.formatCurrency(totalPaid)}</p>
    <p><strong>Outstanding:</strong> <span style="color: ${outstanding > 0 ? '#e74c3c' : '#27ae60'}; font-weight: bold;">${Utils.formatCurrency(outstanding)}</span></p>
    <p><strong>Remarks:</strong> ${student.remarks || 'None'}</p>
    <p style="margin-top: 15px;">
      <button class="btn btn-primary btn-small" onclick="editStudent('${student.id}')">Edit</button>
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
function closeStudentForm() {
  document.getElementById('studentFormModal').classList.remove('show');
}
