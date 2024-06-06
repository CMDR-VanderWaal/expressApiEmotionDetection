const admin = require('../middlewares/firebaseMiddleware');

const getDateRangeData = async (req, res) => {
  try {
    const startDate = req.params.startDate;
    const endDate = req.params.endDate;
    const datewiseCollection = admin.firestore().collectionGroup('datewise');
    const data = [];
    const datewiseEmotionCounts = {}; 
    const emotions = [];
    const totalEmotionCounts = {};

    const querySnapshot = await datewiseCollection.get();
    querySnapshot.forEach((doc) => {
      const datewiseData = doc.data();
      const docDate = doc.id;

      if (docDate >= startDate && docDate <= endDate && 'emotion-data' in datewiseData) {
        data.push(datewiseData);

        if (!datewiseEmotionCounts[docDate]) {
          datewiseEmotionCounts[docDate] = {};
        }

        datewiseData['emotion-data'].forEach((emotion) => {
          emotions.push(emotion);
          datewiseEmotionCounts[docDate][emotion] = (datewiseEmotionCounts[docDate][emotion] || 0) + 1;
          totalEmotionCounts[emotion] = (totalEmotionCounts[emotion] || 0) + 1;
        });
      }
    });

    const uniqueDates = Object.keys(datewiseEmotionCounts);

    const emotionPercents = {};

    uniqueDates.forEach((date) => {
      emotionPercents[date] = {};
      const keys = Object.keys(datewiseEmotionCounts[date]);
      keys.forEach((emotion) => {
        emotionPercents[date][emotion] = (datewiseEmotionCounts[date][emotion] * 100) / emotions.length;
      });
    });

    const overallEmotionPercents = {};
    const keys = Object.keys(totalEmotionCounts);
    keys.forEach((emotion) => {
      overallEmotionPercents[emotion] = (totalEmotionCounts[emotion] * 100) / emotions.length;
    });

    res.status(200).json({ data, datewiseEmotionCounts, emotionPercents, overallEmotionPercents });
  } catch (error) {
    console.error('Error fetching emotion data by date range:', error);
    res.status(500).json({ error: 'Error fetching emotion data by date range' });
  }
};

module.exports = {
  getDateRangeData,
};