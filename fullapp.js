const express = require('express');
const admin = require('firebase-admin');

const functions =require("firebase-functions")
const app = express();
const port = 3002; // You can change this to your preferred port

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


app.get('/api/customer-satisfaction-data/', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collectionGroup('datewise').get();
    const data = [];

    snapshot.forEach((doc) => {
      data.push(doc.data());
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching emotion data for all customers:', error);
    res.status(500).json({ error: 'Error fetching emotion data for all customers' });
  }
  });

 // Modify your route to accept a document ID as a parameter
 app.get('/api/customer-satisfaction-data/customer/:customerName', async (req, res) => {
  try {
    const customerName = req.params.customerName;
    const querySnapshot = await admin
      .firestore()
      .collectionGroup('datewise')
      .where('customer-name', '==', customerName)
      .get();

    if (querySnapshot.empty) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const data = [];

    querySnapshot.forEach((doc) => {
      data.push(doc.data());
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching customer data:', error);
    res.status(500).json({ error: 'Error loading customer data' });
  }
});

app.get('/api/customer-satisfaction-data/date/:startDate/:endDate', async (req, res) => {
  try {
    const startDate = req.params.startDate; // Start date in YYYY-MM-DD format
    const endDate = req.params.endDate; // End date in YYYY-MM-DD format

    const querySnapshot = await admin
      .firestore()
      .collectionGroup('datewise')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .get();

    const data = [];

    querySnapshot.forEach((doc) => {
      data.push(doc.data());
    });

    if (data.length === 0) {
      return res.status(404).json({ error: 'No data found within the specified date range' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching emotion data by date range:', error);
    res.status(500).json({ error: 'Error fetching emotion data by date range' });
  }
});
  


exports.api = functions.https.onRequest(app)