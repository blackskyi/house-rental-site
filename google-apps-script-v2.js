/**
 * Google Apps Script for Multi-Owner House Rental Platform
 * Version 2.0 - With Commission Protection
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com/
 * 2. Create a new project
 * 3. Copy this entire code into the script editor
 * 4. Update PLATFORM_EMAIL with your platform email
 * 5. Click "Deploy" > "New deployment"
 * 6. Select "Web app" as deployment type
 * 7. Set "Execute as" to "Me"
 * 8. Set "Who has access" to "Anyone"
 * 9. Click "Deploy"
 * 10. Copy the Web App URL and paste it in script.js (APPS_SCRIPT_URL)
 * 11. Authorize the script when prompted
 */

// CONFIGURATION
const PLATFORM_EMAIL = 'support@og-rooms.com'; // Your platform email
const PLATFORM_NAME = 'Campus Rentals'; // Your platform name
const COMMISSION_RATE = '12%'; // Your commission rate

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Generate unique tracking ID for this lead
    const trackingId = generateTrackingId();
    data.trackingId = trackingId;

    // Log application to tracking sheet (optional but recommended)
    logApplication(data);

    // Create PDF with commission protection notices
    const pdfBlob = createPDF(data);

    // Send email to property owner FROM your email
    sendEmailToOwner(data, pdfBlob);

    // Send confirmation to applicant (optional)
    sendConfirmationToApplicant(data);

    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success',
      'message': 'Application submitted successfully',
      'trackingId': trackingId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function generateTrackingId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return 'LEAD-' + timestamp + '-' + random;
}

function logApplication(data) {
  // Optional: Log to Google Sheet for tracking
  // This creates a paper trail of all leads that came through your platform
  try {
    const sheetUrl = 'YOUR_GOOGLE_SHEET_URL_HERE'; // Create a Google Sheet and paste URL here
    // const sheet = SpreadsheetApp.openByUrl(sheetUrl).getActiveSheet();
    // sheet.appendRow([
    //   data.trackingId,
    //   new Date(),
    //   data.propertyOwner,
    //   data.propertyName,
    //   data.fullName,
    //   data.email,
    //   data.phone,
    //   data.ownerEmail,
    //   'Pending'
    // ]);
  } catch (error) {
    Logger.log('Sheet logging error: ' + error.toString());
    // Don't fail the whole process if logging fails
  }
}

function createPDF(data) {
  // Create a new Google Doc
  const doc = DocumentApp.create('Rental_Application_' + data.trackingId);
  const body = doc.getBody();

  // Add watermark/header with platform branding
  const header = body.appendParagraph('═══════════════════════════════════════════════');
  header.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  const platformHeader = body.appendParagraph(PLATFORM_NAME.toUpperCase());
  platformHeader.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  platformHeader.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  platformHeader.getEditAsText().setForegroundColor('#4285f4');

  const tagline = body.appendParagraph('Trusted Campus Housing Platform');
  tagline.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  tagline.setItalic(true);

  body.appendParagraph('═══════════════════════════════════════════════');
  body.appendParagraph(''); // Empty line

  // IMPORTANT COMMISSION NOTICE
  const commissionNotice = body.appendParagraph('⚠️ IMPORTANT NOTICE TO PROPERTY OWNER');
  commissionNotice.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  commissionNotice.getEditAsText().setForegroundColor('#ea4335');

  const noticeText = body.appendParagraph(
    'This lead was generated through ' + PLATFORM_NAME + '. Per your property owner agreement, ' +
    'a ' + COMMISSION_RATE + ' commission is due upon successful rental to this applicant or any ' +
    'member of their party within 12 months of this application date. Tracking ID: ' + data.trackingId
  );
  noticeText.getEditAsText().setBold(true);
  const noticeBox = noticeText.setBorderColor('#ea4335');
  noticeBox.setBorderWidth(2);
  noticeText.setBackground('#fff3cd');

  body.appendParagraph(''); // Empty line
  body.appendHorizontalRule();
  body.appendParagraph(''); // Empty line

  // Add title
  const title = body.appendParagraph('RENTAL APPLICATION');
  title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  body.appendParagraph(''); // Empty line

  // Add tracking and submission info
  const trackingInfo = body.appendParagraph('Tracking ID: ' + data.trackingId);
  trackingInfo.setBold(true);
  trackingInfo.getEditAsText().setForegroundColor('#4285f4');

  const submissionDate = body.appendParagraph('Submitted: ' + data.submittedAt);
  submissionDate.setItalic(true);

  const propertyInfo = body.appendParagraph('Property: ' + data.propertyName);
  propertyInfo.setBold(true);

  body.appendHorizontalRule();
  body.appendParagraph(''); // Empty line

  // Add applicant information
  const sections = [
    { title: 'PERSONAL INFORMATION', fields: [
      { label: 'Full Name', value: data.fullName },
      { label: 'Email Address', value: data.email },
      { label: 'Phone Number', value: data.phone }
    ]},
    { title: 'RENTAL DETAILS', fields: [
      { label: 'Desired Move-in Date', value: data.moveInDate },
      { label: 'Number of Occupants', value: data.occupants }
    ]},
    { title: 'VIEWING AVAILABILITY', fields: [
      { label: 'Applicant\'s Available Times', value: data.availability || 'Not provided' }
    ]},
    { title: 'EMPLOYMENT & FINANCIAL', fields: [
      { label: 'Employment Status', value: data.employment },
      { label: 'Monthly Income', value: data.income }
    ]},
    { title: 'PETS', fields: [
      { label: 'Has Pets', value: data.pets },
      { label: 'Pet Details', value: data.petDetails || 'N/A' }
    ]},
    { title: 'REFERENCES', fields: [
      { label: 'Previous Landlord Reference', value: data.references || 'Not provided' }
    ]},
    { title: 'ADDITIONAL INFORMATION', fields: [
      { label: 'Message', value: data.message || 'None' }
    ]}
  ];

  sections.forEach(section => {
    const sectionTitle = body.appendParagraph(section.title);
    sectionTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);

    section.fields.forEach(field => {
      const fieldPara = body.appendParagraph(field.label + ': ' + field.value);
      const text = fieldPara.editAsText();
      text.setBold(0, field.label.length);
    });

    body.appendParagraph(''); // Empty line after each section
  });

  // Footer with platform contact
  body.appendHorizontalRule();
  const footer = body.appendParagraph(
    '\n\nProcessed by ' + PLATFORM_NAME + '\n' +
    'Contact: ' + PLATFORM_EMAIL + '\n' +
    'All communications regarding this applicant must go through the platform.\n' +
    'Tracking ID: ' + data.trackingId
  );
  footer.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  footer.getEditAsText().setFontSize(9);
  footer.setItalic(true);

  // Save and close the doc
  doc.saveAndClose();

  // Convert to PDF
  const docId = doc.getId();
  const pdfBlob = DriveApp.getFileById(docId).getAs('application/pdf');
  pdfBlob.setName('Application_' + data.trackingId + '_' + data.fullName.replace(/\s+/g, '_') + '.pdf');

  // Delete the temporary Google Doc
  DriveApp.getFileById(docId).setTrashed(true);

  return pdfBlob;
}

function sendEmailToOwner(data, pdfBlob) {
  const ownerEmail = data.ownerEmail;
  const subject = '🏠 New Rental Application - ' + data.propertyName + ' [' + data.trackingId + ']';

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #4285f4 0%, #3367d6 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">${PLATFORM_NAME}</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px;">New Rental Application</p>
      </div>

      <!-- COMMISSION NOTICE -->
      <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0;">
        <h3 style="color: #856404; margin-top: 0;">⚠️ Platform Lead - Commission Applies</h3>
        <p style="color: #856404; margin: 0;">
          This application was submitted through ${PLATFORM_NAME}. Per your owner agreement,
          ${COMMISSION_RATE} commission applies if you rent to this applicant.
          <br><strong>Tracking ID: ${data.trackingId}</strong>
        </p>
      </div>

      <div style="padding: 30px; background: #f8f9fa;">
        <p>Hello,</p>
        <p>You have received a new rental application for <strong>${data.propertyName}</strong>.</p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #4285f4; margin-top: 0;">Applicant Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 40%;">Name:</td>
              <td style="padding: 8px 0;">${data.fullName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;">${data.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
              <td style="padding: 8px 0;">${data.phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Move-in Date:</td>
              <td style="padding: 8px 0;">${data.moveInDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Occupants:</td>
              <td style="padding: 8px 0;">${data.occupants}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Employment:</td>
              <td style="padding: 8px 0;">${data.employment}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Monthly Income:</td>
              <td style="padding: 8px 0;">${data.income}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Pets:</td>
              <td style="padding: 8px 0;">${data.pets}${data.petDetails ? ' - ' + data.petDetails : ''}</td>
            </tr>
          </table>
        </div>

        ${data.availability ? `
        <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
          <h3 style="color: #2e7d32; margin-top: 0;">📅 Viewing Availability</h3>
          <p style="white-space: pre-line; color: #2e7d32; margin: 0;">${data.availability}</p>
        </div>
        ` : ''}

        ${data.references ? `
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #4285f4; margin-top: 0;">References</h3>
          <p style="margin: 0;">${data.references}</p>
        </div>
        ` : ''}

        ${data.message ? `
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #4285f4; margin-top: 0;">Additional Information</h3>
          <p style="margin: 0;">${data.message}</p>
        </div>
        ` : ''}

        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1976d2; margin-top: 0;">Next Steps</h3>
          <ol style="color: #1976d2; margin: 0; padding-left: 20px;">
            <li>Review the attached PDF application</li>
            <li>Reply to this email with your preferred viewing time from the applicant's availability</li>
            <li>We will coordinate the viewing with the applicant</li>
            <li>All communication goes through ${PLATFORM_NAME} for your protection</li>
          </ol>
        </div>

        <p style="margin-top: 20px;"><strong>Important:</strong> Please reply to this email (${PLATFORM_EMAIL}) with your response.
        Do not contact the applicant directly to maintain platform tracking and commission agreements.</p>

        <p>The complete application is attached as a PDF.</p>
      </div>

      <div style="background: #202124; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;"><strong>Tracking ID:</strong> ${data.trackingId}</p>
        <p style="margin: 10px 0 0 0;">Submitted on ${data.submittedAt}</p>
        <p style="margin: 10px 0 0 0;">${PLATFORM_NAME} | ${PLATFORM_EMAIL}</p>
      </div>
    </div>
  `;

  // Send FROM your platform email TO the property owner
  MailApp.sendEmail({
    to: ownerEmail,
    replyTo: PLATFORM_EMAIL,
    subject: subject,
    htmlBody: htmlBody,
    attachments: [pdfBlob],
    name: PLATFORM_NAME
  });
}

function sendConfirmationToApplicant(data) {
  const subject = '✓ Application Received - ' + data.propertyName;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #4285f4 0%, #3367d6 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">Application Received!</h1>
      </div>

      <div style="padding: 30px; background: #f8f9fa;">
        <p>Hello ${data.fullName},</p>

        <p>Thank you for applying for <strong>${data.propertyName}</strong>!</p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
          <h3 style="color: #2e7d32; margin-top: 0;">✓ Application Submitted Successfully</h3>
          <p style="margin: 0;"><strong>Tracking ID:</strong> ${data.trackingId}</p>
          <p style="margin: 10px 0 0 0;"><strong>Property:</strong> ${data.propertyName}</p>
        </div>

        <h3 style="color: #4285f4;">What Happens Next?</h3>
        <ol style="color: #5f6368; line-height: 1.8;">
          <li>The property owner will review your application</li>
          <li>They will contact you through our platform with a confirmed viewing time</li>
          <li>You'll receive an email when they respond</li>
          <li>All communications are tracked for your security</li>
        </ol>

        <div style="background: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0; color: #856404;">
            <strong>Note:</strong> If anyone contacts you directly claiming to be the property owner,
            please verify with us first by replying to this email. All legitimate communications
            should reference your tracking ID: <strong>${data.trackingId}</strong>
          </p>
        </div>

        <p>If you have any questions, please reply to this email or contact us at ${PLATFORM_EMAIL}.</p>

        <p style="margin-top: 30px;">Best regards,<br><strong>${PLATFORM_NAME}</strong></p>
      </div>

      <div style="background: #202124; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">${PLATFORM_NAME}</p>
        <p style="margin: 10px 0 0 0;">${PLATFORM_EMAIL}</p>
      </div>
    </div>
  `;

  try {
    MailApp.sendEmail({
      to: data.email,
      replyTo: PLATFORM_EMAIL,
      subject: subject,
      htmlBody: htmlBody,
      name: PLATFORM_NAME
    });
  } catch (error) {
    Logger.log('Confirmation email error: ' + error.toString());
    // Don't fail the whole process if confirmation fails
  }
}

// Test function - uncomment to test
/*
function testForm() {
  const testData = {
    propertyName: "Spacious 3B2B Near Campus",
    propertyOwner: "Sara",
    ownerEmail: "owner@example.com",
    fullName: "John Doe",
    email: "john@example.com",
    phone: "123-456-7890",
    moveInDate: "2025-12-15",
    occupants: "2",
    employment: "employed",
    income: "$5000",
    pets: "yes",
    petDetails: "1 dog, small breed",
    references: "Jane Smith, 555-123-4567",
    message: "Looking forward to renting this property",
    availability: "- Monday, Dec 18 between 2pm-5pm\n- Wednesday, Dec 20 anytime after 3pm\n- Friday, Dec 22 morning 10am-12pm",
    submittedAt: new Date().toLocaleString()
  };

  const trackingId = generateTrackingId();
  testData.trackingId = trackingId;

  const pdfBlob = createPDF(testData);
  sendEmailToOwner(testData, pdfBlob);
  sendConfirmationToApplicant(testData);

  Logger.log("Test completed! Tracking ID: " + trackingId);
}
*/
