const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const User = require('../models/User');

describe('Book Reservation System', () => {
  let testBook;
  let userToken;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST);
    
    await Book.deleteMany({});
    await User.deleteMany({});

    testBook = await Book.create({
      title: "Test Book",
      author: "Test Author",
      available: true
    });
    
    await request(app)
      .post('/api/auth/register')
      .send({
        username: "testuser",
        password: "testpass"
      });
      
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: "testuser",
        password: "testpass"
      });
      
    userToken = loginRes.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/books', () => {
    it('should return all books', async () => {
      const res = await request(app)
        .get('/api/books');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.books).toBeInstanceOf(Array);
      expect(res.body.books[0].title).toBe("Test Book");
    });
  });

  describe('PATCH /api/books/:id/reserve', () => {
    it('should successfully reserve a book', async () => {
      const res = await request(app)
        .patch(`/api/books/${testBook._id}/reserve`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.statusCode).toEqual(200);
      
      const updatedBook = await Book.findById(testBook._id);
      expect(updatedBook.available).toBe(false);
    });

    it('should fail when book is unavailable', async () => {
      await Book.findByIdAndUpdate(testBook._id, { available: false });
      
      const res = await request(app)
        .patch(`/api/books/${testBook._id}/reserve`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.statusCode).toEqual(403);
    });
  });

  describe('Admin Endpoints', () => {
    let adminToken;
    
    beforeAll(async () => {
      await User.create({
        username: "admin",
        password: "admin123",
        role: "admin"
      });
      
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          username: "admin",
          password: "admin123"
        });
        
      adminToken = loginRes.body.token;
    });

    it('POST /api/admin/books should add new book (admin only)', async () => {
      const newBook = {
        title: "New Book",
        author: "New Author"
      };
      
      const res = await request(app)
        .post('/api/admin/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newBook);
      
      expect(res.statusCode).toEqual(201);
      
      const bookCount = await Book.countDocuments();
      expect(bookCount).toBe(2);
    });
  });
});