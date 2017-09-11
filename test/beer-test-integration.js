'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const {Beer, User} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

const myTestUser = {
  username: faker.internet.userName(),
  unhashedPassword: 'password',
  password: '$2a$10$AmPJwn7FES9mV3ygK1DmvOlVHuO1oPg9idgYqXzTMjewvtp9goZF2',
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName()
};

function seedBeerData() {
  console.info('seeding beer data');
  const seedData = [];

  for (let i=1; i<=10; i++) {
    seedData.push(generateBeerData());
  }
  // this will return a promise
  return Beer.insertMany(seedData);
}

function generateBeerData() {
  return {
    name: faker.name.firstName(),
    abv: faker.random.number(),
    style: faker.lorem.sentences(),
    description: faker.lorem.sentences(),
    brewery: faker.lorem.sentence(),
    ibu: faker.random.number(),
    reviews: [{
      date: faker.date.recent(),
      comment: faker.lorem.paragraphs()},
    {
      date: faker.date.recent(),
      comment: faker.lorem.paragraphs()}
    ]
  };
}

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

function seedUser() { 
  return User.create(myTestUser)
    .then(user => {
      myTestUser._id = user._id;
    });
}

describe('Beer API resource', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return Promise.all([seedBeerData(), seedUser()]);
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('GET endpoint', function() {

    it('should return all existing beers', function() {

      let res;
      return chai.request(app)
        .get('/beers')
        .then(function(_res) {
          res = _res;
          res.should.have.status(200);
          res.body.beers.should.have.length.of.at.least(1);
          return Beer.count();
        })
        .then(function(count) {
          res.body.beers.should.have.length.of(count);
        });
    });


    it('should return beers with right fields', function() {

      let resBeer;
      return chai.request(app)
        .get('/beers')
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.beers.should.be.a('array');
          res.body.beers.should.have.length.of.at.least(1);

          res.body.beers.forEach(function(beer) {
            beer.should.be.a('object');
            beer.should.include.keys(
              'id', 'name', 'abv', 'reviews', 'style', 'description', 'brewery', 'ibu');
          });
          resBeer = res.body.beers[0];
          return Beer.findById(resBeer.id);
        })
        .then(function(beer) {
          resBeer.id.should.equal(beer.id);
          resBeer.name.should.equal(beer.name);
          resBeer.style.should.equal(beer.style);
          resBeer.description.should.equal(beer.description);
          resBeer.abv.should.equal(beer.abv);
          resBeer.brewery.should.equal(beer.brewery);
          resBeer.ibu.should.equal(beer.ibu);
          for (let i = 0; i < resBeer.reviews.length; i++) {
            beer.reviews[i].date.should.be.a('date');
            beer.reviews[i].comment.should.equal(resBeer.reviews[i].comment);
          }
        });
    });
  });

  describe('POST endpoint', function() {

    it('should add a new beer', function() {

      const newBeer = generateBeerData();

      return chai.request(app)
        .post('/beers')
        .send(newBeer)
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'id', 'name', 'style', 'description', 'reviews', 'brewery', 'ibu');
          res.body.name.should.equal(newBeer.name);
          res.body.id.should.not.be.null;
          res.body.style.should.equal(newBeer.style);
          res.body.description.should.equal(newBeer.description);

          return Beer.findById(res.body.id);
        })
        .then(function(beer) {
          beer.id.should.not.be.null;
          beer.name.should.equal(newBeer.name);
          beer.style.should.equal(newBeer.style);
          beer.description.should.equal(newBeer.description);
          beer.brewery.should.equal(newBeer.brewery);
          beer.ibu.should.equal(newBeer.ibu);

          for (let i = 0; i < newBeer.reviews.length; i++) {
            beer.reviews[i].date.toString().should.equal(newBeer.reviews[i].date.toString());
            beer.reviews[i].comment.should.equal(newBeer.reviews[i].comment);
          }
        });
    });

    it('should add new user', function (){
      const myNewUser = {
        username: faker.internet.userName(),
        password: '$2a$10$AmPJwn7FES9mV3ygK1DmvOlVHuO1oPg9idgYqXzTMjewvtp9goZF2',
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
      };
      return chai.request(app)
        .post('/users')
        .send(myNewUser)
        .then(function(res){
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'username', 'firstName', 'lastName');  
          res.body.username.should.equal(myNewUser.username);
          res.body.firstName.should.equal(myNewUser.firstName);
          res.body.lastName.should.equal(myNewUser.lastName);
        }).then();
    });
  });

  describe('PUT endpoint', function() {

    it('should update fields you send over', function() {
      let updatedData = {
        reviews: [{
          comment: 'hello'}
        ]
      };

      return Beer
        .findOne()
        .exec()
        .then(function(beer) {
          updatedData.id = beer.id;
          return chai.request(app)
            .put(`/beers/${beer.id}`)
            .auth(myTestUser.username, myTestUser.unhashedPassword)
            .send(updatedData);
        })
        .then(function(res) {
          res.should.have.status(204);
          return Beer.findById(updatedData.id).exec();
        })
        .then(function(beer) {
          const lastReview = beer.reviews[beer.reviews.length-1];
          beer.reviews[beer.reviews.length-1].should.equal(lastReview);
        });
    });
  });

  describe('DELETE endpoint', function() {

    it('delete a beer by id', function() {

      let beer;

      return Beer
        .findOne()
        .exec()
        .then(function(_beer) {
          beer = _beer;
          return chai.request(app).delete(`/beers/${beer.id}`);
        })
        .then(function(res) {
          res.should.have.status(204);
          return Beer.findById(beer.id).exec();
        })
        .then(function(_beer) {
          should.not.exist(_beer);
        });
    });
  });
});
