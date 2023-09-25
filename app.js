const express = require('express');
const admin = require('firebase-admin');
const functions =require("firebase-functions")

const app = express();
const port = process.env.PORT || 3001;

// Initialize Firebase Admin SDK with your service account JSON file
const serviceAccount = require('./sensorsprok-firebase-adminsdk-8lypo-862938d9d5.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://(default).firebaseio.com'
});

// Middleware setup (e.g., body parsing, CORS, etc.)
app.use(express.json());
// Add any other middleware here (e.g., CORS)

// Include your modular route files here
app.use('/api/customer-emotions', require('./routes/customerEmotionRoutes'));
// Add other routes as needed (e.g., authentication routes)

// Error handling middleware (e.g., errorHandlerMiddleware)
app.use(require('./middleware/errorHandlerMiddleware'));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
