const express = require('express')
const app = express()

app.use(express.json());
app.use(express.static('static'))


app.post('/submit',(req,res)=>{
    console.log(req.body)
    res.send('Form submitted')
})


app.listen(5000,()=>{
    console.log('server is running on port 5000')
})

