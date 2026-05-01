/**
 * Form Validation Helper Functions
 */

const Validation = {
  // Email validation
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  // Phone validation (10-15 digits)
  isValidPhone(phone) {
    const regex = /^[0-9]{10,15}$/;
    return regex.test(phone.replace(/\s|-/g, ''));
  },

  // Check if string is empty or whitespace only
  isEmpty(str) {
    return !str || str.trim().length === 0;
  },

  // Check if date is valid
  isValidDate(dateString) {
    try {
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date);
    } catch {
      return false;
    }
  },

  // Check if date is in past
  isPastDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  },

  // Check if date is today or past
  isPastOrToday(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today;
  },

  // Check if age is valid (18-80)
  isValidAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 5 && age <= 100; // For students, min 5 years; for staff, max 100
  },

  // Check if amount is positive number
  isValidAmount(amount) {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  },

  // Validate student data
  validateStudent(student) {
    const errors = [];

    if (Validation.isEmpty(student.name)) {
      errors.push('Student name is required');
    }

    if (Validation.isEmpty(student.class)) {
      errors.push('Class is required');
    }

    if (student.email && !Validation.isEmpty(student.email) && !Validation.isValidEmail(student.email)) {
      errors.push('Email format is invalid');
    }

    if (student.phone && !Validation.isEmpty(student.phone) && !Validation.isValidPhone(student.phone)) {
      errors.push('Phone number must be 10-15 digits');
    }

    if (student.parentPhone && !Validation.isEmpty(student.parentPhone) && !Validation.isValidPhone(student.parentPhone)) {
      errors.push('Parent phone number must be 10-15 digits');
    }

    if (student.dateOfBirth && !Validation.isEmpty(student.dateOfBirth)) {
      if (!Validation.isValidDate(student.dateOfBirth)) {
        errors.push('Date of birth is invalid');
      } else if (!Validation.isValidAge(student.dateOfBirth)) {
        errors.push('Student age must be between 5 and 100 years');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validate staff data
  validateStaff(staff) {
    const errors = [];

    if (Validation.isEmpty(staff.name)) {
      errors.push('Staff name is required');
    }

    if (Validation.isEmpty(staff.position)) {
      errors.push('Position is required');
    }

    if (staff.email && !Validation.isEmpty(staff.email) && !Validation.isValidEmail(staff.email)) {
      errors.push('Email format is invalid');
    }

    if (staff.phone && !Validation.isEmpty(staff.phone) && !Validation.isValidPhone(staff.phone)) {
      errors.push('Phone number must be 10-15 digits');
    }

    if (staff.dateOfBirth && !Validation.isEmpty(staff.dateOfBirth)) {
      if (!Validation.isValidDate(staff.dateOfBirth)) {
        errors.push('Date of birth is invalid');
      }
    }

    if (staff.hireDate && !Validation.isValidDate(staff.hireDate)) {
      errors.push('Hire date is invalid');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validate fee data
  validateFee(fee) {
    const errors = [];

    if (Validation.isEmpty(fee.studentId)) {
      errors.push('Student is required');
    }

    if (Validation.isEmpty(fee.feeType)) {
      errors.push('Fee type is required');
    }

    if (!Validation.isValidAmount(fee.amount)) {
      errors.push('Amount must be a positive number');
    }

    if (fee.dueDate && !Validation.isValidDate(fee.dueDate)) {
      errors.push('Due date is invalid');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validate fee payment
  validateFeePayment(payment) {
    const errors = [];

    if (Validation.isEmpty(payment.studentId)) {
      errors.push('Student is required');
    }

    if (Validation.isEmpty(payment.feeId)) {
      errors.push('Fee is required');
    }

    if (!Validation.isValidAmount(payment.amount)) {
      errors.push('Payment amount must be a positive number');
    }

    if (payment.paymentDate && !Validation.isValidDate(payment.paymentDate)) {
      errors.push('Payment date is invalid');
    }

    if (Validation.isEmpty(payment.paymentMethod)) {
      errors.push('Payment method is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validate salary payment
  validateSalaryPayment(payment) {
    const errors = [];

    if (Validation.isEmpty(payment.staffId)) {
      errors.push('Staff member is required');
    }

    if (Validation.isEmpty(payment.month)) {
      errors.push('Month is required (format: YYYY-MM)');
    }

    if (!Validation.isValidAmount(payment.basicSalary)) {
      errors.push('Basic salary must be a positive number');
    }

    if (payment.allowances < 0) {
      errors.push('Allowances cannot be negative');
    }

    if (payment.deductions < 0) {
      errors.push('Deductions cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Display validation errors
  showValidationErrors(errors, elementId = null) {
    if (errors.length === 0) return;

    const errorMessage = errors.join('\n');

    if (elementId) {
      const errorDiv = document.getElementById(elementId);
      if (errorDiv) {
        errorDiv.innerHTML = '<ul>' + errors.map(e => `<li>${e}</li>`).join('') + '</ul>';
        errorDiv.style.display = 'block';
      }
    } else {
      alert(errorMessage);
    }
  },

  // Clear validation errors
  clearValidationErrors(elementId) {
    if (elementId) {
      const errorDiv = document.getElementById(elementId);
      if (errorDiv) {
        errorDiv.innerHTML = '';
        errorDiv.style.display = 'none';
      }
    }
  }
};
