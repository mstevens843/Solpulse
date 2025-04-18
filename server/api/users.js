/**
 * User API Routes - SolPulse
 *
 * Handles:
 * - User profile retrieval & updates.
 * - Profile picture uploads using Multer.
 * - Follow/unfollow functionality.
 * - Fetching followers & following lists.
 * - Fetching follower notifications.
 * - Checking follow status.
 */


const express = require('express');
const path = require('path'); 
const fs = require('fs');
const { User, Follower, Post, Notification, sequelize } = require('../models');
const authMiddleware = require('../middleware/auth');
const checkBlockStatus = require('../middleware/checkBlockStatus');
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




  /**
 * @route   POST /api/users/upload-profile-picture
 * @desc    Upload & update user's profile picture
 * @access  Private
 */
// Route to upload profile picture
router.post('/upload-profile-picture', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
      // No file uploaded
      if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded.' });
      }

      // Validate file type (only allow jpg, jpeg, png, gif)
      const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedFileTypes.includes(req.file.mimetype)) {
          return res.status(400).json({ message: 'File type not supported. Please upload a valid image (JPEG, PNG, GIF).' });
      }

      // Validate file size (limit: 5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (req.file.size > MAX_FILE_SIZE) {
          return res.status(400).json({ message: 'File size exceeds the 5MB limit.' });
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

      if (error instanceof multer.MulterError) {
          return res.status(500).json({ message: 'Error processing file upload.', error: error.message });
      }

      res.status(500).json({ message: 'Database error while updating profile picture.' });
  }
});



  

/**
 * @route   GET /api/users/me
 * @desc    Get authenticated user's details
 * @access  Private
 *
 * - Retrieves the currently logged-in user's profile information.
 * - Requires authentication via `authMiddleware`.
 * - Returns user details including `id`, `username`, `email`, `bio`, and `walletAddress`.
 */
router.get('/me', authMiddleware, async (req, res) => {
    try {
        // Fetch the authenticated user's details. 
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'email', 'bio', 'walletAddress', 'theme', 'privacy', 'notifications' ]
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




/**
 * @route   PUT /api/users/settings
 * @desc    Update user account settings (email, theme, privacy, notifications, wallet)
 * @access  Private
 */
router.put('/settings', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, walletAddress, privacy, notifications, theme } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email) user.email = email;
    if (walletAddress !== undefined) user.walletAddress = walletAddress;
    if (["public", "private"].includes(privacy)) {
      user.privacy = privacy;
    }
    if (notifications) user.notifications = notifications;
    if (theme) user.theme = theme;

    await user.save();
    return res.status(200).json({ message: "Settings updated successfully" });
  } catch (err) {
    console.error("Error updating settings:", err);
    return res.status(500).json({ message: "Failed to update settings" });
  }
});


/**
 * @route   GET /api/users/profile/:username
 * @desc    Get a user's profile by username (no posts or followers)
 * @access  Public
 *
 * - Fetches basic profile info using the username.
 * - Used for message requests and user previews.
 * - Does not return posts or follower data.
 */

router.get('/profile/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({
      where: { username },
      attributes: ['id', 'username', 'bio', 'walletAddress', 'profilePicture', 'privacy']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Error fetching user by username:', err);
    res.status(500).json({ message: 'Failed to fetch user.' });
  }
});



/**
 * @route   GET /api/users/profile-auth/:username
 * @desc    Get a user's profile with "isFollowing" flag
 * @access  Private (auth required)
 */
router.get('/profile-auth/:username', authMiddleware, async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({
      where: { username },
      attributes: ['id', 'username', 'bio', 'walletAddress', 'profilePicture', 'privacy'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if current user (req.user.id) follows the found user
    const isFollowing = await Follower.findOne({
      where: {
        followerId: req.user.id,    // the logged-in user
        followingId: user.id,       // the profile being viewed
      },
    });

    // Return the user plus isFollowing
    res.json({
      user,
      isFollowing: !!isFollowing, // true if found, else false
    });
  } catch (err) {
    console.error('Error fetching user by username:', err);
    res.status(500).json({ message: 'Failed to fetch user.' });
  }
});


/**
 * @route   GET /api/users/:id
 * @desc    Get a user's profile & posts
 * @access  Public
 *
 * - Retrieves a user's profile details by their ID.
 * - Fetches the user's follower and following counts.
 * - Retrieves all posts made by the user.
 * - Returns profile details, follower/following count, and user's posts.
 * - Added Privacy feature: check blocks post/bio unless you're the user or follower 
 */
router.get('/:id', authMiddleware, checkBlockStatus, async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user?.id;

  try {
    const profileUser = await User.findByPk(id, {
      attributes: ['id', 'username', 'bio', 'walletAddress', 'profilePicture', 'privacy'],
      include: [
        {
          model: Follower,
          as: 'followers',
          attributes: ['followerId']
        }
      ]
    });

    if (!profileUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isOwner = currentUserId === profileUser.id;
    const isFollower = profileUser.followers.some(f => f.followerId === currentUserId);

    const followersCount = profileUser.followers.length;
    const followingCount = await Follower.count({ where: { followerId: id } });

    // Handle Private Profile
    if (profileUser.privacy === 'private' && !isOwner && !isFollower) {
      return res.status(200).json({
        user: {
          id: profileUser.id,
          username: profileUser.username,
          bio: profileUser.bio,
          walletAddress: profileUser.walletAddress,
          profilePicture: profileUser.profilePicture,
          privacy: profileUser.privacy,
        },
        followersCount,
        followingCount,
        posts: [],
        postsHidden: true
      });
    }
    
     // Blocked user logic: Allow minimal profile, hide posts/followers
     if (req.isBlockedUser) {
      return res.status(200).json({
        user: {
          id: profileUser.id,
          username: profileUser.username,
          bio: "This user is blocked by you.",
          walletAddress: null,
          profilePicture: profileUser.profilePicture,
          privacy: profileUser.privacy,
        },
        followersCount: 0,
        followingCount: 0,
        posts: [],
        postsHidden: true,
        blocked: true // optional flag for frontend logic
      });
    }
    
    const posts = await Post.findAll({
      where: { userId: id },
      order: [['createdAt', 'DESC']],
    });

    res.json({
      user: {
        id: profileUser.id,
        username: profileUser.username,
        bio: profileUser.bio,
        walletAddress: profileUser.walletAddress,
        profilePicture: profileUser.profilePicture,
        privacy: profileUser.privacy,
      },
      followersCount,
      followingCount,
      posts: posts || [],
    });
  } catch (error) {
    console.error('Error fetching user profile and posts:', error);
    res.status(500).json({ message: 'An error occurred while fetching the user profile and posts.' });
  }
});
  




/**
 * @route   GET /api/users/followers/notifications
 * @desc    Fetch follower notifications for the authenticated user
 * @access  Private (Requires authentication)
 * 
 * - Retrieves users who have recently followed the authenticated user.
 * - Supports pagination to limit results.
 * - Returns follower details such as `id`, `username`, and `profilePicture`.
 * - If no new followers are found, returns a 404 response.
 */
router.get('/followers/notifications', authMiddleware, async (req, res) => {
  const { page = 1 } = req.query;
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await Follower.findAndCountAll({
      where: { followingId: req.user.id },
      include: [
        {
          model: User,
          as: 'followerUser',
          attributes: ['id', 'username', 'profilePicture'],
        },
        {
          model: Notification,
          as: 'notification',
          attributes: ['id', 'isRead'],
          where: { isRead: false },
          required: true,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    // No need to return 404 if no rows; just return an empty list with 200
    const followers = rows.map((follow) => ({
      id: follow.notification?.id || follow.followerUser.id,
      notificationId: follow.notification?.id || null,
      actor: follow.followerUser.username,
      profilePicture: follow.followerUser.profilePicture || null,
      message: `${follow.followerUser.username} started following you`,
      createdAt: follow.createdAt,
      isRead: follow.notification?.isRead ?? false,
      type: 'follow', // required by frontend to render correctly
    }));

    return res.json({
      followers,
      totalFollowers: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page, 10),
    });
  } catch (error) {
    console.error('Error fetching follower notifications:', error);
    res.status(500).json({ error: 'Failed to fetch follower notifications.' });
  }
});





/**
 * @route   GET /api/users/:id/followers
 * @desc    Get a user's followers
 * @access  Public
 */
router.get('/:id/followers', authMiddleware, checkBlockStatus, async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user?.id;

  try {
    const followers = await Follower.findAll({
      where: { followingId: id },
      include: [{
        model: User,
        as: 'followerUser',
        attributes: {
          include: [
            [sequelize.literal(`(
              SELECT COUNT(*) FROM "Followers" AS f
              WHERE f."followingId" = "followerUser"."id"
            )`), 'followerCount'],
            [sequelize.literal(`(
              SELECT COUNT(*) FROM "Followers" AS f
              WHERE f."followerId" = "followerUser"."id"
            )`), 'followingCount']
          ],
          exclude: ['password']
        }
      }]
    });

    const enrichedFollowers = await Promise.all(followers.map(async (f) => {
      const user = f.followerUser;
      const [isFollowed, isFollowingYou] = await Promise.all([
        Follower.findOne({
          where: { followerId: currentUserId, followingId: user.id }
        }),
        Follower.findOne({
          where: { followerId: user.id, followingId: currentUserId }
        })
      ]);

      return {
        ...user.toJSON(),
        isFollowedByCurrentUser: !!isFollowed,
        isFollowingYou: !!isFollowingYou
      };
    }));

    res.json({ followers: enrichedFollowers });
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ message: "An error occurred while fetching followers." });
  }
});




/**
 * @route   GET /api/users/:id/following
 * @desc    Get a list of users that the specified user is following
 * @access  Public
 * 
 * - Retrieves a list of users that the given `id` (user) is following.
 * - Includes `id`, `username`, and `profilePicture` of each followed user.
 * - Returns an empty array if the user is not following anyone.
 */
router.get('/:id/following', authMiddleware, checkBlockStatus, async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user?.id;

  try {
    const following = await Follower.findAll({
      where: { followerId: id },
      include: [{
        model: User,
        as: 'followedUser',
        attributes: {
          include: [
            [sequelize.literal(`(
              SELECT COUNT(*) FROM "Followers" AS f
              WHERE f."followingId" = "followedUser"."id"
            )`), 'followerCount'],
            [sequelize.literal(`(
              SELECT COUNT(*) FROM "Followers" AS f
              WHERE f."followerId" = "followedUser"."id"
            )`), 'followingCount']
          ],
          exclude: ['password']
        }
      }]
    });

    const enrichedFollowing = await Promise.all(following.map(async (f) => {
      const user = f.followedUser;
      const [isFollowed, isFollowingYou] = await Promise.all([
        Follower.findOne({
          where: { followerId: currentUserId, followingId: user.id }
        }),
        Follower.findOne({
          where: { followerId: user.id, followingId: currentUserId }
        })
      ]);

      return {
        ...user.toJSON(),
        isFollowedByCurrentUser: !!isFollowed,
        isFollowingYou: !!isFollowingYou
      };
    }));

    res.json({ following: enrichedFollowing });
  } catch (error) {
    console.error("Error fetching following users:", error);
    res.status(500).json({ message: "An error occurred while fetching following users." });
  }
});



/**
 * @route   POST /api/users/:id/follow
 * @desc    Follow a user
 * @access  Private
 * 
 * - Allows an authenticated user to follow another user.
 * - Ensures the user cannot follow themselves.
 * - Returns an error if the user is already following the target user.
 * - Responds with a success message if the follow action is successful.
 */
router.post(
  '/:id/follow',
  authMiddleware,
  checkBlockStatus,
  param('id').isInt(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id: followingId } = req.params;
    const followerId = req.user.id;

    try {
      if (followerId === parseInt(followingId)) {
        return res.status(400).json({ message: 'You cannot follow yourself.' });
      }

      // Check privacy of target user
      const targetUser = await User.findByPk(followingId);
      if (!targetUser) {
        return res.status(404).json({ message: 'User not found.' });
      }

      if (targetUser.privacy === 'private') {
        return res.status(403).json({ message: 'This user is private. Please send a follow request.' });
      }

      // Prevent duplicates
      const existing = await Follower.findOne({ where: { followerId, followingId } });
      if (existing) {
        return res.status(400).json({ message: 'You are already following this user.' });
      }

      // Create notification
      const notification = await Notification.create({
        userId: followingId,
        actorId: followerId,
        type: 'follow',
        message: `User ${req.user.username} started following you`,
        isRead: false,
      });

      // Create follower record with notification
      await Follower.create({
        followerId,
        followingId,
        notificationId: notification.id,
      });

      res.status(201).json({ message: 'User followed successfully.' });
    } catch (error) {
      console.error('Error following user:', error);
      res.status(500).json({ message: 'An error occurred while following the user.' });
    }
  }
);






/**
 * @route   DELETE /api/users/:id/unfollow
 * @desc    Unfollow a user
 * @access  Private
 * 
 * - Allows an authenticated user to unfollow another user.
 * - Ensures that the user can only unfollow someone they are currently following.
 * - Returns an error if the user is not following the target user.
 * - Responds with a success message if the unfollow action is successful.
 */
router.delete('/:id/unfollow', authMiddleware, async (req, res) => {
    const { id: followingId } = req.params; // Extract the user ID to follow. 
    const followerId = req.user.id; // Get the authemticated user's ID

    try {
        // Check if the follow relationships exists
        const follow = await Follower.findOne({
            where: { followerId, followingId }
        });

        if (!follow) {
            return res.status(400).json({ message: "You are not following this user." });
        }
        // Delete the follow relationship. 
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


/**
 * @route   PUT /api/users/profile/:id
 * @desc    Update user bio
 * @access  Private
 *
 * - Allows an authenticated user to update their bio.
 * - Ensures that the user exists before attempting to update.
 * - Returns an error if the user is not found.
 * - Responds with a success message and updated user data.
 */
router.put('/profile/:id', authMiddleware, async (req, res) => {
    const { id } = req.params; // Extract the user ID from URL params
    const { bio } = req.body; // Extract the bio from request body

    try {
        // Find the user by ID
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        // Update the bio field. 
        user.bio = bio;
        await user.save();

        res.json({ message: "Bio updated successfully.", user });
    } catch (error) {
        console.error("Error updating bio:", error);
        res.status(500).json({ message: "An error occurred while updating bio." });
    }
});



/**
 * @route   DELETE /api/users/remove-profile-picture
 * @desc    Remove user's profile picture
 * @access  Private
 */
router.delete('/remove-profile-picture', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Optional: Delete file from disk (if not the default one)
    if (user.profilePicture && !user.profilePicture.includes('default-avatar.png')) {
      const filePath = path.join(__dirname, '..', '..', 'uploads', path.basename(user.profilePicture));
      try {
        fs.unlinkSync(filePath); // Remove file from disk
      } catch (err) {
        console.warn('Warning: Failed to delete old profile picture file.', err.message);
      }
    }

    // Reset to null or default avatar
    user.profilePicture = null;
    await user.save();

    res.json({ message: 'Profile picture removed.', profilePicture: null });
  } catch (error) {
    console.error('Error removing profile picture:', error);
    res.status(500).json({ message: 'Failed to remove profile picture.' });
  }
});




/**
 * @route   DELETE /api/users/delete
 * @desc    Delete authenticated user's account
 * @access  Private
 */
router.delete('/delete', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Delete the user account
    await user.destroy();

    // Optional: You could also delete associated data here (e.g. posts, followers, messages)

    res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).json({ message: "Failed to delete account." });
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