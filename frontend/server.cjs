// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const Medicine = require('/frontend/models/Medicine.js')
// const Incident = require('/frontend/models/Incident.js')
// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// // --- DATABASE CONNECTION ---
// const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';

// mongoose.connect(dbURI)
//   .then(() => console.log(`✅ Connected to MongoDB Atlas, connection url:`+dbURI))
//   .catch((err) => console.error('❌ Could not connect to MongoDB Atlas', err));



// // --- API ROUTE ---
// app.post('/api/submit-form', async (req, res) => {
//   console.log('✅ Request received at /api/submit-form');
//   console.log('Request body:', req.body);

//   try {
//     const newIncident = new Incident(req.body);
//     await newIncident.save(); // 💾 Save to MongoDB
//     console.log('✅ Data saved to MongoDB');

//     res.status(201).json({ message: 'Submission successful!' });
//   } catch (error) {
//     console.error('❌ Error saving data:', error);
//     res.status(500).json({ message: 'Server error during submission.' });
//   }
// });

// // --- START SERVER ---
// app.listen(PORT, () => {
//   console.log(`🚀 Backend running on http://localhost:${PORT}`);
// });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const dosageLogRoutes = require("../frontend/routes/dosageLogRoutes.cjs")
const medicineRoutes = require('./routes/medicineRoutes.cjs');
const incidentRoutes = require('./routes/incidentRoutes.cjs');
const serviceAccount = require('./davangere-a4f63-firebase-adminsdk-fbsvc-471080c973.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
const dbURI = "mongodb+srv://ganeshnadkarni369:TGPHJJM3PEXMl15i@cluster0.3c6h4.mongodb.net/?appName=Cluster0"|| "mongodb://localhost:27017/"

mongoose.connect(dbURI)
  .then(() => console.log(`✅ Connected to MongoDB, connection url: ${dbURI}`))
  .catch((err) => console.error('❌ Could not connect to MongoDB', err));

// Import Routes

// Use Routes
app.use('/api/medicines', medicineRoutes);
app.use('/api', incidentRoutes); // This handles /api/submit-form
app.use('/api/dosage-logs', dosageLogRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🚀 SheCares API is running!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});