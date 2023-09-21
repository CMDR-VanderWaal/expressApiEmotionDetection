const express = require('express');
const admin = require('firebase-admin');

const functions =require("firebase-functions")
const app = express();
const port = 3001; // You can change this to your preferred port

// Initialize Firebase Admin SDK with your service account JSON file
const serviceAccount = require('./sensorsprok-firebase-adminsdk-8lypo-862938d9d5.json'); // Replace with your actual file path
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://(default).firebaseio.com' // Replace with your Firestore database URL
});

// Your API routes will go here
app.use(express.json())
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



app.get('/api/customer-satisfaction-data', async (req, res) => {
    try {
      const snapshot = await admin.firestore().collection('customer-satisfaction-data').get();
      const items = [];
      snapshot.forEach((doc) => {
        items.push(doc.data());
      });
      res.status(200).json(items);
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).json({ error: 'Error fetching items' });
    }
  });
  
exports.api = functions.https.onRequest(app)