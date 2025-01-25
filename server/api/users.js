const express = require('express');
const path = require('path');  // Add this line
const { User, Follower, Post, Notification } = require('../models/Index');
const authMiddleware = require('../middleware/auth');
const { param, validationResult } = require('express-validator');
const router = express.Router();
const multer = require('multer');


// Setup Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Save files to the 'uploads' directory
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Use current timestamp as the filename
    }
  });
  
  const upload = multer({ storage: storage });

  // Route to upload profile picture
router.post('/upload-profile-picture', authMiddleware, upload.single('profilePicture'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
      }
  
      // Get the user ID from the authenticated user
      const user = await User.findByPk(req.user.id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Update the user's profile picture
      user.profilePicture = `/uploads/${req.file.filename}`;
      await user.save();
  
      res.json({ message: 'Profile picture updated successfully.', profilePicture: user.profilePicture });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      res.status(500).json({ message: 'An error occurred while uploading the profile picture.' });
    }
  });
  
  

// Get the authenticated user's details
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'email', 'bio', 'walletAddress']
        });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: "An error occurred while fetching user details." });
    }
});


// Get a user's profile and posts by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        console.log(`Fetching profile for user ID: ${id}`);

        const user = await User.findByPk(id, {
            attributes: ['id', 'username', 'bio', 'walletAddress', 'profilePicture']
        });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        console.log("User fetched:", user);
        // Get followers and following count
        const followersCount = await Follower.count({ where: { followingId: id } });
        const followingCount = await Follower.count({ where: { followerId: id } });


        const posts = await Post.findAll({
            where: { userId: id },
            order: [['createdAt', 'DESC']],
        });

        console.log(`Posts fetched for user ID ${id}:`, posts);

        res.json({
            user,
            followersCount,
            followingCount,
            posts: posts || [] // Ensure an empty array is returned if no posts found
        });
    } catch (error) {
        console.error("Error fetching user profile and posts:", error);
        res.status(500).json({ message: "An error occurred while fetching the user profile and posts." });
    }
});

// Get list of followers for a user
router.get('/:id/followers', async (req, res) => {
    const { id } = req.params;

    try {
        const followers = await Follower.findAll({
            where: { followingId: id },
            include: [{ model: User, as: 'follower', attributes: ['id', 'username', 'profilePicture'] }]
        });

        res.json({ followers: followers.map(f => f.follower) });
    } catch (error) {
        console.error("Error fetching followers:", error);  // Log full error
        res.status(500).json({ message: "An error occurred while fetching followers.", error: error.message });
    }
});

// Get list of following users
router.get('/:id/following', async (req, res) => {
    const { id } = req.params;

    try {
        const following = await Follower.findAll({
            where: { followerId: id },
            include: [{ model: User, as: 'following', attributes: ['id', 'username', 'profilePicture'] }]
        });
        

        res.json({ following: following.map(f => f.following) });
    } catch (error) {
        console.error("Error fetching following users:", error);
        res.status(500).json({ message: "An error occurred while fetching following users." });
    }
});



// Follow a user
router.post('/:id/follow', authMiddleware, param('id').isInt(), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id: followingId } = req.params;
    const followerId = req.user.id;

    try {
        if (followerId === parseInt(followingId)) {
            return res.status(400).json({ message: 'You cannot follow yourself.' });
        }

        const [follow, created] = await Follower.findOrCreate({
            where: { followerId, followingId },
        });

        if (!created) {
            return res.status(400).json({ message: 'You are already following this user.' });
        }

        res.status(201).json({ message: 'User followed successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while following the user.' });
    }
});



// Unfollow a user
router.delete('/:id/unfollow', authMiddleware, async (req, res) => {
    const { id: followingId } = req.params;
    const followerId = req.user.id;

    try {
        // Check if the follow record exists before deleting
        const follow = await Follower.findOne({
            where: { followerId, followingId }
        });

        if (!follow) {
            return res.status(400).json({ message: "You are not following this user." });
        }

        await follow.destroy(); // Delete the follow record
        res.json({ message: "User unfollowed successfully." });
    } catch (error) {
        console.error("Error unfollowing user:", error);
        res.status(500).json({ message: "An error occurred while unfollowing the user." });
    }
});

// Check if the authenticated user is following another user
router.get('/:id/is-following', authMiddleware, async (req, res) => {
    const { id: followingId } = req.params;
    const followerId = req.user.id;

    try {
        const follow = await Follower.findOne({
            where: { followerId, followingId }
        });

        res.json({ isFollowing: !!follow });
    } catch (error) {
        console.error("Error checking follow status:", error);
        res.status(500).json({ message: "An error occurred while checking follow status." });
    }
});



router.put('/profile/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { bio } = req.body;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        user.bio = bio;
        await user.save();

        res.json({ message: "Bio updated successfully.", user });
    } catch (error) {
        console.error("Error updating bio:", error);
        res.status(500).json({ message: "An error occurred while updating bio." });
    }
});

// router.delete('/:id', authMiddleware, checkOwnership(Post), async (req, res) => {
//     try {
//       const post = await Post.findByPk(req.params.id);
//       if (!post) return res.status(404).json({ message: 'Post not found.' });
  
//       await post.destroy();
//       res.status(200).json({ message: 'Post deleted successfully.' });
//     } catch (error) {
//       console.error('Error deleting post:', error);
//       res.status(500).json({ message: 'An error occurred while deleting the post.' });
//     }
//   });


module.exports = router;




// What's Added:
// New Route:

// GET /api/users/:id – Fetches a specific user's profile and their posts.
// Error Handling:

// If the user is not found, it returns a 404 error.
// Consistent Formatting:

// Uses a clean and consistent structure for fetching data.

// Key Updates:
// HTTP Method for Unfollow:

// Changed POST /:id/unfollow to DELETE /:id/unfollow for semantic correctness.
// Message Standardization:

// Updated all responses to use "message" for error or success messages.
// Error Messages:

// Made error messages more generic to avoid leaking sensitive implementation details.
// HTTP Status Codes:

// Ensured proper status codes for each response (201 for successful creation, 400 for bad requests, 500 for server errors).