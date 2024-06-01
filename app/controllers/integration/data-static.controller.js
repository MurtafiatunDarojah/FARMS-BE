const fs = require('fs').promises;

// Path ke file JSON
const airlinesFilePath = './app/static-data/airlines.json';
const airportsFilePath = './app/static-data/airports.json';
const cityFilePath = './app/static-data/city.json';

exports.getAirlines = async (req, res) => {
    try {
        const airlinesData = await fs.readFile(airlinesFilePath, 'utf-8');
        const airlines = JSON.parse(airlinesData);

        const response = {
            code: 200,
            status: 'OK',
            data: airlines,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).send(error.toString());
    }
};

exports.getAirports = async (req, res) => {
    try {
        const airportsData = await fs.readFile(airportsFilePath, 'utf-8');
        const airports = JSON.parse(airportsData);

        const response = {
            code: 200,
            status: 'OK',
            data: airports,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).send(error.toString());
    }
};

exports.getCities = async (req, res) => {
    try {
        const cityData = await fs.readFile(cityFilePath, 'utf-8');
        const city = JSON.parse(cityData);

        const response = {
            code: 200,
            status: 'OK',
            data: city,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).send(error.toString());
    }
};




