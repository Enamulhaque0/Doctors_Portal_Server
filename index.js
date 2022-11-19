const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000
const app = express()

// middleware

app.use(cors())
app.use(express.json())






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vbwpfni.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req,res,next){
    
    const authHeader = req.headers.authorization
    if(!authHeader){
        return res.status(401).send("unauthorized access")
    }

    const token = authHeader.split(" ")[1]
    
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message: "forbidden access"})
        }
        req.decoded= decoded
        next()
    })



}


const dbConnect = async()=>{

    try {




const appointmentOptions = client.db("DoctorsPortal").collection("appointmentOptions")
const bookings = client.db("DoctorsPortal").collection("bookings")
const usersCollection = client.db('DoctorsPortal').collection('users');


app.get("/appointmentOptions" , async(req,res)=>{
    const date = req.query.date 
    console.log(date)

const query ={}
const options = await appointmentOptions.find(query).toArray()
const bookingQuery = {appointmentDate: date}
const alreadyBooked= await bookings.find(bookingQuery).toArray()
options.forEach(option => {
    const optionBooked = alreadyBooked.filter(book => book.treatment === option.name)
const bookedSlots =optionBooked.map(book=>book.slot)
const remainingSlots = option.slots.filter(slot => !bookedSlots.includes(slot))
option.slots = remainingSlots
});
res.send(options)


})

app.get('/bookings', verifyJWT,  async (req, res) => {
    const email = req.query.email;
    
    const decodedEmail = req.decoded.email
    
    if(email !== decodedEmail){
        return res.status(403).send({message: "forbidden access"})
    }
    const query = { email: email };
    const allBooking = await bookings.find(query).toArray();
   
    res.send(allBooking);
})

app.post("/bookings", async(req,res)=>{

const booking=req.body
const query={
    appointmentDate: booking.appointmentDate,
    email: booking.email,
    treatment: booking.treatment
}

const alreadyBooked = await bookings.find(query).toArray()
if(alreadyBooked.length){

    const message = `You already have a booking on ${booking.appointmentDate}`
return res.send({acknowledged: false , message})
}
const result =await bookings.insertOne(booking)
res.send(result)

})



app.get("/jwt", async (req,res)=>{
const email= req.query.email
const query={email:email}
const user = await usersCollection.findOne(query)

if(user){
const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: "1d"})
return res.send({accessToken: token})
}

res.status(403).send({accessToken: ""})


})




app.post('/users', async (req, res) => {
    const user = req.body;
    console.log(user);
    const result = await usersCollection.insertOne(user);
    res.send(result);
});

        
    } 
    
    
    
    finally {
        
    }



}

dbConnect().catch(console.log);



















app.get("/", async(req,res)=>{

    res.send("doctors portal running..")
})

app.listen(port, ()=>console.log(`Doctors Portal Running On ${port}`))