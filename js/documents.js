/**
 * Document Generation - Fee receipts, salary slips, and PDF export
 * Handles professional document generation and export functionality
 */

// ==================== FEE RECEIPT GENERATION ====================
function generateFeeReceipt(paymentId) {
  const payment = Storage.getItemById('feePayments', paymentId);
  if (!payment) {
    alert('Payment record not found');
    return;
  }

  const fee = Storage.getItemById('fees', payment.feeId);
  const student = Storage.getItemById('students', fee.studentId);
  const receiptNumber = 'RCP-' + payment.paymentDate.replace(/\//g, '') + '-' + paymentId.slice(-6);

  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Fee Receipt - ${student.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .receipt-container { max-width: 600px; margin: 0 auto; background-color: white; border: 2px solid #2c3e50; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 15px; margin-bottom: 20px; }
        .school-name { font-size: 26px; font-weight: bold; color: #2c3e50; }
        .school-details { font-size: 12px; color: #666; margin-top: 5px; }
        .receipt-title { font-size: 20px; font-weight: bold; color: #3498db; margin-top: 10px; }
        .receipt-number { font-size: 11px; color: #999; }
        .info-section { margin-bottom: 20px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 5px 0; border-bottom: 1px dotted #ddd; }
        .info-label { font-weight: bold; width: 40%; }
        .info-value { width: 55%; text-align: right; }
        .fee-details { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #3498db; margin-bottom: 20px; }
        .fee-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .fee-label { font-weight: bold; }
        .fee-amount { text-align: right; }
        .total-section { background-color: #e8f4f8; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .total-amount { font-weight: bold; font-size: 18px; color: #27ae60; }
        .payment-method { background-color: #f0f0f0; padding: 10px; border-radius: 4px; margin-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 11px; color: #999; }
        .verification { text-align: center; margin-top: 20px; font-size: 13px; }
        .verification-code { font-family: monospace; background-color: #f0f0f0; padding: 8px; border-radius: 3px; display: inline-block; margin-top: 5px; }
        @media print { body { background-color: white; margin: 0; padding: 0; } .receipt-container { box-shadow: none; } }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <div class="school-name">${CONFIG.school.name}</div>
          <div class="school-details">
            ${CONFIG.school.address}<br>
            📞 ${CONFIG.school.phone} | 📧 ${CONFIG.school.email}
          </div>
          <div class="receipt-title">FEE RECEIPT</div>
          <div class="receipt-number">Receipt #: ${receiptNumber}</div>
        </div>

        <div class="info-section">
          <div class="info-row">
            <span class="info-label">Student Name:</span>
            <span class="info-value">${student.name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Class:</span>
            <span class="info-value">${student.class}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Roll Number:</span>
            <span class="info-value">${student.id}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Academic Year:</span>
            <span class="info-value">${fee.academicYear}-${fee.academicYear + 1}</span>
          </div>
        </div>

        <div class="fee-details">
          <div style="font-weight: bold; margin-bottom: 10px; font-size: 14px;">Fee Details:</div>
          <div class="fee-row">
            <span class="fee-label">Fee Type:</span>
            <span class="fee-amount">${fee.feeType.charAt(0).toUpperCase() + fee.feeType.slice(1).replace(/_/g, ' ')}</span>
          </div>
          <div class="fee-row">
            <span class="fee-label">Amount Due:</span>
            <span class="fee-amount">${Utils.formatCurrency(fee.amount)}</span>
          </div>
          <div class="fee-row">
            <span class="fee-label">Amount Paid:</span>
            <span class="fee-amount">${Utils.formatCurrency(payment.amount)}</span>
          </div>
        </div>

        <div class="total-section">
          <div class="total-row">
            <span>Amount Received:</span>
            <span class="total-amount">${Utils.formatCurrency(payment.amount)}</span>
          </div>
          <div class="total-row" style="font-size: 11px; color: #666;">
            <span>In Words:</span>
            <span>${amountInWords(payment.amount)}</span>
          </div>
        </div>

        <div class="payment-method">
          <div style="font-weight: bold; margin-bottom: 8px;">Payment Information:</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Payment Method:</span>
            <span>${payment.paymentMethod.charAt(0).toUpperCase() + payment.paymentMethod.slice(1).replace(/_/g, ' ')}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Date of Payment:</span>
            <span>${payment.paymentDate}</span>
          </div>
          ${payment.referenceNumber ? `
            <div style="display: flex; justify-content: space-between;">
              <span>Reference Number:</span>
              <span>${payment.referenceNumber}</span>
            </div>
          ` : ''}
        </div>

        <div class="verification">
          <strong>Verified Receipt</strong>
          <div class="verification-code">${receiptNumber}</div>
          <p>This is an official receipt. Generated on ${Utils.formatDate(new Date().toISOString().split('T')[0])}</p>
        </div>

        <div class="footer">
          <p>${CONFIG.school.name}</p>
          <p>Thank you for the payment. Please keep this receipt for your records.</p>
          <p style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd;">Authorized by: School Administration</p>
        </div>
      </div>

      <script>
        window.print();
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '', 'height=800,width=900');
  printWindow.document.write(receiptHTML);
  printWindow.document.close();
}

// ==================== SALARY SLIP ALREADY IMPLEMENTED ====================
// Salary slip generation is already implemented in salary.js
// This function wrapper is for consistency
function generateSalarySlip(salaryId) {
  printSalarySlip(salaryId);
}

// ==================== PDF EXPORT FUNCTIONS ====================
function exportFeeReceiptAsPDF(paymentId) {
  const payment = Storage.getItemById('feePayments', paymentId);
  if (!payment) {
    alert('Payment record not found');
    return;
  }

  const fee = Storage.getItemById('fees', payment.feeId);
  const student = Storage.getItemById('students', fee.studentId);
  const receiptNumber = 'RCP-' + payment.paymentDate.replace(/\//g, '') + '-' + paymentId.slice(-6);
  const filename = `Fee_Receipt_${student.name}_${payment.paymentDate.replace(/\//g, '-')}.html`;

  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Fee Receipt - ${student.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .receipt-container { max-width: 600px; margin: 0 auto; background-color: white; border: 2px solid #2c3e50; padding: 30px; }
        .header { text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 15px; margin-bottom: 20px; }
        .school-name { font-size: 26px; font-weight: bold; color: #2c3e50; }
        .school-details { font-size: 12px; color: #666; margin-top: 5px; }
        .receipt-title { font-size: 20px; font-weight: bold; color: #3498db; margin-top: 10px; }
        .receipt-number { font-size: 11px; color: #999; }
        .info-section { margin-bottom: 20px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 5px 0; border-bottom: 1px dotted #ddd; }
        .info-label { font-weight: bold; width: 40%; }
        .info-value { width: 55%; text-align: right; }
        .fee-details { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #3498db; margin-bottom: 20px; }
        .fee-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .total-section { background-color: #e8f4f8; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .total-amount { font-weight: bold; font-size: 18px; color: #27ae60; }
        .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 11px; color: #999; }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <div class="school-name">${CONFIG.school.name}</div>
          <div class="receipt-title">FEE RECEIPT</div>
          <div class="receipt-number">Receipt #: ${receiptNumber}</div>
        </div>

        <div class="info-section">
          <div class="info-row"><span class="info-label">Student:</span><span class="info-value">${student.name}</span></div>
          <div class="info-row"><span class="info-label">Class:</span><span class="info-value">${student.class}</span></div>
          <div class="info-row"><span class="info-label">Academic Year:</span><span class="info-value">${fee.academicYear}-${fee.academicYear + 1}</span></div>
        </div>

        <div class="fee-details">
          <div class="fee-row"><span>Fee Type:</span><span>${fee.feeType}</span></div>
          <div class="fee-row"><span>Amount:</span><span>${Utils.formatCurrency(payment.amount)}</span></div>
          <div class="fee-row"><span>Payment Date:</span><span>${payment.paymentDate}</span></div>
        </div>

        <div class="total-section">
          <div class="total-row"><span style="font-weight: bold;">Amount Paid:</span><span class="total-amount">${Utils.formatCurrency(payment.amount)}</span></div>
        </div>

        <div class="footer">
          <p>Generated on ${Utils.formatDate(new Date().toISOString().split('T')[0])}</p>
          <p>Thank you for the payment.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  downloadHTML(receiptHTML, filename);
}

function exportSalarySlipAsPDF(salaryId) {
  const salary = Storage.getItemById('salaryPayments', salaryId);
  if (!salary) {
    alert('Salary record not found');
    return;
  }

  const staff = Storage.getItemById('staff', salary.staffId);
  const slipNumber = 'SAL-' + salary.month.replace('-', '') + '-' + salaryId.slice(-6);
  const filename = `Salary_Slip_${staff.name}_${salary.month}.html`;

  const slipHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Salary Slip - ${staff.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .slip-container { max-width: 600px; margin: 0 auto; border: 2px solid #333; padding: 30px; }
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
      </style>
    </head>
    <body>
      <div class="slip-container">
        <div class="header">
          <div class="school-name">${CONFIG.school.name}</div>
          <div class="slip-title">SALARY SLIP</div>
          <div style="font-size: 12px; color: #666;">Slip #: ${slipNumber}</div>
        </div>

        <div class="info-section">
          <div class="info-row"><span class="info-label">Employee:</span><span class="info-value">${staff.name}</span></div>
          <div class="info-row"><span class="info-label">Position:</span><span class="info-value">${staff.position}</span></div>
          <div class="info-row"><span class="info-label">Month:</span><span class="info-value">${salary.month}</span></div>
        </div>

        <div class="earnings">
          <div style="font-weight: bold; margin-bottom: 8px;">EARNINGS:</div>
          <div class="info-row"><span class="info-label">Basic:</span><span class="info-value">${Utils.formatCurrency(salary.basicSalary)}</span></div>
          <div class="info-row"><span class="info-label">Allowances:</span><span class="info-value">${Utils.formatCurrency(salary.allowances)}</span></div>
        </div>

        <div class="deductions">
          <div style="font-weight: bold; margin-bottom: 8px;">DEDUCTIONS:</div>
          <div class="info-row"><span class="info-label">Deductions:</span><span class="info-value">${Utils.formatCurrency(salary.deductions)}</span></div>
        </div>

        <div class="totals">
          <div class="total-row"><span class="total-label">NET SALARY:</span><span class="total-value">${Utils.formatCurrency(salary.netSalary)}</span></div>
        </div>
      </div>
    </body>
    </html>
  `;

  downloadHTML(slipHTML, filename);
}

// ==================== UTILITY FUNCTIONS ====================
function downloadHTML(html, filename) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  alert('Document exported successfully! Open the HTML file in your browser and use "Print to PDF" to save as PDF.');
}

function amountInWords(amount) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  function convertToWords(num) {
    if (num === 0) return 'Zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + convertToWords(num % 100) : '');
    if (num < 100000) return convertToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convertToWords(num % 1000) : '');
    if (num < 10000000) return convertToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convertToWords(num % 100000) : '');
    return convertToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + convertToWords(num % 10000000) : '');
  }

  const [rupees, paise] = amount.toString().split('.');
  const rupeesWords = convertToWords(parseInt(rupees || 0));
  const paiseWords = paise ? convertToWords(parseInt(paise)) + ' Paise' : 'Zero Paise';
  return rupeesWords + ' Rupees and ' + paiseWords;
}
