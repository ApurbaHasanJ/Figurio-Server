const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const bannersCollection = client.db("Figurio").collection("banners");
    const galleriesCollection = client.db("Figurio").collection("gallery");
    const shopByCategoryCollection = client
      .db("Figurio")
      .collection("shopByCategory");
    const allToysCollection = client.db("Figurio").collection("allToys");


    // creating index on fields
    const indexKeys = {toyName: 1, toySubCategory: 1,}
    const indexOptions = {name: 'toysSearch',}

    const result = await allToysCollection.createIndex(indexKeys, indexOptions)

    app.get('/toysSearch/:text', async (req, res) => {
      const searchText = req.params.text;
      const result = await allToysCollection.find({
        $or:[
          {toyName: {$regex: searchText, $options: 'i'}},
          {toySubCategory: {$regex: searchText, $options: 'i'}}
        ]
      }).toArray()
      res.send(result)

    })



    // get banners for homepage
    app.get("/banners", async (req, res) => {
      const cursor = bannersCollection.find();
      const result = await cursor.toArray();
      // console.log(result);
      res.send(result);
    });

    // get galleries
    app.get("/galleries", async (req, res) => {
      const cursor = galleriesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // get short by categories data
    app.get("/categories", async (req, res) => {
      const cursor = shopByCategoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // get data for single category
    app.get("/categories/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await shopByCategoryCollection.findOne(query);
      res.send(result);
    });

    // get specific toy details
    app.get("/categories/:categoryId/toys", async (req, res) => {
      const categoryId = req.params.categoryId;

      try {
        const query = { _id: new ObjectId(categoryId) };
        const category = await shopByCategoryCollection.findOne(query);

        if (category) {
          res.send(category.toys);
        } else {
          res.status(404).send({ message: "Category not found" });
        }
      } catch (error) {
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // url for specific toy
    app.get("/categories/:categoryId/toys/:toyId", async (req, res) => {
      const categoryId = req.params.categoryId;
      const toyId = req.params.toyId;

      try {
        const query = { _id: new ObjectId(categoryId) };
        const category = await shopByCategoryCollection.findOne(query);

        if (category) {
          const toy = category.toys.find((toy) => toy._id === toyId);

          if (toy) {
            res.send(toy);
          } else {
            res.status(404).send({ message: "Toy not found" });
          }
        } else {
          res.status(404).send({ message: "Category not found" });
        }
      } catch (error) {
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // insert toy
    app.post("/all-toys", async (req, res) => {
      const newToy = req.body;
      const result = await allToysCollection.insertOne(newToy);
      res.send(result);
    });

    // get all toy
    app.get("/all-Toys", async (req, res) => {
      const cursor = allToysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
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
