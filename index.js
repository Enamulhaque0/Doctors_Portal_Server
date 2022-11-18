const express = require('express')
const cors = require('cors')
require('dotenv').config();

const port = process.env.PORT || 5000
const app = express()

// middleware

app.use(cors())
app.use(express.json())


app.get("/", async(req,res)=>{

    res.send("doctors portal running..")
})

app.listen(port, ()=>console.log(`Doctors Portal Running On ${port}`))