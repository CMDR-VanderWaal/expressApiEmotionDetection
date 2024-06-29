const admin = require('../middlewares/firebaseMiddleware');

const emotionWeights = {
  "Happy": 1.0,
  "Sad": 0.5,
  "Neutral": 0.7,
  "Angry": 0.2,
  "Surprised": 0.9,
  "Fearful": 0.3,
  "Disgusted": 0.1,
};

const getAllCustomersData = async (req, res) => {
  const { storeId } = req.params;

  try {
    const storeDoc = await admin.firestore().collection('customer-satisfaction-data').doc(storeId).get();
    if (!storeDoc.exists) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const customerCollection = await admin.firestore().collection('customer-satisfaction-data').doc(storeId).collection('emotion_db').get();

    const jsonData = [];
    const emotionCounts = {};
    const weightedEmotionCounts = {};
    let emotions = [];
    let total = 0;
    let weightedTotal = 0;
    const emotionPercents = {};
    const weightedEmotionPercents = {};

    for (const customerDoc of customerCollection.docs) {
      const customerData = customerDoc.data();
      const customerId = customerDoc.id;

      const customerObject = {
        customerId,
        ...customerData,
        datewise: [],
      };

      const datewiseCollection = await admin
        .firestore()
        .collection('customer-satisfaction-data')
        .doc(storeId)
        .collection('emotion_db')
        .doc(customerId)
        .collection('datewise')
        .get();
      
      datewiseCollection.forEach((datewiseDoc) => {
        const datewiseData = datewiseDoc.data();
        const datewiseId = datewiseDoc.id;

        customerObject.datewise.push({
          datewiseId,
          ...datewiseData,
        });

        if ('emotion-data' in datewiseData) {
          emotions.push(...datewiseData['emotion-data']);
        }
      });

      emotions.forEach((emotion) => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        total += 1;
        const weight = emotionWeights[emotion] || 1.0;
        weightedEmotionCounts[emotion] = (weightedEmotionCounts[emotion] || 0) + weight;
        weightedTotal += weight;
      });

      emotions = [];
      jsonData.push(customerObject);
    }

    const keys = Object.keys(emotionCounts);
    keys.forEach((emotion) => {
      emotionPercents[emotion] = (emotionCounts[emotion] * 100) / total;
      weightedEmotionPercents[emotion] = (weightedEmotionCounts[emotion] * 100) / weightedTotal;
    });

    res.status(200).json({ jsonData, emotionCounts, emotionPercents, weightedEmotionPercents });
  } catch (error) {
    console.error('Error fetching all customer data:', error);
    res.status(500).json({ error: 'Error fetching all customer data' });
  }
};


const getCustomerDataByName = async (req, res) => {
  const { storeId, customerName } = req.params;
  
  try {
 
    const querySnapshot = await admin
      .firestore()
      .collection('customer-satisfaction-data')
      .doc(storeId)
      .collection('emotion_db')
      .doc(`${customerName}_emotionData`)
      .collection('datewise')
      .get();

    console.log('Query Snapshot:', querySnapshot);

    if (querySnapshot.empty) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const data = [];
    querySnapshot.forEach((doc) => {
      const datewiseData = doc.data();
      const datewiseId = doc.id;
      
      const emotionCounts = {};
      const weightedEmotionCounts = {};
      let total = 0;
      let weightedTotal = 0;

      if ('emotion-data' in datewiseData) {
        datewiseData['emotion-data'].forEach((emotion) => {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
          total += 1;
          const weight = emotionWeights[emotion] || 1.0;
          weightedEmotionCounts[emotion] = (weightedEmotionCounts[emotion] || 0) + weight;
          weightedTotal += weight;
        });
      }

      const weightedEmotionPercents = {};
      const keys = Object.keys(emotionCounts);
      keys.forEach((emotion) => {
        weightedEmotionPercents[emotion] = (weightedEmotionCounts[emotion] * 100) / weightedTotal;
      });

      data.push({
        date: datewiseId,  // Assuming datewiseId is in "YYYY-MM-DD" format
        weightedEmotionPercents: weightedEmotionPercents,
      });
    });

    const emotionCounts = {};
    const weightedEmotionCounts = {};
    let emotions = [];
    let total = 0;
    let weightedTotal = 0;

    querySnapshot.forEach((doc) => {
      const datewiseData = doc.data();

      if ('emotion-data' in datewiseData) {
        emotions.push(...datewiseData['emotion-data']);
      
      }
    });

    emotions.forEach((emotion) => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      total += 1;
      const weight = emotionWeights[emotion] || 1.0;
      weightedEmotionCounts[emotion] = (weightedEmotionCounts[emotion] || 0) + weight;
      weightedTotal += weight;
    });

    const emotionPercents = {};
    const weightedEmotionPercents = {};
    const keys = Object.keys(emotionCounts);
    keys.forEach((emotion) => {
      emotionPercents[emotion] = (emotionCounts[emotion] * 100) / total;
      weightedEmotionPercents[emotion] = (weightedEmotionCounts[emotion] * 100) / weightedTotal;
    });

    res.status(200).json({ data, emotionCounts, emotionPercents, weightedEmotionPercents });
  } catch (error) {
    console.error('Error fetching customer data:', error);
    res.status(500).json({ error: `Error loading customer data: ${error.message}` });
  }
};


const getAllCustomers = async (req, res) => {
  const { storeId } = req.params;

  try {
    const customerCollection = await admin.firestore().collection('customer-satisfaction-data').doc(storeId).collection('emotion_db').get();
    const customers = [];

    customerCollection.forEach((doc) => {
      const customerData = doc.data();
      const customerName = customerData['customer-name'];
      const customerId = customerData['customer-id'];
      customers.push({ customerName, customerId });
    });

    res.status(200).json(customers);
  } catch (error) {
    console.error('Error fetching customer list:', error);
    res.status(500).json({ error: 'Error fetching customer list' });
  }
};

/**
 * Deletes the specified customer's data.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const deleteCustomerData = async (req, res) => {
  const { storeId, customerName } = req.params;

  try {
    // Get a reference to the customer's document
    const customerDocRef = admin.firestore().collection('customer-satisfaction-data').doc(storeId).collection('emotion_db').doc(`${customerName}_emotionData`);

    // Check if the document exists
    const docSnapshot = await customerDocRef.get();
    if (!docSnapshot.exists) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Delete all subcollection documents (datewise)
    const datewiseCollectionRef = customerDocRef.collection('datewise');
    const datewiseDocs = await datewiseCollectionRef.get();
    const batch = admin.firestore().batch();

    datewiseDocs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete the customer document
    batch.delete(customerDocRef);

    // Commit the batch
    await batch.commit();

    res.status(200).json({ message: 'Customer data deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer data:', error);
    res.status(500).json({ error: 'Error deleting customer data' });
  }
};

module.exports = {
  getAllCustomersData,
  getCustomerDataByName,
  getAllCustomers,
  deleteCustomerData, 
};
