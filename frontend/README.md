# Property Survey App - Minimal Prototype

**Note:** This is a minimal, credit-friendly prototype. Replace the stubs (`estimateAreaFromImage`, `uploadFile`, `callOCR`) with your AI/cloud endpoints to enable full features.

## Quick Start

```bash
# Install dependencies
cd frontend
npm install

# Start the app
npm start
```

## Features

### Core Functionality (Implemented)
- **New Survey**: Create property surveys with owner information
- **GPS Capture**: One-tap GPS coordinate capture using device location
- **Camera Integration**: Capture property photos and documents
- **Area Estimation**: 
  - Manual entry (length × breadth)
  - Photo-based estimation with reference object (stubbed CV)
- **Property Tax Calculation**: Automatic calculation based on area
- **Local Storage**: Save surveys locally using AsyncStorage
- **Data Encryption**: Aadhar numbers encrypted using AES (crypto-js)
- **My Surveys**: List, view, edit, and delete surveys
- **Settings**: Configure tax rate and API endpoints

### Stubbed Features (Ready for Production Integration)

#### 1. Area Estimation from Image
**Current:** Simple proportional calculation using reference object
**File:** `frontend/utils/areaEstimator.js`
**Upgrade to:** Computer Vision API (Azure CV, Google Cloud Vision, custom model)

#### 2. Cloud File Upload
**Current:** Returns mock URL
**File:** `frontend/utils/apiStubs.js`
**Upgrade to:** S3, Google Cloud Storage, Azure Blob

#### 3. OCR Service
**Current:** Returns mock data
**File:** `frontend/utils/apiStubs.js`
**Upgrade to:** Azure OCR, Google Cloud Vision, Tesseract

#### 4. PDF Report Generation
**Current:** Returns JSON stub
**File:** `frontend/utils/apiStubs.js`
**Upgrade to:** `expo-print` or server-side PDF generation

## Configuration

### Environment Variables
Copy `frontend/.env.example` to `frontend/.env` and configure:

```env
# Backend API
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001

# Cloud Services (optional)
EXPO_PUBLIC_API_UPLOAD_URL=https://your-cloud-storage.com/upload
EXPO_PUBLIC_API_OCR_URL=https://your-ocr-service.com/extract

# Security
EXPO_PUBLIC_ENCRYPTION_KEY=your-32-char-key-here

# Tax Configuration
EXPO_PUBLIC_RATE_PER_M2=10
```

## Project Structure

```
frontend/
├── app/                      # Expo Router screens
│   ├── index.tsx            # Home/Landing screen
│   ├── new-survey.tsx       # Create new survey
│   ├── my-surveys.tsx       # List all surveys
│   ├── survey-detail.tsx    # View survey details
│   ├── settings.tsx         # App settings
│   └── camera.tsx           # Camera capture
├── utils/
│   ├── storage.js           # AsyncStorage wrapper
│   ├── areaEstimator.js     # Area calculation (manual + photo stub)
│   ├── encryption.js        # AES encryption/decryption
│   └── apiStubs.js          # Cloud upload, OCR, report stubs
└── package.json
```

## Permissions Required

The app requests:
- **Camera**: For capturing property photos and documents
- **Location**: For GPS coordinate capture

## Upgrading to Production

Replace stub functions in `frontend/utils/` with production APIs:
1. **Area Estimation**: Integrate CV model (Azure/Google/Custom)
2. **Cloud Storage**: AWS S3, GCS, or Azure Blob
3. **OCR**: Azure OCR or Google Cloud Vision
4. **Reports**: Implement PDF generation with expo-print

## Testing

### Manual Testing
1. Create a new survey
2. Fill owner information
3. Capture GPS coordinates
4. Try both area estimation methods
5. Save and view in My Surveys
6. Test settings configuration

---

**Version:** 1.0.0 (Prototype)  
**Platform:** Cross-platform (iOS, Android, Web)  
**Framework:** React Native + Expo
