/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Simple logger utility that wraps console methods
 * This provides a consistent interface for logging throughout the application
 * and can be extended in the future to support additional features like
 * remote logging, log levels, etc.
 */

// Helper function to get timestamp
const getTimestamp = (): string => {
  return new Date().toISOString();
};

// Create a simple logger object
const logger = {
  debug: (message: string, ...args: any[]): void => {
    console.debug(`[${getTimestamp()}] DEBUG:`, message, ...args);
  },

  info: (message: string, ...args: any[]): void => {
    console.info(`[${getTimestamp()}] INFO:`, message, ...args);
  },

  warn: (message: string, ...args: any[]): void => {
    console.warn(`[${getTimestamp()}] WARN:`, message, ...args);
  },

  error: (message: string, ...args: any[]): void => {
    console.error(`[${getTimestamp()}] ERROR:`, message, ...args);
  },

  // Alias for info to match console.log usage
  log: (message: string, ...args: any[]): void => {
    console.info(`[${getTimestamp()}] INFO:`, message, ...args);
  },
};

export default logger;
