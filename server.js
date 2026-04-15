const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.post('/saveTaps', async (req, res) => {
  try {
    const sessionId = req.body.id;
    const device = req.body.var;
    const taps = JSON.parse(req.body.taps);

    for (let tap of taps) {
      const t = JSON.parse(tap);

      await db.collection('tap_logs').add({
        sessionId,
        device,
        tapSequence: t.tapSequenceNumber,
        start: t.startTimestamp,
        end: t.endTimestamp,
        duration: t.endTimestamp - t.startTimestamp,
        interface: t.interface,
        interfaceSequence: t.interfaceSequence
      });
    }

    res.send("Data saved successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving data");
  }
});

app.listen(3000, () => console.log("Server running"));