/**
 * Cloud Upload Stub
 * Replace with actual cloud storage integration (S3, GCS, Azure Blob)
 * 
 * Example S3 implementation:
 * - Install: yarn add aws-sdk
 * - Configure AWS credentials
 * - Use S3 putObject to upload file
 * 
 * @param {string} fileUri - Local file URI or base64 data
 * @param {string} fileName - Name for the uploaded file
 * @returns {Promise<string>} URL of uploaded file
 */
export const uploadFile = async (fileUri, fileName) => {
  try {
    const apiUrl = process.env.EXPO_PUBLIC_API_UPLOAD_URL;
    
    if (!apiUrl || apiUrl.includes('your-cloud-storage')) {
      // Stub mode - return mock URL
      console.log('[STUB] File upload called:', fileName);
      return `https://mock-storage.example.com/${fileName}`;
    }
    
    // Production implementation (replace with actual API call)
    /*
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: fileName,
    });
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const data = await response.json();
    return data.url;
    */
    
    return fileUri; // Return local URI in stub mode
  } catch (e) {
    console.error('Upload error:', e);
    throw e;
  }
};

/**
 * OCR Service Stub
 * Replace with actual OCR service (Azure OCR, Google Cloud Vision, Tesseract)
 * 
 * Example Azure OCR:
 * - Use Azure Computer Vision API
 * - Send image for text extraction
 * - Parse results for Aadhar/document numbers
 * 
 * @param {string} imageUri - Image to process
 * @returns {Promise<object>} Extracted text data
 */
export const callOCR = async (imageUri) => {
  try {
    const apiUrl = process.env.EXPO_PUBLIC_API_OCR_URL;
    
    if (!apiUrl || apiUrl.includes('your-ocr-service')) {
      // Stub mode - return mock data
      console.log('[STUB] OCR called for image');
      return {
        text: 'Mock OCR Result',
        confidence: 0.95,
        fields: {
          aadhar: '1234-5678-9012',
          name: 'Sample Name',
        }
      };
    }
    
    // Production implementation
    /*
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageUri })
    });
    
    const data = await response.json();
    return data;
    */
    
    return { text: '', fields: {} };
  } catch (e) {
    console.error('OCR error:', e);
    throw e;
  }
};

/**
 * Generate report stub
 * Replace with actual PDF generation (react-native-pdf, server-side generation)
 * 
 * @param {object} survey - Survey data
 * @returns {Promise<object>} Report data or download link
 */
export const generateReport = async (survey) => {
  try {
    // Current: Return JSON format
    const report = {
      reportId: `REPORT-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      survey: {
        owner: survey.name,
        area: survey.area,
        tax: survey.tax,
        location: survey.gps,
        address: survey.address,
      },
      format: 'json'
    };
    
    console.log('[STUB] Report generated:', report.reportId);
    
    // To implement PDF:
    // 1. Server-side: Use library like pdfkit, puppeteer
    // 2. Client-side: Use react-native-pdf or expo-print
    /*
    import * as Print from 'expo-print';
    const html = `<html>...report template...</html>`;
    const { uri } = await Print.printToFileAsync({ html });
    return { uri, format: 'pdf' };
    */
    
    return report;
  } catch (e) {
    console.error('Report generation error:', e);
    throw e;
  }
};