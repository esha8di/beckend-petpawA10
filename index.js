const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");

// require('dotenv');
require("dotenv").config();

const port = 3000;

const app = express();
app.use(cors());
app.use(express.json());

// iLlwm2ZncU7c2Ips

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e0fb9mn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    // creating database

    const database = client.db("petServices");

    const petServices = database.collection("createlist");

    const orderCollections = database.collection("orders");

    app.post("/createlist", async (req, res) => {
      const data = req.body;
      console.log("data", data);

      // add real time
      const date = new Date();
      data.createdAt = date;

      // sending data to fontend
      const result = await petServices.insertOne(data);
      res.send(result);
    });

    //createlist for home
    app.post("/createlisthome", async (req, res) => {
      const data = req.body;
      console.log("data", data);

      // add real time
      const date = new Date();
      data.createdAt = date;

      // sending data to fontend
      const result = await petServices.insertOne(data);
      res.send(result);
    });

    app.post("/orders", async (req, res) => {
      const data = req.body;
      console.log(data);

      data.createdAt = new Date();

      const result = await orderCollections.insertOne(data);
      res.send(result);
    });
    // get the orders from database

    //
    //new order
    app.get("/orders", async (req, res) => {
      const { email } = req.query;

      let query = {};
      if (email) {
        query.buyeremail = email;
      }

      try {
        const result = await orderCollections.find(query).toArray();
        res.status(200).send(result);
      } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Failed to fetch orders" });
      }
    });
    //get the data from database

    app.get("/createlist", async (req, res) => {
      try {
        const { category } = req.query;

        let query = {};
        if (category && category.trim() !== "") {
          query.category = category;
        }

        const result = await petServices.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    ///for limit
    app.get("/createlisthome", async (req, res) => {
      try {
        const { category, limit } = req.query;

        let query = {};
        if (category && category.trim() !== "") {
          query.category = { $regex: new RegExp(`^${category}$`, "i") };
        }

        const limitNumber =
          limit && !isNaN(parseInt(limit)) ? parseInt(limit) : 6;

        const listingsCursor = petServices
          .find(query)
          .sort({ createdAt: -1 })
          .limit(limitNumber);

        const listings = await listingsCursor.toArray();

        res.status(200).json(listings);
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    });

    // get the data match with id

    app.get("/createlist/:id", async (req, res) => {
      const id = req.params;
      console.log(id);

      const query = { _id: new ObjectId(id) };
      const result = await petServices.findOne(query);
      res.send(result);
    });

    // get the email of the logged in user

    app.get("/myservices", async (req, res) => {
      const { email } = req.query;
      console.log("email", email);

      const query = { email: email };
      const result = await petServices.find(query).toArray();
      res.send(result);
    });

    ///update the profile
    app.put("/edit/:id", async (req, res) => {
      const data = req.body;
      console.log("data", data);
      const id = req.params;

      const query = {
        _id: new ObjectId(id),
      };

      const updateservices = {
        $set: data,
      };

      const result = await petServices.updateOne(query, updateservices);
      res.send(result);
    });

    //delete

    app.delete("/delete/:id", async (req, res) => {
      const id = req.params;
      const query = {
        _id: new ObjectId(id),
      };

      const result = await petServices.deleteOne(query);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
  res.send("hello,devleoper");
});

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
