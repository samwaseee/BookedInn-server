const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://bookedinn-a11.web.app',
        'https://bookedinn-a11.firebaseapp.com'
    ],
    credentials: true
})
);
app.use(express.json());
app.use(cookieParser());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ti5xab5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


//Custom middlewares
const verifyToken = async (req, res, next) => {
    const token = req.cookies?.token;
    // console.log('value of token in middleware',token)
    if (!token) {
        return res.staus(401).send({ message: 'uauthorized access' })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.log(err)
            return res.status(401).send({ message: "unauthorized access" })
        }

        console.log('value in the token', decoded)
        req.user = decoded;
        next()
    })

}

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};

async function run() {
    try {
        //await client.connect();

        const roomCollection = client.db('BookedInn').collection('rooms');
        const bookingCollection = client.db('BookedInn').collection('bookings');
        const reviewCollection = client.db('BookedInn').collection('reviews');

        //Auth related API

        app.post('/jwt', async (req, res) => {
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res
                .cookie('token', token, cookieOptions)
                .send({ success: true });
        })

        app.post('/logout', async (req, res) => {
            const user = req.body;
            console.log('loggingout', user);
            res.clearCookie('token', { ...cookieOptions, maxAge: 0 }).send({ success: true })
        })

        //rooms related API
        app.get('/rooms', async (req, res) => {
            const { minPrice, maxPrice } = req.query;
            let cursor;

            if (minPrice && maxPrice) {
                cursor = roomCollection.find({
                    pricePerNight: {
                        $gte: parseInt(minPrice), $lt: parseInt(maxPrice)
                    }
                });
            } else {
                cursor = roomCollection.find();
            }

            const result = await cursor.toArray();
            res.send(result);
        })
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

        //review related API

        app.get('/Review', async (req, res) => {
            const cursor = reviewCollection.find().sort({ time: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });
        app.get('/Review/:roomId', async (req, res) => {
            const roomId = req.params.roomId;
            const cursor = reviewCollection.find({ roomId: roomId }).sort({ time: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });
        app.post('/Review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });

        //Bookings related API

        app.get('/bookings', verifyToken, async (req, res) => {
            console.log(req.query.email);
            // console.log('token',req.cookies.token)
            console.log('user in the valid token', req.user)

            if (req.query.email !== req.user.email) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })
        app.get('/bookings/:id',verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.findOne(query);
            res.send(result);
        })


        app.post('/bookings',verifyToken, async (req, res) => {
            const booking = req.body;
            //console.log(booking);
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })

        app.patch('/bookings/:id',verifyToken, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedBooking = req.body;
            const { checkIn } = updatedBooking;
            const updateDoc = {
                $set: {
                    checkIn
                }
            };
            const result = await bookingCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.delete('/bookings/:id',verifyToken, async (req, res) => {
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