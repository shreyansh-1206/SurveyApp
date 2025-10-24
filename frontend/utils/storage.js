import AsyncStorage from '@react-native-async-storage/async-storage';

const SURVEYS_KEY = '@property_surveys';

// Get all surveys
export const getSurveys = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(SURVEYS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading surveys:', e);
    return [];
  }
};

// Save a new survey
export const saveSurvey = async (survey) => {
  try {
    const surveys = await getSurveys();
    const newSurvey = {
      ...survey,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    surveys.push(newSurvey);
    await AsyncStorage.setItem(SURVEYS_KEY, JSON.stringify(surveys));
    return newSurvey;
  } catch (e) {
    console.error('Error saving survey:', e);
    throw e;
  }
};

// Update an existing survey
export const updateSurvey = async (id, updatedData) => {
  try {
    const surveys = await getSurveys();
    const index = surveys.findIndex(s => s.id === id);
    if (index !== -1) {
      surveys[index] = { ...surveys[index], ...updatedData, updatedAt: new Date().toISOString() };
      await AsyncStorage.setItem(SURVEYS_KEY, JSON.stringify(surveys));
      return surveys[index];
    }
    return null;
  } catch (e) {
    console.error('Error updating survey:', e);
    throw e;
  }
};

// Delete a survey
export const deleteSurvey = async (id) => {
  try {
    const surveys = await getSurveys();
    const filtered = surveys.filter(s => s.id !== id);
    await AsyncStorage.setItem(SURVEYS_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Error deleting survey:', e);
    throw e;
  }
};

// Get a single survey by ID
export const getSurveyById = async (id) => {
  try {
    const surveys = await getSurveys();
    return surveys.find(s => s.id === id) || null;
  } catch (e) {
    console.error('Error getting survey:', e);
    return null;
  }
};