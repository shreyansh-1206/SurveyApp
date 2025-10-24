import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="new-survey" />
        <Stack.Screen name="my-surveys" />
        <Stack.Screen name="survey-detail" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="camera" />
      </Stack>
    </AuthProvider>
  );
}