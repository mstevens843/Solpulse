require('dotenv').config(); // Load .env variables
const { generateToken } = require('./token'); // Update the path to your token.js
const fs = require('fs');

console.log("JWT_SECRET from .env:", process.env.JWT_SECRET);


// Example payload
const payload = {
    id: 12545, // Replace with user ID
    username: "testuserskeeboo", // Replace with username
    email: "testskeboooe@example.com", // Replace with email
};

// Generate a token
try {
    const token = generateToken(payload);

    // Print the token
    console.log("Generated Token:", token);

    // Optionally save to a file for later use
    fs.writeFileSync('token.txt', token);
} catch (error) {
    console.error("Error generating token:", error.message);
}
