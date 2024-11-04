const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb'); // Import MongoClient directly

const ConnectionDetail = require('./modals/connectionDetail');

const app = express();
const port = 8000;

// Replace this with your MongoDB connection string
const uri = 'mongodb://localhost:27017';

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(cors());

// Connect to MongoDB using Mongoose
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

//
app.post('/store-additional-info', async (req, res) => {
    try {
        const { deviceName, casenumber, additionalInfo, investigatorId } = req.body;

        // Validate the incoming data
        if (!deviceName || !casenumber || !investigatorId) {
            return res.status(400).send('Device name, Case number, and Investigator ID are required');
        }

        // Check if a record with the same case number already exists
        const existingConnectionDetail = await ConnectionDetail.findOne({ casenumber });

        if (existingConnectionDetail) {
            return res.status(409).send('A record with this Case No# already exists');
        }

        // Create and save the new ConnectionDetail document
        const newConnectionDetail = new ConnectionDetail({
            deviceName,
            casenumber,
            additionalInfo,
            investigatorId
        });

        await newConnectionDetail.save();

        res.status(200).send('Additional information stored successfully');
    } catch (err) {
        console.error('Error storing additional information:', err);
        res.status(500).send('Error storing additional information');
    }
});

// GET API to retrieve all connection details
app.get('/connection-details', async (req, res) => {
    try {
        const connectionDetails = await ConnectionDetail.find({});
        res.status(200).json(connectionDetails);
    } catch (err) {
        console.error('Error retrieving connection details:', err);
        res.status(500).send('Error retrieving connection details');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
