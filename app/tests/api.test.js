require('dotenv').config()

const DBCONFIG = require('../config/db.config');
const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../server");

const clientId = process.env.CLIENT_ID;
const tenantId = process.env.TENANT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const getTokenWithUsernamePassword = require('../config/getToken365');

const username = "mfahlevi@brm.co.id";
const password = "Brms@2023";

let accessToken;

beforeEach(async () => {
    await mongoose.connect(DBCONFIG.CONFIG.URL, DBCONFIG.CONFIG.SETTINGS);
});

afterEach(async () => {
    await mongoose.connection.close();
});


describe("GET /api/integration/stock", () => {
    it("Yahoo Finance API", async () => {
        const res = await request(app).get("/api/integration/stock");
        expect(res.statusCode).toBe(200);
    });
});

describe('GET /api/access/approval/list/pending', () => {

    beforeAll(async () => {
        accessToken = await getTokenWithUsernamePassword(clientId, tenantId, clientSecret, username, password);
    });

    it('Pending Approval', async () => {
        const res = await request(app)
            .get('/api/access/approval/list/pending')
            .query({ email: 'mohamad.fahlevi@brm.co.id' })
            .set('x-access-token', `${accessToken}`);

        expect(res.statusCode).toBe(200);
    });

});

describe('POST api/access/signin', () => {

    it('Sign In', async () => {
        const res = await request(app)
            .post('/api/access/signin')
            .send({
                access_token: `${accessToken}`,
            })
        expect(res.statusCode).toBe(200);
    });

});

