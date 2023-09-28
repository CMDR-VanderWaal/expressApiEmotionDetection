const admin = require('firebase-admin');



// Controller to get emotion data for all customers
exports.getAllCustomerEmotions = async (req, res) => {
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
};

// Controller to get emotion data for a specific customer
exports.getCustomerEmotionByName = async (req, res) => {
  try {
    const customerName = req.params.customerName;
    const querySnapshot = await admin
      .firestore()
      .collectionGroup('datewise')
      .where('customer-name', '==', customerName)
      .get();

    const data = [];

    querySnapshot.forEach((doc) => {
      data.push(doc.data());
    });

    if (data.length === 0) {
      return res.status(404).json({ error: 'No data found for the specified customer' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching emotion data for a specific customer:', error);
    res.status(500).json({ error: 'Error fetching emotion data for a specific customer' });
  }
};

// Controller to get emotion data for customers within a given date range
exports.getCustomerEmotionByDateRange = async (req, res) => {
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
};


// // Controller to get all customer emotions
// exports.getAllCustomerEmotions = async (req, res) => {
//   try {
//     const snapshot = await admin.firestore().collection('customer-satisfaction-data').get();
//     const items = [];
//     snapshot.forEach((doc) => {
//       items.push(doc.data());
//     });
//     res.status(200).json(items);
//   } catch (error) {
//     console.error('Error fetching items:', error);
//     res.status(500).json({ error: 'Error fetching items' });
//   }
// };

// // Controller to get a customer emotion by ID
// exports.getCustomerEmotionById = async (req, res) => {
//   try {
//     const documentId = req.params.documentId;
//     const docRef = admin.firestore().collection('customer-satisfaction-data').doc(documentId);

//     const doc = await docRef.get();
//     if (!doc.exists) {
//       return res.status(404).json({ error: 'Document not found' });
//     }

//     const data = doc.data();
//     res.status(200).json(data);
//   } catch (error) {
//     console.error('Error fetching document:', error);
//     res.status(500).json({ error: 'Error fetching document' });
//   }
// };
