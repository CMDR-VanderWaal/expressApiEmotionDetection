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
    const customerCollection = await admin.firestore().collection('customer-satisfaction-data').get();
    
    const jsonData = [];

    // Iterate through the customer collection
    for (const customerDoc of customerCollection.docs) {
      const customerData = customerDoc.data();
      const customerId = customerDoc.id;

      // Create an object for this customer
      const customerObject = {
        customerId,
        ...customerData,
        datewise: [],
      };

      // Access the datewise subcollection for this customer
      const datewiseCollection = await admin
        .firestore()
        .collection('customer-satisfaction-data')
        .doc(customerId)
        .collection('datewise')
        .get();

      // Iterate through the datewise subcollection
      datewiseCollection.forEach((datewiseDoc) => {
        const datewiseData = datewiseDoc.data();
        const datewiseId = datewiseDoc.id;

        // Add datewise data to the customer object
        customerObject.datewise.push({
          datewiseId,
          ...datewiseData,
        });
      });

      // Add the customer object to the JSON array
      jsonData.push(customerObject);
    }

    res.status(200).json(jsonData);
  } catch (error) {
    console.error('Error fetching all customer data:', error);
    res.status(500).json({ error: 'Error fetching all customer data' });
  }
});

app.get('/api/customer-satisfaction-data/customer/:customerName', async (req, res) => {
  try {
    const customerName = req.params.customerName;

    // Query the Super Collection for the specific customer
    const querySnapshot = await admin
      .firestore()
      .collection('customer-satisfaction-data')
      .doc(`${customerName}_emotionData`) // Assuming the document name follows the pattern "CustomerName_emotionData"
      .collection('datewise')
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

    const datewiseCollection = admin.firestore().collectionGroup('datewise');
    
    const data = [];

    // Loop through the datewiseCollection and filter documents based on date names
    const querySnapshot = await datewiseCollection.get();
    querySnapshot.forEach((doc) => {
      const docDate = doc.id; // Get the date name from the document ID
      if (docDate >= startDate && docDate <= endDate) {
        data.push(doc.data());
      }
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