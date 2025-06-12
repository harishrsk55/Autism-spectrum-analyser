const express = require('express')
const mongoose = require('mongoose');
const User = require('./models/User');
const app = express()

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

app.listen(5000,()=>{
    console.log('server is running on port 5000')
})
