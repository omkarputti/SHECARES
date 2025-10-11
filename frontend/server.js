import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 MongoDB connection
mongoose.connect("mongodb+srv://omkarputti14_db_user:SrNWlwf8PoWZPGGz@vespera.xzrera7.mongodb.net/?retryWrites=true&w=majority&appName=vespera", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.log("❌ MongoDB Error:", err));

// 🧾 Report Schema
const reportSchema = new mongoose.Schema({
  incidentType: String,
  date: String,
  time: String,
  location: String,
  description: String,
  isAnonymous: Boolean,
  name: String,
  email: String,
  createdAt: { type: Date, default: Date.now }
});

const Report = mongoose.model("Report", reportSchema);

// 📨 POST route to save reports
app.post("/report", async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();
    res.status(200).json({ message: "Report saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving report" });
  }
});

// 🌐 Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
