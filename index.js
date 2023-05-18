const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@believer.igrxpib.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const bannersCollection = client.db('Figurio').collection('banners')
    const galleriesCollection = client.db('Figurio').collection('gallery')

// get banners for homepage
    app.get('/banners', async(req, res) => {
      const cursor = bannersCollection.find()
      const result = await cursor.toArray()
      // console.log(result);
      res.send(result)
    })

    // get galleries
    app.get('/galleries',async(req, res) => {
      const cursor = galleriesCollection.find()
      const result = await cursor.toArray()
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







app.get("/", (req, res) => {
  res.send("Figurio is running");
});

app.listen(port, () => {
  console.log(`Figurio is listening on ${port}`);
});
