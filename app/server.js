const express = require('express')
const mongoose = require('mongoose');
const User = require('./models/User');
const app = express()
const fs = require('fs');
const path = require('path');
const bodyParser = require("body-parser");
const { exec } = require("child_process");

// Middleware
app.use(express.json());
app.use(express.static('static'))
const session = require('express-session');

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true with HTTPS
}));


// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Sample route


// Signup Route
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const exists = await User.findOne({ username });
        if (exists) return res.status(400).json({ message: 'User already exists' });

        const newUser = new User({ username, password });
        await newUser.save();
        res.status(200).json({ message: 'Signup successful' });
    } catch (err) {
        res.status(500).json({ message: 'Signup error' });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        req.session.username = username;
        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        res.status(500).json({ message: 'Login error' });
    }
});

app.post('/submit',async (req,res)=>{
    console.log(req.body)
    const {totalScore} = req.body;
    res.send('Form submitted')
    const username = req.session.username;
    try {
    const updatedUser = await User.findOneAndUpdate(
      { username },                          // Find by username
      { $set: { score: totalScore } },       // Update score
      { new: true }                          // Return updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log("Score updated for:", username);
  } catch (err) {
    console.error("Error updating score:", err);
    res.status(500).json({ message: 'Error updating score' });
  }

})

app.use(bodyParser.json({ limit: "50mb" })); // to handle large base64 images

app.post("/upload-heatmap", (req, res) => {
  const base64Data = req.body.image;
  if (!base64Data) return res.status(400).send("No image data received");

  const base64Image = base64Data.split(";base64,").pop();
  const filename = `heatmap.png`;
  const filePath = path.join(__dirname, 'static', filename);

  fs.writeFile(filePath, base64Image, { encoding: "base64" }, (err) => {
    if (err) {
      console.error("Error saving image:", err);
      return res.status(500).send("Failed to save image");
    }

    // 🔥 Run prediction
    exec(`"C:/Users/Harish Kumar/anaconda3/python.exe" predict_asd.py ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error("Prediction error:", error);
        return res.status(500).send("Model prediction failed");
      }

      const prediction = stdout.trim();
      const pred = req.session.prediction;
      res.json({prediction})
    });
  });
});

app.get('/testie',(req,res)=>{
    res.sendFile('D:/uni/sem6/Autism-spectrum-analyser/app/static/testie.html')

})

app.get("/get-prediction", (req, res) => {
  const pred = req.session.prediction;
  if (!pred) return res.status(404).json({ message: "Prediction not found" });

  res.json({ prediction: pred });
});



app.get('/get-score', async (req, res) => {
  const username = req.session.username;
  if (!username) return res.status(401).json({ message: 'Not logged in' });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ score: user.score });
  } catch (err) {
    console.error("Error fetching score:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(5000,()=>{
    console.log('server is running on port 5000')
})
