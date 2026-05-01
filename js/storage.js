/**
 * Storage Management - LocalStorage Helper Functions
 * Handles all data persistence in browser
 */

const Storage = {
  // Constants
  STORAGE_KEY: 'schoolManagementData',
  VERSION: 1,

  // Initialize storage with default structure
  init() {
    if (!this.getData()) {
      const defaultData = {
        version: this.VERSION,
        students: [],
        staff: [],
        fees: [],
        feePayments: [],
        salaries: [],
        salaryPayments: [],
        settings: {
          schoolName: CONFIG.school.name,
          currentAcademicYear: CONFIG.academicYear.current,
          lastBackup: null
        }
      };
      this.saveData(defaultData);
    }
  },

  // Get all data from storage
  getData() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },

  // Save all data to storage
  saveData(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving to storage:', error);
      if (error.name === 'QuotaExceededError') {
        alert('Storage limit exceeded! Please delete some data or backup existing data.');
      }
      return false;
    }
  },

  // Get specific collection
  getCollection(collection) {
    const data = this.getData();
    return data && data[collection] ? data[collection] : [];
  },

  // Add item to collection
  addItem(collection, item) {
    const data = this.getData();
    if (!data[collection]) {
      data[collection] = [];
    }
    data[collection].push(item);
    return this.saveData(data);
  },

  // Update item in collection
  updateItem(collection, itemId, updates) {
    const data = this.getData();
    const index = data[collection].findIndex(item => item.id === itemId);
    if (index !== -1) {
      data[collection][index] = { ...data[collection][index], ...updates };
      return this.saveData(data);
    }
    return false;
  },

  // Delete item from collection
  deleteItem(collection, itemId) {
    const data = this.getData();
    const index = data[collection].findIndex(item => item.id === itemId);
    if (index !== -1) {
      data[collection].splice(index, 1);
      return this.saveData(data);
    }
    return false;
  },

  // Get single item by ID
  getItemById(collection, itemId) {
    const items = this.getCollection(collection);
    return items.find(item => item.id === itemId);
  },

  // Search items in collection
  searchItems(collection, searchTerm, searchFields = ['name']) {
    const items = this.getCollection(collection);
    const term = searchTerm.toLowerCase();
    return items.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(term);
      })
    );
  },

  // Get students count
  getStudentsCount() {
    return this.getCollection('students').filter(s => s.status === 'active').length;
  },

  // Get staff count
  getStaffCount() {
    return this.getCollection('staff').filter(s => s.status === 'active').length;
  },

  // Get total fees collected (sum of all paid fee payments)
  getTotalFeesCollected(academicYear = null) {
    const payments = this.getCollection('feePayments');
    const filtered = academicYear
      ? payments.filter(p => {
        const fee = this.getItemById('fees', p.feeId);
        return fee && fee.academicYear === academicYear;
      })
      : payments;
    return filtered.reduce((sum, p) => sum + p.amount, 0);
  },

  // Get total salaries paid
  getTotalSalariesPaid(academicYear = null) {
    const payments = this.getCollection('salaryPayments');
    const filtered = academicYear
      ? payments.filter(p => p.academicYear === academicYear && p.status === 'paid')
      : payments.filter(p => p.status === 'paid');
    return filtered.reduce((sum, p) => sum + p.netSalary, 0);
  },

  // Get student fees by academic year
  getStudentFeesByYear(studentId, academicYear) {
    const fees = this.getCollection('fees');
    return fees.filter(f => f.studentId === studentId && f.academicYear === academicYear);
  },

  // Get payment records for a fee
  getFeePayments(feeId) {
    const payments = this.getCollection('feePayments');
    return payments.filter(p => p.feeId === feeId);
  },

  // Get salary records for a staff member
  getStaffSalaryRecords(staffId, academicYear = null) {
    const salaries = this.getCollection('salaryPayments');
    return academicYear
      ? salaries.filter(s => s.staffId === staffId && s.academicYear === academicYear)
      : salaries.filter(s => s.staffId === staffId);
  },

  // Backup all data to JSON file
  exportBackup() {
    const data = this.getData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `school_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  // Import backup from JSON file
  importBackup(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.version === this.VERSION) {
            this.saveData(data);
            resolve(true);
          } else {
            reject(new Error('Incompatible backup version'));
          }
        } catch (error) {
          reject(new Error('Invalid backup file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  // Export to CSV
  exportToCSV(collection, filename = 'export.csv') {
    const items = this.getCollection(collection);
    if (items.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(items[0]);
    const csvContent = [
      headers.join(','),
      ...items.map(item =>
        headers.map(header => {
          const value = item[header];
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value || '').replace(/"/g, '""');
          return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },

  // Clear all data (with confirmation)
  clearAllData() {
    if (confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
      localStorage.removeItem(this.STORAGE_KEY);
      this.init();
      return true;
    }
    return false;
  },

  // Get storage usage
  getStorageInfo() {
    const data = this.getData();
    const dataStr = JSON.stringify(data);
    const bytes = new Blob([dataStr]).size;
    const kb = (bytes / 1024).toFixed(2);
    const mb = (kb / 1024).toFixed(2);
    return {
      bytes,
      kb: parseFloat(kb),
      mb: parseFloat(mb),
      percentage: ((bytes / (5 * 1024 * 1024)) * 100).toFixed(2) // 5MB typical limit
    };
  },

  // Group array items by a property
  groupBy(array, property) {
    return array.reduce((result, item) => {
      const key = item[property];
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
      return result;
    }, {});
  }
};

// Initialize storage when script loads
document.addEventListener('DOMContentLoaded', () => {
  Storage.init();
});
