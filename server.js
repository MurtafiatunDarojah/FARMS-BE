// Import libraries and dependencies
const fileupload = require("express-fileupload");
const rateLimit = require("express-rate-limit");
const schedule = require('node-schedule');
const mongoose = require("mongoose");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const { PrismaClient } = require('@prisma/client');

// Import configuration and scheduler
const SCHEDULER = require("./app/scheduler/reminder_approval");
const DBCONFIG = require('./app/config/db.config');

// Create an Express application
const app = express();

// Define rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 250, // Limit each IP to 250 requests per 15 minutes
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

// Use middleware
app.use(limiter);
app.use(helmet());
app.use(fileupload());
app.disable('x-powered-by');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const corsOptions = {
    origin: [
        "http://localhost:3000",
        "https://farms.brmapps.com",
        "https://farms-admin.brmapps.com",
        "https://farms-staging.brmapps.com",
        "https://farms-admin-staging.brmapps.com",
        "https://hias.citrapalu.net",
        "https://farms.citrapalu.net",
        "https://farms.gorontalominerals.com",
        "https://farms-staging.citrapalu.net",
        "https://farms-staging.gorontalominerals.com",
        "https://career.brmapps.com",
        "https://career.gorontalominerals.com",
    ],
};

app.use(cors(corsOptions));

// API Key Validation middleware
app.use((req, res, next) => {

    const validApiKeys = [
        '3cec72d90f7e480ab3e8701dc2133c9f07ac30e638104a9711961376cb3e5952',
    ];

    const apiKey = req.headers['x-api-key'] || req.query.apiKey;

    if (!apiKey) {
        return res.status(401).json({ message: 'API key is missing.' });
    }

    if (!validApiKeys.includes(apiKey)) {
        return res.status(403).json({ message: 'Invalid API key.' });
    }

    // API key is valid, proceed to the next middleware or route handler
    next();
});

// Simple route
app.get("/api/access", (_, res) => {
    res.json({ message: "Welcome to FARMS application" });
});

// Import AWS SDK maintenance mode
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

// Import and configure routes
const adminRoutes = [
    './app/routes/admin/billing.telkomsel.routes',
    './app/routes/admin/travel.authority.routes',
    './app/routes/admin/service.request.routes',
    './app/routes/admin/authorization.routes',
    './app/routes/admin/timesheet.routes',
    './app/routes/admin/hias.routes',
];

const formRoutes = [
    './app/routes/form/billing.telkomsel.routes',
    './app/routes/form/travel-authority.routes',
    './app/routes/form/service-request.routes',
    './app/routes/form/working.permit.routes',
    './app/routes/form/timesheet.routes',
    './app/routes/form/hias.routes',
];

const digitalApprovalRoutes = ['./app/routes/digital_approval/approval.routes',];

const integrationRoutes = [
    './app/routes/integration/brms-stock.routes',
    './app/routes/integration/hcm-recruitment-service.routes',
    './app/routes/integration/data-static.routes'
];

adminRoutes.forEach((route) => require(route)(app));
formRoutes.forEach((route) => require(route)(app));
digitalApprovalRoutes.forEach((route) => require(route)(app));
integrationRoutes.forEach((route) => require(route)(app));

// Middleware to handle 404 errors
app.use((_req, res) => {
    res.status(404).send("Sorry can't find that!");
});

// Connect to MongoDB
async function connectMongo() {
    try {
        mongoose.set("strictQuery", false);
        
        await mongoose.connect(DBCONFIG.CONFIG.URL, DBCONFIG.CONFIG.SETTINGS);

        console.log("Mongo connected successfully.");
        return true;
    } catch (error) {
        console.error("MongoDB connection error:", error);
        return false;
    }
}

// Connect to Prisma
async function connectPrisma() {
    try {
        const prisma = new PrismaClient();
        await prisma.$connect();

        console.log("Prisma connected successfully.");
        return true;
    } catch (error) {
        console.error("Prisma connection error:", error);
        return false;
    }
}

// Start the server if both MongoDB and Prisma connections are successful
async function startServer() {

    const mongoConnected = await connectMongo();
    const prismaConnected = await connectPrisma();

    if (mongoConnected && prismaConnected) {
        const PORT = process.env.PORT || 80;

        app.listen(PORT, () => {
            if (process.env.NODE_APP_INSTANCE == 0) {
                schedule.scheduleJob('00 00 02 * * 0-6', function () {
                    if (process.env.ENV === "production") {
                        SCHEDULER.reminder_approval();
                    }
                });
            }
            console.log(`Server is running on port ${PORT}.`);
        });
    } else {
        console.error("Server cannot start due to connection errors.");
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = app;
