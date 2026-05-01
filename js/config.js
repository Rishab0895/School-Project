/**
 * Configuration File - CUSTOMIZE THIS FOR YOUR SCHOOL
 * Update school details, fee types, salary structure here
 */

const CONFIG = {
  // ==================== SCHOOL INFORMATION ====================
  school: {
    name: "ABC Public School",
    address: "123, Main Street, City, State 123456",
    phone: "9876543210",
    email: "admin@abcschool.com",
    website: "www.abcschool.com",
    principalName: "Mr. John Doe",
    logo: "assets/logo.png" // Optional: Add school logo
  },

  // ==================== ACADEMIC YEAR CONFIGURATION ====================
  academicYear: {
    current: 2025,
    previous: 2024,
    available: [2024, 2025, 2026, 2027] // Add/remove years as needed
  },

  // ==================== STUDENT CLASSES ====================
  classes: [
    "Nursery",
    "KG",
    "Class 1",
    "Class 2",
    "Class 3",
    "Class 4",
    "Class 5",
    "Class 6",
    "Class 7",
    "Class 8",
    "Class 9",
    "Class 10",
    "Class 11 (Science)",
    "Class 11 (Commerce)",
    "Class 12 (Science)",
    "Class 12 (Commerce)"
  ],

  // ==================== FEE CONFIGURATION ====================
  // Define all fee types your school charges
  fees: {
    types: {
      tuition: {
        name: "Tuition Fee",
        mandatory: true,
        description: "Regular tuition charges"
      },
      hostel: {
        name: "Hostel Fee",
        mandatory: false,
        description: "Hostel accommodation charges"
      },
      transport: {
        name: "Transport Fee",
        mandatory: false,
        description: "School bus transportation"
      },
      uniform: {
        name: "Uniform Fee",
        mandatory: false,
        description: "School uniform charges"
      },
      activity: {
        name: "Activity Fee",
        mandatory: false,
        description: "Sports, games, and extracurricular activities"
      },
      exam: {
        name: "Examination Fee",
        mandatory: true,
        description: "Annual exam fee"
      },
      library: {
        name: "Library Fee",
        mandatory: false,
        description: "Library membership and book charges"
      },
      sports: {
        name: "Sports Fee",
        mandatory: false,
        description: "Sports coaching and equipment"
      }
    },

    // Fee amounts per class per type (annual amounts in rupees)
    amountPerClass: {
      // Nursery and KG
      "Nursery": {
        tuition: 50000,
        hostel: 0,
        transport: 6000,
        uniform: 2000,
        activity: 3000,
        exam: 2000,
        library: 1000,
        sports: 2000
      },
      "KG": {
        tuition: 50000,
        hostel: 0,
        transport: 6000,
        uniform: 2000,
        activity: 3000,
        exam: 2000,
        library: 1000,
        sports: 2000
      },

      // Primary classes (1-5)
      "Class 1": {
        tuition: 60000,
        hostel: 0,
        transport: 6000,
        uniform: 2500,
        activity: 3500,
        exam: 2500,
        library: 1500,
        sports: 2500
      },
      "Class 2": {
        tuition: 60000,
        hostel: 0,
        transport: 6000,
        uniform: 2500,
        activity: 3500,
        exam: 2500,
        library: 1500,
        sports: 2500
      },
      "Class 3": {
        tuition: 60000,
        hostel: 0,
        transport: 6000,
        uniform: 2500,
        activity: 3500,
        exam: 2500,
        library: 1500,
        sports: 2500
      },
      "Class 4": {
        tuition: 70000,
        hostel: 0,
        transport: 6000,
        uniform: 3000,
        activity: 4000,
        exam: 3000,
        library: 2000,
        sports: 3000
      },
      "Class 5": {
        tuition: 70000,
        hostel: 0,
        transport: 6000,
        uniform: 3000,
        activity: 4000,
        exam: 3000,
        library: 2000,
        sports: 3000
      },

      // Secondary classes (6-10)
      "Class 6": {
        tuition: 80000,
        hostel: 50000,
        transport: 7000,
        uniform: 3500,
        activity: 5000,
        exam: 3500,
        library: 2500,
        sports: 4000
      },
      "Class 7": {
        tuition: 80000,
        hostel: 50000,
        transport: 7000,
        uniform: 3500,
        activity: 5000,
        exam: 3500,
        library: 2500,
        sports: 4000
      },
      "Class 8": {
        tuition: 80000,
        hostel: 50000,
        transport: 7000,
        uniform: 3500,
        activity: 5000,
        exam: 3500,
        library: 2500,
        sports: 4000
      },
      "Class 9": {
        tuition: 90000,
        hostel: 50000,
        transport: 7000,
        uniform: 4000,
        activity: 5500,
        exam: 4000,
        library: 3000,
        sports: 4500
      },
      "Class 10": {
        tuition: 90000,
        hostel: 50000,
        transport: 7000,
        uniform: 4000,
        activity: 5500,
        exam: 4000,
        library: 3000,
        sports: 4500
      },

      // Senior Secondary (11-12)
      "Class 11 (Science)": {
        tuition: 120000,
        hostel: 60000,
        transport: 8000,
        uniform: 4500,
        activity: 6000,
        exam: 5000,
        library: 3500,
        sports: 5000
      },
      "Class 11 (Commerce)": {
        tuition: 100000,
        hostel: 60000,
        transport: 8000,
        uniform: 4500,
        activity: 6000,
        exam: 5000,
        library: 3500,
        sports: 5000
      },
      "Class 12 (Science)": {
        tuition: 120000,
        hostel: 60000,
        transport: 8000,
        uniform: 4500,
        activity: 6000,
        exam: 5000,
        library: 3500,
        sports: 5000
      },
      "Class 12 (Commerce)": {
        tuition: 100000,
        hostel: 60000,
        transport: 8000,
        uniform: 4500,
        activity: 6000,
        exam: 5000,
        library: 3500,
        sports: 5000
      }
    },

    // Fee due date (month and day)
    dueDate: {
      month: 6, // June
      day: 30
    },

    // Late fee charges
    lateFee: {
      percentage: 2, // 2% per month after due date
      cap: 10 // Maximum 10% total
    }
  },

  // ==================== STAFF SALARY CONFIGURATION ====================
  staff: {
    positions: [
      "Principal",
      "Vice Principal",
      "Teacher",
      "Lab Technician",
      "Librarian",
      "Office Staff",
      "Support Staff",
      "Security",
      "Maintenance"
    ],

    departments: [
      "Academic",
      "Administration",
      "Support Services",
      "Maintenance"
    ],

    // Salary grades with basic pay and allowances
    grades: {
      "Grade A (Principal)": {
        basic: 150000,
        dearness: 30000, // Dearness Allowance
        house: 15000,     // House Allowance
        entertainment: 5000,
        medical: 5000,
        provident: 15000  // Provident Fund
      },
      "Grade B (Vice Principal)": {
        basic: 100000,
        dearness: 20000,
        house: 10000,
        entertainment: 3000,
        medical: 3000,
        provident: 10000
      },
      "Grade C (Teacher)": {
        basic: 60000,
        dearness: 12000,
        house: 6000,
        entertainment: 2000,
        medical: 2000,
        provident: 6000
      },
      "Grade D (Support Staff)": {
        basic: 35000,
        dearness: 7000,
        house: 3500,
        entertainment: 1000,
        medical: 1000,
        provident: 3500
      },
      "Grade E (Others)": {
        basic: 25000,
        dearness: 5000,
        house: 2500,
        entertainment: 500,
        medical: 500,
        provident: 2500
      }
    },

    // Deductions from salary
    deductions: {
      provident_fund: 10, // % of basic salary
      professional_tax: 300, // Fixed amount
      esi: 2, // % of basic salary (if applicable)
      income_tax: 0 // Will be calculated separately; 0 means no TDS
    },

    // Salary payment date
    paymentDate: 1 // Day of month (1st of every month)
  },

  // ==================== PAYMENT METHODS ====================
  paymentMethods: [
    "Cash",
    "Check",
    "Bank Transfer",
    "Online Payment",
    "UPI"
  ],

  // ==================== STATUS OPTIONS ====================
  status: {
    student: ["active", "inactive", "graduated", "transferred"],
    staff: ["active", "inactive", "on_leave", "retired"],
    fee: ["pending", "partially_paid", "paid"],
    salary: ["pending", "paid"]
  },

  // ==================== DATE FORMAT ====================
  dateFormat: "DD/MM/YYYY", // Display format
  storageDateFormat: "YYYY-MM-DD" // Internal storage format

};

// Make CONFIG globally accessible
window.CONFIG = CONFIG;
