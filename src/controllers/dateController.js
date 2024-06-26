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
    const weightedEmotionPercents = {};

    uniqueDates.forEach((date) => {
      emotionPercents[date] = {};
      weightedEmotionPercents[date] = {};
      const keys = Object.keys(datewiseEmotionCounts[date]);
      keys.forEach((emotion) => {
        const percent = (datewiseEmotionCounts[date][emotion] * 100) / emotions.length;
        emotionPercents[date][emotion] = percent;
        weightedEmotionPercents[date][emotion] = percent * (emotionWeights[emotion] || 1);
      });
    });

    const overallEmotionPercents = {};
    const overallWeightedEmotionPercents = {};
    const keys = Object.keys(totalEmotionCounts);
    keys.forEach((emotion) => {
      const percent = (totalEmotionCounts[emotion] * 100) / emotions.length;
      overallEmotionPercents[emotion] = percent;
      overallWeightedEmotionPercents[emotion] = percent * (emotionWeights[emotion] || 1);
    });

    res.status(200).json({
      data,
      datewiseEmotionCounts,
      emotionPercents,
      weightedEmotionPercents,
      overallEmotionPercents,
      overallWeightedEmotionPercents,
    });
  } catch (error) {
    console.error('Error fetching emotion data by date range:', error);
    res.status(500).json({ error: 'Error fetching emotion data by date range' });
  }
};

module.exports = {
  getDateRangeData,
};
