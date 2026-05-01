/**
 * Data Models - Define structure for all entities
 */

// Generate unique ID based on timestamp
function generateId(prefix = '') {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ==================== STUDENT MODEL ====================
class Student {
  constructor(data) {
    this.id = data.id || generateId('STU');
    this.name = data.name;
    this.class = data.class;
    this.rollNumber = data.rollNumber || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.parentName = data.parentName || '';
    this.parentPhone = data.parentPhone || '';
    this.parentEmail = data.parentEmail || '';
    this.address = data.address || '';
    this.dateOfBirth = data.dateOfBirth || '';
    this.academicYear = data.academicYear || CONFIG.academicYear.current;
    this.enrollmentDate = data.enrollmentDate || new Date().toISOString().split('T')[0];
    this.status = data.status || 'active'; // active, inactive, graduated, transferred
    this.remarks = data.remarks || '';
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data) {
    return new Student(data);
  }
}

// ==================== STAFF MODEL ====================
class Staff {
  constructor(data) {
    this.id = data.id || generateId('STF');
    this.name = data.name;
    this.position = data.position;
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.address = data.address || '';
    this.dateOfBirth = data.dateOfBirth || '';
    this.gender = data.gender || '';
    this.department = data.department || CONFIG.staff.departments[0];
    this.salaryGrade = data.salaryGrade || 'Grade E (Others)';
    this.hireDate = data.hireDate || new Date().toISOString().split('T')[0];
    this.bankAccount = data.bankAccount || '';
    this.bankName = data.bankName || '';
    this.ifscCode = data.ifscCode || '';
    this.accountHolderName = data.accountHolderName || '';
    this.basicSalary = parseFloat(data.basicSalary || 0);
    this.allowances = parseFloat(data.allowances || 0);
    this.deductions = parseFloat(data.deductions || 0);
    this.status = data.status || 'active'; // active, inactive, on_leave, retired
    this.remarks = data.remarks || '';
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data) {
    return new Staff(data);
  }
}

// ==================== FEE MODEL ====================
class Fee {
  constructor(data) {
    this.id = data.id || generateId('FEE');
    this.studentId = data.studentId;
    this.academicYear = data.academicYear || CONFIG.academicYear.current;
    this.feeType = data.feeType; // e.g., 'tuition', 'hostel'
    this.amount = data.amount;
    this.dueDate = data.dueDate || this.calculateDueDate();
    this.status = data.status || 'pending'; // pending, partially_paid, paid
    this.createdDate = data.createdDate || new Date().toISOString().split('T')[0];
    this.remarks = data.remarks || '';
  }

  calculateDueDate() {
    const year = this.academicYear;
    const { month, day } = CONFIG.fees.dueDate;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data) {
    return new Fee(data);
  }
}

// ==================== FEE PAYMENT MODEL ====================
class FeePayment {
  constructor(data) {
    this.id = data.id || generateId('PAY');
    this.studentId = data.studentId;
    this.feeId = data.feeId;
    this.amount = data.amount;
    this.paymentDate = data.paymentDate || new Date().toISOString().split('T')[0];
    this.paymentMethod = data.paymentMethod || 'Cash';
    this.referenceNumber = data.referenceNumber || ''; // Check number, transaction ID, etc.
    this.receivedBy = data.receivedBy || ''; // Name of staff member who received payment
    this.remarks = data.remarks || '';
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data) {
    return new FeePayment(data);
  }
}

// ==================== SALARY PAYMENT MODEL ====================
class SalaryPayment {
  constructor(data) {
    this.id = data.id || generateId('SAL');
    this.staffId = data.staffId;
    this.month = data.month; // YYYY-MM format
    this.academicYear = data.academicYear || CONFIG.academicYear.current;
    this.basicSalary = data.basicSalary || 0;
    this.allowances = data.allowances || 0; // Sum of all allowances
    this.deductions = data.deductions || 0; // Sum of all deductions
    this.netSalary = data.netSalary || (this.basicSalary + this.allowances - this.deductions);
    this.paymentDate = data.paymentDate || null;
    this.status = data.status || 'pending'; // pending, paid
    this.referenceNumber = data.referenceNumber || '';
    this.remarks = data.remarks || '';
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data) {
    return new SalaryPayment(data);
  }
}

// ==================== UTILITY FUNCTIONS ====================
const Models = {
  Student,
  Staff,
  Fee,
  FeePayment,
  SalaryPayment,

  // Create instances safely
  createStudent: (data) => new Student(data),
  createStaff: (data) => new Staff(data),
  createFee: (data) => new Fee(data),
  createFeePayment: (data) => new FeePayment(data),
  createSalaryPayment: (data) => new SalaryPayment(data),

  // Restore from JSON
  restoreStudent: (data) => Student.fromJSON(data),
  restoreStaff: (data) => Staff.fromJSON(data),
  restoreFee: (data) => Fee.fromJSON(data),
  restoreFeePayment: (data) => FeePayment.fromJSON(data),
  restoreSalaryPayment: (data) => SalaryPayment.fromJSON(data)
};
