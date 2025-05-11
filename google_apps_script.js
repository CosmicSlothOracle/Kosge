// Google Apps Script for Banner URL Submissions

/**
 * Handles POST requests from the Netlify website
 */
function doPost(e) {
  try {
    // Initialize parameters safely
    const parameters = e && e.parameter ? e.parameter : {};

    // Log incoming request for debugging
    console.log('Received POST request with parameters:', JSON.stringify(parameters));

    // Check for required URL parameter
    if (!parameters.url) {
      return handleError('Invalid request: Missing URL');
    }

    const url = parameters.url.trim();
    const origin = parameters.origin || 'unknown';

    // Log the origin and URL for debugging
    console.log('Request from origin:', origin);
    console.log('Received URL:', url);

    // Strict URL validation
    if (!isValidImageUrl(url)) {
      return handleError('Invalid image URL');
    }

    // Open the spreadsheet
    const ss = SpreadsheetApp.openById('1cCSdnXP0fQHWlw7MiWME7rcsuywp2p5e5T1h2mEQx2cggPPM-I5hYsNm');
    const sheet = ss.getSheetByName('Tabelle1') || ss.insertSheet('Tabelle1');

    // Prepare data to log
    const timestamp = new Date();
    const ipAddress = getClientIP(parameters);

    // Append row with validation
    sheet.appendRow([
      timestamp,
      url,
      ipAddress,
      origin,
      validateDomain(url)
    ]);

    // Optional: Limit total rows to prevent sheet from growing indefinitely
    const maxRows = 1000;
    if (sheet.getLastRow() > maxRows) {
      sheet.deleteRows(2, sheet.getLastRow() - maxRows);
    }

    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'success',
        message: 'Banner URL successfully submitted'
      })
    )
    .setMimeType(ContentService.MimeType.JSON)
    .setContent(JSON.stringify({
      status: 'success',
      message: 'Banner URL successfully submitted'
    }))
    // Set CORS headers directly using the content service response
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');

  } catch (error) {
    console.error('Script error:', error.toString());
    return handleError('Server error: ' + error.toString());
  }
}

/**
 * Helper function to validate image URLs
 */
function isValidImageUrl(url) {
  try {
    if (!url) return false;

    // Simple format validation for common image extensions
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const hasValidExtension = validExtensions.some(ext => url.toLowerCase().endsWith(ext));

    // Basic URL structure validation
    const startsWithHttp = url.toLowerCase().startsWith('http://') || url.toLowerCase().startsWith('https://');

    console.log('URL validation:', {
      hasValidExtension: hasValidExtension,
      startsWithHttp: startsWithHttp
    });

    return startsWithHttp && hasValidExtension;
  } catch (error) {
    console.error('URL validation error:', error.toString());
    return false;
  }
}

/**
 * Get client IP address
 */
function getClientIP(params) {
  return params.userIP || 'Unknown';
}

/**
 * Validate and extract domain
 */
function validateDomain(url) {
  try {
    if (!url) return 'Invalid Domain';

    // Extract hostname from URL without using URL object (not available in GAS)
    const match = url.match(/^https?:\/\/([^\/]+)/i);
    return match ? match[1] : 'Invalid Domain';
  } catch {
    return 'Invalid Domain';
  }
}

/**
 * Centralized error handling
 */
function handleError(message) {
  console.error(message);
  return ContentService.createTextOutput(
    JSON.stringify({
      status: 'error',
      message: message
    })
  )
  .setMimeType(ContentService.MimeType.JSON)
  .setHeader('Access-Control-Allow-Origin', '*')
  .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Handle GET requests for testing or actual submissions
 */
function doGet(e) {
  try {
    // Initialize parameters safely
    const parameters = e && e.parameter ? e.parameter : {};

    // Log incoming request for debugging
    console.log('Received GET request with parameters:', JSON.stringify(parameters));

    // If URL parameter exists, process it like a submission
    if (parameters.url) {
      const url = parameters.url.trim();
      const origin = parameters.origin || 'unknown';

      // Log the origin and URL for debugging
      console.log('GET Request from origin:', origin);
      console.log('Received URL via GET:', url);

      // Strict URL validation
      if (!isValidImageUrl(url)) {
        return handleError('Invalid image URL');
      }

      // Open the spreadsheet
      const ss = SpreadsheetApp.openById('1cCSdnXP0fQHWlw7MiWME7rcsuywp2p5e5T1h2mEQx2cggPPM-I5hYsNm');
      const sheet = ss.getSheetByName('Tabelle1') || ss.insertSheet('Tabelle1');

      // Prepare data to log
      const timestamp = new Date();
      const ipAddress = 'GET Request';

      // Append row with validation
      sheet.appendRow([
        timestamp,
        url,
        ipAddress,
        origin,
        validateDomain(url)
      ]);

      // Return success response
      return ContentService.createTextOutput(
        JSON.stringify({
          status: 'success',
          message: 'Banner URL successfully submitted via GET'
        })
      )
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    // Return a simple status page if no URL parameter
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'active',
        message: 'This Google Apps Script is active and ready to receive submissions',
        timestamp: new Date().toISOString(),
        usage: 'Add ?url=https://example.com/image.jpg to submit a URL'
      })
    )
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  } catch (error) {
    console.error('GET error:', error.toString());
    return handleError('GET error: ' + error.toString());
  }
}