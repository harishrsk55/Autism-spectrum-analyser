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

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Sample route
app.post('/submit',(req,res)=>{
    console.log(req.body)
    res.send('Form submitted')
})

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

        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        res.status(500).json({ message: 'Login error' });
    }
});

app.use(bodyParser.json({ limit: "10mb" })); // to handle large base64 images

app.post("/upload-heatmap", (req, res) => {
  const base64Data = req.body.image;
  if (!base64Data) return res.status(400).send("No image data received");

  const base64Image = base64Data.split(";base64,").pop();
  const filename = `heatmap_${Date.now()}.png`;
  const filePath = path.join(__dirname, filename);

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
      console.log(`✅ Prediction result: ${prediction}`);
      res.send(`Prediction: ${prediction}`);
    });
  });
});

app.get('/testie',(req,res)=>{
    res.sendFile('D:/uni/sem6/Autism-spectrum-analyser/app/static/testie.html')
})


app.listen(5000,()=>{
    console.log('server is running on port 5000')
})
