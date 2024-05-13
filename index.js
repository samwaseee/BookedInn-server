const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ti5xab5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        //await client.connect();

        const roomCollection = client.db('BookedInn').collection('rooms');
        const bookingCollection = client.db('BookedInn').collection('bookings');

        //Auth related API

        app.post('/jwt',async(req,res)=>{
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET , {expiresIn: '1h'})
            res.send(token);
        })

        //rooms related API
        app.get('/rooms', async (req, res) => {
            const cursor = roomCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/roomsReview', async (req, res) => {
            const cursor = roomCollection.find({}, { projection: { _id: 1, reviews: 1 } });
            const result = await cursor.toArray();
            res.send(result);
        });
        app.get('/rooms/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await roomCollection.findOne(query);
            res.send(result);
        })
        app.post('/rooms/:id', async (req, res) => {
            const { id } = req.params;
            const { email, name, time, rating, review } = req.body;
            const result = await roomCollection.updateOne(
                { _id: new ObjectId(id) },
                { $push: { reviews: { email, name, time, rating, review } } }
            );
            res.send(result)
        });
        app.patch('/rooms/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            console.log(req.body)
            const { availability } = req.body;
            const updateDoc = {
                $set: {
                    availability
                }
            };
            const result = await roomCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        //Bookings

        app.get('/bookings', async (req, res) => {
            // console.log(req.query.email);
            //console.log('token',req.cookies.token)
            // console.log('user in the valid token', req.user)

            // if (req.query.email != req.user.email) {
            //     return res.status(403).send({ message: 'forbidden access' })
            // }
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })
        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.findOne(query);
            res.send(result);
        })


        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            //console.log(booking);
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })

        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedBooking = req.body;
            const { checkIn, checkOut } = updatedBooking;
            const updateDoc = {
                $set: {
                    checkIn,
                    checkOut
                }
            };
            const result = await bookingCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
        })




        // Send a ping to confirm a successful connection
        //await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('BookInn server running')
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})