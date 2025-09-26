import { initializeApp } from './app.js';
import { initializeAttributeSelector } from './attributeSelector.js';

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app...');
  
  // First initialize the app (sets up CODAP connection)
  initializeApp().then(() => {
    console.log('App initialized, now initializing attribute selector...');
    
    // Then initialize the attribute selector
    initializeAttributeSelector();
    
    console.log('Initialization complete.');
  }).catch(err => {
    console.error('Error initializing app:', err);
  });
}); 