const db = require('../../server/models'); // Adjusted path to match your project structure
const { sequelize } = db; // Extract Sequelize instance


describe('Sequelize Models Initialization', () => {
    // Test if the database connection is successful
    it('should connect to the database successfully', async () => {
        try {
            await sequelize.authenticate();
        } catch (error) {
            throw new Error('Failed to connect to the database.');
        }
    });

    // Test if all models are defined
    it('should load all models', () => {
        const modelNames = ['User', 'Post', 'Comment', 'Follower']; // Add your model names here
        modelNames.forEach((modelName) => {
            expect(db[modelName]).toBeDefined();
        });
    });

    // Test if associations are set up
    it('should set up associations for models', () => {
        expect(db.User.associate).toBeDefined();
        expect(db.Post.associate).toBeDefined();
        expect(db.Comment.associate).toBeDefined();
        expect(db.Follower.associate).toBeDefined();
    });

    // Test a basic query to ensure models are functional
    it('should perform a simple query', async () => {
        try {
            const users = await db.User.findAll();
            expect(users).toBeDefined();
            expect(Array.isArray(users)).toBe(true);
        } catch (error) {
            throw new Error('Failed to perform a basic query on the User model.');
        }
    });
});

afterAll(async () => {
    await sequelize.close(); // Close the connection after tests
});


// What This Test Does
// Database Connection: Checks if the Sequelize instance connects to the database without errors.
// Model Loading: Ensures all expected models are properly initialized and available in the db object.
// Associations: Confirms that the associate function exists for models that define relationships.
// Basic Query: Verifies that at least one model (User in this case) can execute a simple query without errors.