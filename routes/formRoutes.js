const express = require('express');
const router = express.Router();
const FormData = require('../models/FormData');
const PDFDocument = require('pdfkit');

// Submit form data
router.post('/submit', async (req, res) => {
  console.log('POST /submit - Received data:', req.body);
  try {
    const formData = new FormData(req.body);
    const savedData = await formData.save();
    console.log('Form data saved successfully:', savedData);
    res.status(201).json({ success: true, data: savedData });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all submissions
router.get('/submissions', async (req, res) => {
  console.log('GET /submissions - Fetching all submissions');
  try {
    const submissions = await FormData.find().sort({ createdAt: -1 });
    console.log(`Found ${submissions.length} submissions`);
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get submission by ID
router.get('/submission/:id', async (req, res) => {
  console.log('GET /submission/:id - Fetching submission:', req.params.id);
  try {
    const submission = await FormData.findById(req.params.id);
    if (!submission) {
      console.log('Submission not found');
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }
    console.log('Found submission:', submission);
    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Add this new route before the download-report route
router.get('/report-data/:id', async (req, res) => {
  console.log('GET /report-data/:id - Fetching report data:', req.params.id);
  try {
    const submission = await FormData.findById(req.params.id);
    if (!submission) {
      console.log('Report data not found for ID:', req.params.id);
      return res.status(404).json({ success: false, error: 'Report data not found' });
    }

    console.log('Found raw submission:', submission); // Add this line

    // Transform the data for the preview
    const reportData = {
      companyName: submission.fullName,
      address: submission.businessInfo.address,
      contact: submission.businessInfo.phone,
      monthlyRevenue: calculateTotalRevenue(submission), // You'll need to implement this
      totalAssets: calculateTotalAssets(submission), // You'll need to implement this
      loanAmount: calculateTotalLoanAmount(submission), // You'll need to implement this
      loanTerm: submission.loan,
      annexure: generateAnnexureText(submission), // You'll need to implement this
      // Add more details for debugging
      businessType: submission.businessType,
      industry: submission.industry,
      requirements: submission.requirements,
      monthlyExpenses: submission.monthlyExpenses
    };

    console.log('Transformed report data:', reportData); // Add this line

    res.status(200).json({ success: true, data: reportData });
  } catch (error) {
    console.error('Error generating report data:', error);
    res.status(500).json({ success: false, error: 'Failed to generate report data' });
  }
});

// Helper functions
function calculateTotalRevenue(submission) {
  // Implement revenue calculation logic
  return "₹" + Object.values(submission.monthlyExpenses)
    .filter(exp => exp.selected)
    .reduce((sum, exp) => sum + parseInt(exp.cost || 0), 0)
    .toLocaleString();
}

function calculateTotalAssets(submission) {
  // Implement assets calculation logic
  return "₹" + Object.values(submission.requirements)
    .filter(req => req.selected)
    .reduce((sum, req) => sum + parseInt(req.cost || 0), 0)
    .toLocaleString();
}

function calculateTotalLoanAmount(submission) {
  // Implement loan amount calculation logic
  return "₹" + Object.values(submission.requirements)
    .filter(req => req.selected)
    .reduce((sum, req) => sum + parseInt(req.cost || 0), 0)
    .toLocaleString();
}

function generateAnnexureText(submission) {
  // Generate annexure text based on submission data
  return `
    Business Type: ${submission.businessType}
    Industry: ${submission.industry}
    Registration: ${submission.businessInfo.registrationType}
    Owner Details: ${submission.personalInfo.ownerName} (${submission.personalInfo.education})
  `;
}

// Download report
router.get('/download-report/:id', async (req, res) => {
  console.log('GET /download-report/:id - Generating report for:', req.params.id);
  try {
    const submission = await FormData.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    // Set proper headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');

    // Create PDF
    const doc = new PDFDocument();
    const buffers = [];

    // Collect PDF data
    doc.on('data', buffer => buffers.push(buffer));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      res.end(pdfBuffer);
    });

    // Add content to PDF
    doc.fontSize(20).text('Business Report', { align: 'center' });
    doc.moveDown();
    
    // Business Details
    doc.fontSize(16).text('Business Details');
    doc.fontSize(12);
    doc.text(`Business Name: ${submission.fullName}`);
    doc.text(`Business Type: ${submission.businessType}`);
    doc.text(`Industry: ${submission.industry}`);
    doc.text(`Loan Type: ${submission.loan}`);
    doc.moveDown();

    // Personal Information
    doc.fontSize(16).text('Personal Information');
    doc.fontSize(12);
    doc.text(`Owner Name: ${submission.personalInfo.ownerName}`);
    doc.text(`Gender: ${submission.personalInfo.gender}`);
    doc.text(`Education: ${submission.personalInfo.education}`);
    doc.moveDown();

    // Business Information
    doc.fontSize(16).text('Business Address');
    doc.fontSize(12);
    doc.text(`Address: ${submission.businessInfo.address}`);
    doc.text(`Locality: ${submission.businessInfo.locality}`);
    doc.text(`Town: ${submission.businessInfo.town}`);
    doc.text(`Pin Code: ${submission.businessInfo.pincode}`);
    doc.moveDown();

    // Requirements
    doc.fontSize(16).text('Requirements');
    doc.fontSize(12);
    Object.entries(submission.requirements).forEach(([key, value]) => {
      if (value.selected) {
        doc.text(`${key}: ₹${value.cost}`);
      }
    });
    doc.moveDown();

    // Monthly Expenses
    doc.fontSize(16).text('Monthly Expenses');
    doc.fontSize(12);
    Object.entries(submission.monthlyExpenses).forEach(([key, value]) => {
      if (value.selected) {
        doc.text(`${key}: ₹${value.cost}`);
      }
    });

    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate report' });
  }
});

module.exports = router;
