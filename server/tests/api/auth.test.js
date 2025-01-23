const request = require("supertest");
const app = require("../../../server/app"); // Path to app.js
const { User, sequelize } = require("../../../server/models"); // Models and Sequelize instance
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

describe("Auth API Routes", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Reset database
  });

  afterAll(async () => {
    await sequelize.close(); // Close DB connection
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore mocks after each test
  });

  describe("POST /register", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        walletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token");
    });

    it("should return an error if the user already exists", async () => {
      await User.create({
        username: "existinguser",
        email: "existing@example.com",
        password: "password123",
        walletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNb",
      });

      const res = await request(app).post("/api/auth/register").send({
        username: "existinguser",
        email: "existing@example.com",
        password: "password123",
        walletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNb",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "User already exists");
    });

    it("should validate inputs and return an error for invalid email", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "invalidemailuser",
        email: "not-an-email",
        password: "password123",
        walletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      });

      expect(res.status).toBe(400);
      expect(res.body.errors[0]).toHaveProperty("msg", "Please include a valid email");
    });

    it("should return an error for missing username during registration", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "password123",
        walletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      });

      expect(res.status).toBe(400);
      expect(res.body.errors[0]).toHaveProperty("msg", "Username is required");
    });

    it("should hash the password before saving to the database", async () => {
      const user = await User.findOne({ where: { email: "test@example.com" } });
      expect(user.password).not.toBe("password123");
    });

    it("should handle server errors gracefully during registration", async () => {
        jest.spyOn(User, "create").mockImplementationOnce(() => {
          throw new Error("Database error");
        });
      
        const res = await request(app).post("/api/auth/register").send({
          username: "CryptoLuna", // Unique username
          email: "luna@moonbase.io", // Unique email
          password: "securepassword123",
          walletAddress: "2B1zP1eP5QGefi2DMPTfTL5SLmv7DivfNx", // Unique wallet address
        });
      
        console.log("Mocked User.create error triggered!");
        console.log("Test Response Body:", res.body);
      
        expect(res.status).toBe(500); // Expecting server error response
        expect(res.body.error).toHaveProperty("message", "Server error: Database error");
      });
      
  });

  describe("POST /login", () => {
    beforeAll(async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      await User.create({
        username: "loginuser",
        email: "login@example.com",
        password: hashedPassword,
        walletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNc",
      });
    });

    it("should log in successfully with valid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");

      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty("id");
    });

    it("should return an error for invalid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid credentials");
    });

    it("should validate inputs and return an error for missing password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
      });

      expect(res.status).toBe(400);
      expect(res.body.errors[0]).toHaveProperty("msg", "Password is required");
    });

    it("should return an error for non-existent email during login", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "doesnotexist@example.com",
        password: "password123",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid credentials");
    });

    it("should handle server errors gracefully during login", async () => {
      jest.spyOn(User, "findOne").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "password123",
      });

      expect(res.status).toBe(500);
      expect(res.body.error).toHaveProperty("message", "Server error: Database error");
    });
  });
});



// Key Points:
// Replace /api/auth/register and /api/auth/login with the correct routes if different in your setup.
// The beforeAll hook resets the database and creates necessary test data.
// Test cases include successful operations, validation errors, and edge cases like duplicate users or invalid credentials.
// The tests use bcrypt for hashing passwords to align with your registration logic.