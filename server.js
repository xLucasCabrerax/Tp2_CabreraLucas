const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// URL de conexión a MongoDB local
const mongoUrl = 'mongodb://localhost:27017/Clima';

mongoose.connect(mongoUrl)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

const citySchema = new mongoose.Schema({
    name: String,
    date: { type: Date, default: Date.now }
});

const City = mongoose.model('City', citySchema);

app.post('/api/cities', async (req, res) => {
    const cityName = req.body.name;
    const newCity = new City({ name: cityName });
    try {
        console.log(`Saving city: ${cityName}`);
        await newCity.save();
        res.status(201).send(newCity);
    } catch (error) {
        console.error('Error saving city:', error);
        res.status(400).send(error);
    }
});

app.get('/api/cities', async (req, res) => {
    try {
        const cities = await City.find().sort({ date: -1 });
        res.status(200).send(cities);
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).send(error);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});