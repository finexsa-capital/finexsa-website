// FINEXSA Client Portal — shared configuration
// Milestone 1: Firebase/Auth + Firestore client portal skeleton

export const CLIENT_CONFIG = {
  appName: "FINEXSA Capital",
  environment: "production",

  firebase: {
    apiKey: "AIzaSyDynBPUjrpBHmPc6EGwHyOZmkEiv-pNhR0",
    authDomain: "finexsa-capital.firebaseapp.com",
    projectId: "finexsa-capital",
    storageBucket: "finexsa-capital.firebasestorage.app",
    messagingSenderId: "225933147484",
    appId: "1:225933147484:web:b71f87f0705553062ed599",
    measurementId: "G-8V2H675WN1"
  },

  // Legacy reports API used by the old /login.html viewer.
  // The new portal does not call it in Milestone 1, but we keep it centralized.
  legacyReportsApiUrl: "https://script.google.com/macros/s/AKfycbzou5xJEALQnB5l6U0uyHQR-fcdj_oZBpZjzxy2PHaY-kfkkdvpZIWz87wqdwbOjdUt/exec",

  routes: {
    login: "./login.html",
    dashboard: "./dashboard.html",
    companies: "./companies.html",
    oldReportsViewer: "../login.html"
  },

  collections: {
    users: "users",
    clientCompanies: "client_companies"
  }
};
