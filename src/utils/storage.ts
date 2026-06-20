/* eslint-disable @typescript-eslint/no-require-imports */
import { Platform } from 'react-native';

// Simple in-memory fallback for native platforms if AsyncStorage is not present
const memoryStore: Record<string, string> = {};

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.error('Error reading from localStorage:', e);
        return null;
      }
    }
    
    // For Native platforms, try to dynamically load async-storage if available, otherwise fallback to memory
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(key);
    } catch {
      return memoryStore[key] || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
        return;
      } catch (e) {
        console.error('Error writing to localStorage:', e);
        return;
      }
    }

    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(key, value);
    } catch {
      memoryStore[key] = value;
    }
  }
};
