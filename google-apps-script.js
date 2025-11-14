/**
 * Google Apps Script for House Rental Application Form
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com/
 * 2. Create a new project
 * 3. Copy this entire code into the script editor
 * 4. Click "Deploy" > "New deployment"
 * 5. Select "Web app" as deployment type
 * 6. Set "Execute as" to "Me"
 * 7. Set "Who has access" to "Anyone"
 * 8. Click "Deploy"
 * 9. Copy the Web App URL and paste it in script.js line 3 (APPS_SCRIPT_URL)
 * 10. Authorize the script when prompted
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Create PDF
    const pdfBlob = createPDF(data);

    // Send email with PDF attachment
    sendEmail(data, pdfBlob);

    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success',
      'message': 'Application submitted successfully'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function createPDF(data) {
  // Create a new Google Doc
  const doc = DocumentApp.create('House Rental Application - ' + data.fullName);
  const body = doc.getBody();

  // Add title
  const title = body.appendParagraph('HOUSE RENTAL APPLICATION');
  title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  body.appendParagraph(''); // Empty line

  // Add submission date
  const submissionDate = body.appendParagraph('Submitted: ' + data.submittedAt);
  submissionDate.setItalic(true);

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

  // Save and close the doc
  doc.saveAndClose();

  // Convert to PDF
  const docId = doc.getId();
  const pdfBlob = DriveApp.getFileById(docId).getAs('application/pdf');
  pdfBlob.setName('House_Rental_Application_' + data.fullName.replace(/\s+/g, '_') + '.pdf');

  // Delete the temporary Google Doc
  DriveApp.getFileById(docId).setTrashed(true);

  return pdfBlob;
}

function sendEmail(data, pdfBlob) {
  const recipient = data.recipientEmail;
  const subject = 'New House Rental Application - ' + data.fullName;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #4285f4 0%, #3367d6 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">New Rental Application</h1>
      </div>

      <div style="padding: 30px; background: #f8f9fa;">
        <p>You have received a new rental application from:</p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #4285f4; margin-top: 0;">Applicant Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Name:</td>
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

        ${data.references ? `
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #4285f4; margin-top: 0;">References</h3>
          <p>${data.references}</p>
        </div>
        ` : ''}

        ${data.message ? `
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #4285f4; margin-top: 0;">Additional Information</h3>
          <p>${data.message}</p>
        </div>
        ` : ''}

        <p style="margin-top: 20px;">The complete application is attached as a PDF.</p>
      </div>

      <div style="background: #202124; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">Submitted on ${data.submittedAt}</p>
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: recipient,
    subject: subject,
    htmlBody: htmlBody,
    attachments: [pdfBlob]
  });
}

// Test function - uncomment to test
/*
function testForm() {
  const testData = {
    fullName: "John Doe",
    email: "john@example.com",
    phone: "123-456-7890",
    moveInDate: "2025-12-01",
    occupants: "2",
    employment: "employed",
    income: "$5000",
    pets: "yes",
    petDetails: "1 dog, small breed",
    references: "Jane Smith, 555-123-4567",
    message: "Looking forward to renting this property",
    submittedAt: new Date().toLocaleString(),
    recipientEmail: "support@og-rooms.com"
  };

  const pdfBlob = createPDF(testData);
  sendEmail(testData, pdfBlob);
  Logger.log("Test completed!");
}
*/
