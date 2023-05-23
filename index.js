const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dcrmhcp.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // await client.connect();
        const carsCollection = client.db("CarsDB").collection("car");
        // const selfCollection = client.db("CarsDB").collection("self");

        app.get('/cars', async (req, res) => {
            const cursor = carsCollection.find().limit(20);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/cars/:email', async (req, res) => {
            const email = req.params.email;
            const sort = req.query.sort;
            const query = { email: email }
            console.log("email", email, sort);
            const options = {
                sort: {
                    price: sort === 'asc' ? 1 : -1
                },
                projection: {
                    category: 1,
                    email: 1,
                    name: 1,
                    photo: 1,
                    // price: 1,
                    price: {
                        $toDouble: "$price"
                    },
                    quantity: 1,
                    rating: 1,
                    toyname: 1
                }
            }
            const result = await carsCollection.find(query, options).toArray();
            console.log(result);
            res.send(result);
        })


        app.post('/cars', async (req, res) => {
            const cars = req.body;
            cars.price = parseFloat(cars.price);
            console.log(cars);
            const result = await carsCollection.insertOne(cars)
            res.send(result)
        })

        app.put('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateCar = req.body;

            const car = {
                $set: {
                    quantity: updateCar.quantity,
                    price: parseFloat(updateCar.price),
                    details: updateCar.details
                }
            }
            const result = await carsCollection.updateOne(filter, car, options);
            res.send(result)
        })

        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await carsCollection.deleteOne(query)
            res.send(result)
        })
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Toy Market server is running")
})

app.listen(port, () => {
    console.log(`Example app is running on port ${port}`);
})