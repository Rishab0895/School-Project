/**
 * Utility Functions - Date, formatting, etc.
 */

const Utils = {
  // ==================== DATE UTILITIES ====================
  
  // Format date to DD/MM/YYYY
  formatDate(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString + 'T00:00:00');
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  },

  // Format date time to DD/MM/YYYY HH:MM
  formatDateTime(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  },

  // Get today's date in YYYY-MM-DD format
  getTodayDate() {
    return new Date().toISOString().split('T')[0];
  },

  // Get current month in YYYY-MM format
  getCurrentMonth() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  },

  // Calculate age from date of birth
  calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  },

  // Get month name from number
  getMonthName(monthNumber) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNumber - 1] || '';
  },

  // Get day name from date
  getDayName(dateString) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    try {
      const date = new Date(dateString + 'T00:00:00');
      return days[date.getDay()];
    } catch {
      return '';
    }
  },

  // Check if date is overdue
  isOverdue(dueDate) {
    return Utils.getTodayDate() > dueDate;
  },

  // Get days overdue
  getDaysOverdue(dueDate) {
    const today = new Date();
    const due = new Date(dueDate + 'T00:00:00');
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  },

  // ==================== CURRENCY UTILITIES ====================

  // Format amount to currency (Indian Rupees)
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  // Format amount with commas
  formatNumber(amount) {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  },

  // ==================== STRING UTILITIES ====================

  // Capitalize first letter
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Convert to title case
  toTitleCase(str) {
    return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  },

  // Generate initials from name
  getInitials(name) {
    return name.split(' ').map(n => n.charAt(0).toUpperCase()).join('');
  },

  // Truncate string
  truncate(str, length = 50) {
    return str.length > length ? str.substring(0, length) + '...' : str;
  },

  // ==================== ARRAY UTILITIES ====================

  // Remove duplicates from array
  removeDuplicates(arr) {
    return [...new Set(arr)];
  },

  // Sort array of objects by property
  sortBy(arr, property, ascending = true) {
    return [...arr].sort((a, b) => {
      const aVal = a[property];
      const bVal = b[property];
      if (aVal < bVal) return ascending ? -1 : 1;
      if (aVal > bVal) return ascending ? 1 : -1;
      return 0;
    });
  },

  // Group array by property
  groupBy(arr, property) {
    return arr.reduce((grouped, item) => {
      const key = item[property];
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
      return grouped;
    }, {});
  },

  // ==================== CALCULATION UTILITIES ====================

  // Calculate late fee on amount
  calculateLateFee(amount, daysOverdue) {
    const dailyRate = (CONFIG.fees.lateFee.percentage / 100) / 30; // Monthly percentage to daily
    const calculatedFee = amount * dailyRate * daysOverdue;
    const maxFee = (amount * CONFIG.fees.lateFee.cap) / 100;
    return Math.min(calculatedFee, maxFee);
  },

  // Calculate outstanding balance
  calculateOutstanding(totalFeeAmount, totalPaid) {
    return totalFeeAmount - totalPaid;
  },

  // Calculate percentage
  calculatePercentage(value, total) {
    return total > 0 ? ((value / total) * 100).toFixed(2) : 0;
  },

  // Calculate net salary from components
  calculateNetSalary(basicSalary, allowances, deductions) {
    return basicSalary + allowances - deductions;
  },

  // ==================== DOCUMENT UTILITIES ====================

  // Generate receipt number
  generateReceiptNumber(studentId, paymentDate) {
    const date = paymentDate.replace(/-/g, '');
    const studentIdShort = studentId.substring(studentId.length - 4);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RCP${date}${studentIdShort}${random}`;
  },

  // Generate salary slip number
  generateSalarySlipNumber(staffId, month) {
    const monthYear = month.replace('-', '');
    const staffIdShort = staffId.substring(staffId.length - 4);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SAL${monthYear}${staffIdShort}${random}`;
  },

  // ==================== PDF/PRINT UTILITIES ====================

  // Print element
  printElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
      alert('Element not found');
      return;
    }

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Print</title>');
    printWindow.document.write('<link rel="stylesheet" href="css/print.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write(element.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  },

  // Download as text file
  downloadAsFile(content, filename = 'download.txt') {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  },

  // ==================== COLOR/STYLE UTILITIES ====================

  // Get color for status
  getStatusColor(status) {
    const colors = {
      'active': 'green',
      'inactive': 'gray',
      'paid': 'green',
      'pending': 'orange',
      'partially_paid': 'blue',
      'on_leave': 'yellow',
      'graduated': 'purple',
      'transferred': 'brown',
      'retired': 'gray'
    };
    return colors[status] || 'gray';
  },

  // Get status badge HTML
  getStatusBadge(status) {
    const color = Utils.getStatusColor(status);
    const displayText = Utils.toTitleCase(status.replace(/_/g, ' '));
    return `<span class="status-badge status-${color}">${displayText}</span>`;
  },

  // ==================== VALIDATION HELPER ====================

  // Check if object is empty
  isEmpty(obj) {
    return Object.keys(obj).length === 0;
  },

  // Deep clone object
  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
};
