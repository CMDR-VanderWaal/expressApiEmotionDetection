const admin = require('firebase-admin');

// Controller to get all customer emotions
exports.getAllCustomerEmotions = async (req, res) => {
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
};

// Controller to get a customer emotion by ID
exports.getCustomerEmotionById = async (req, res) => {
  try {
    const documentId = req.params.documentId;
    const docRef = admin.firestore().collection('customer-satisfaction-data').doc(documentId);

    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const data = doc.data();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Error fetching document' });
  }
};
