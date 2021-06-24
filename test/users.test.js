const request = require("supertest");
const app = require("../app");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/userModel");

const user = {
    name: "saman test user",
    email: "testuser@23.com",
    password: "123456789",
}   
    
let token;
describe('Register EndPoints', () => {

    beforeEach(async () => {
        await User.deleteMany({})
    })

    
    it('Should not register a user without name field', async () => {
        await request(app).post('/api/register')
            .send({
                email: user.email,
                password: user.password,
            })
            .expect(400)
    })

    it('Should not register a user without email field', async () => {
        await request(app).post('/api/register')
            .send({
                name: user.name,
                password: user.password,
            })
            .expect(400)
    })

    it('Should not register a user without password field', async () => {
        await request(app).post('/api/register')
            .send({
                name: user.name,
                email: user.email,
            })
            .expect(400)
    })

    it('Should not register an empty user', async () => {
        await request(app).post('/api/register')
            .send({
                
            })
            .expect(400)
    })

    it('Should add new user', async () => {
    const res = await request(app).post('/api/register')
        .send({
            name: user.name,
            email: user.email,
            password: user.password
        })
        expect(res.statusCode).toEqual(201)
        expect.objectContaining({ msg: "User registered successfully!" });
    
    
    })

    it('Should add new user with role', async () => {
        await request(app).post('/api/register')
            .send({
                name: user.name,
                email: user.email,
                password: user.password,
                role: "manager",
            })
            .expect(201)
    
    });

   
afterAll((done) => {
    request(app).post('/api/login')
        .send({
            email: user.email,
            password: user.password
        }).end((err, response) => {
            // console.log(err, "err");
            console.log(response.body, "res");
            token = response.body.token;
            done();
        });
});

})


describe('Get EndPoints', () => {
    it('It should require quthorization', async () => {
        await request(app).get('/api/get')
            .then((res) => {
                expect(res.statusCode).toBe(401);
        })
    })
    it('Sholud return JSON', async () => {
        return request(app).get('/api/get')
            .set('Authorization', 'Bearer '+ token)
            .then((res) => {
                expect(res.statusCode).toBe(200);
        })
    })

    it('Should return the current user', async () => {
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        console.log(decoded.id, "pa");
        return request(app).get(`/api/get/${decoded.id}`)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
        
    })

})



