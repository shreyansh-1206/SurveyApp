// Area estimation utilities

/**
 * Manual area calculation
 * @param {number} length - Length in meters
 * @param {number} breadth - Breadth in meters
 * @returns {number} Area in square meters
 */
export const calculateManualArea = (length, breadth) => {
  const l = parseFloat(length);
  const b = parseFloat(breadth);
  
  if (isNaN(l) || isNaN(b) || l <= 0 || b <= 0) {
    throw new Error('Invalid dimensions');
  }
  
  return l * b;
};

/**
 * Estimate area from image with reference object
 * STUB IMPLEMENTATION - Replace with CV model API call in production
 * 
 * Current implementation:
 * 1. User provides reference object real-world length (e.g., 1 meter stick)
 * 2. Simple proportional calculation based on reference
 * 
 * To upgrade to full CV:
 * - Send image to computer vision API (Azure CV, Google Cloud Vision, or custom model)
 * - API detects reference object and property boundaries
 * - Returns calculated area
 * 
 * @param {string} imageUri - Base64 or file URI of captured image
 * @param {number} referenceLengthMeters - Real-world length of reference object in meters
 * @param {number} referencePixels - Pixel length of reference object in image (optional, for advanced usage)
 * @returns {Promise<number>} Estimated area in square meters
 */
export const estimateAreaFromImage = async (imageUri, referenceLengthMeters, referencePixels = 100) => {
  // Validate inputs
  const refLength = parseFloat(referenceLengthMeters);
  const refPx = parseFloat(referencePixels);
  
  if (isNaN(refLength) || refLength <= 0) {
    throw new Error('Invalid reference length');
  }
  
  if (!imageUri) {
    throw new Error('Image URI is required');
  }
  
  // STUB: Simple estimation algorithm
  // In production, replace this with actual CV API call:
  /*
  const response = await fetch(process.env.EXPO_PUBLIC_API_OCR_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: imageUri,
      referenceLength: referenceLengthMeters,
      task: 'area_estimation'
    })
  });
  const data = await response.json();
  return data.estimatedArea;
  */
  
  // Current stub logic:
  // Assumes property occupies ~70% of image frame
  // Uses reference object to calculate scale
  const pixelsPerMeter = refPx / refLength;
  
  // Simulated property dimensions (replace with CV detection)
  const estimatedWidthPixels = 300; // Placeholder
  const estimatedHeightPixels = 400; // Placeholder
  
  const estimatedWidth = estimatedWidthPixels / pixelsPerMeter;
  const estimatedHeight = estimatedHeightPixels / pixelsPerMeter;
  
  const area = estimatedWidth * estimatedHeight;
  
  // Anomaly check
  if (area > 10000 || area < 1) {
    console.warn('Area estimation might be unrealistic:', area);
  }
  
  return parseFloat(area.toFixed(2));
};

/**
 * Anomaly detection for area values
 * @param {number} area - Calculated area
 * @param {object} expectedBounds - {min, max} expected area range
 * @returns {object} {isValid: boolean, message: string}
 */
export const anomalyCheck = (area, expectedBounds = { min: 1, max: 10000 }) => {
  const a = parseFloat(area);
  
  if (isNaN(a) || a <= 0) {
    return { isValid: false, message: 'Invalid area value' };
  }
  
  if (a < expectedBounds.min) {
    return { isValid: false, message: `Area too small (< ${expectedBounds.min} m²). Please verify measurements.` };
  }
  
  if (a > expectedBounds.max) {
    return { isValid: false, message: `Area too large (> ${expectedBounds.max} m²). Please verify measurements.` };
  }
  
  return { isValid: true, message: 'Area within expected range' };
};