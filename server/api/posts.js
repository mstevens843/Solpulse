/**
 *  Posts Routes - SolPulse API
 * 
 * Handles:
 * - Posting, liking, retweeting, and deleting posts.
 * - Fetching posts, trending posts, and liked posts.
 * - Handling media uploads via Multer.
 * - Managing retweets and batch fetching for client-side optimization.
 */


const express = require('express');
const { Post, Comment, User, Like, Retweet, Notification } = require('../models/Index');
const authMiddleware = require('../middleware/auth');
const checkOwnership = require('../middleware/checkOwnership');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const { categorizePost } = require("../utils/categorizePost"); // ✅ now exists in backend
const router = express.Router();

// Multer configuration for media uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

/**
 * Utility function - Format Post Responses
 * 
 * - Formats post data for frontend consumption
 * - Ensures proper handing of retweets
 */
const formatPost = (post, currentUserId = null) => ({
  id: post.id || null,
  userId: post.userId || null,

  originalUserId: post.isRetweet
    ? post.originalUserId || post.originalPost?.userId || null
    : post.userId || null,

  author: post.isRetweet
    ? post.originalPost?.user?.username || post.originalAuthor || "Unknown"
    : post.user?.username || post.author || "Unknown",

  profilePicture: post.isRetweet
    ? post.originalPost?.user?.profilePicture || post.originalProfilePicture || "http://localhost:5001/uploads/default-avatar.png"
    : post.user?.profilePicture || "http://localhost:5001/uploads/default-avatar.png",

  content: post.content || '',
  mediaUrl: post.mediaUrl || null,
  cryptoTag: post.cryptoTag || null,
  likes: post.likes || 0,
  retweets: post.isRetweet 
  ? post.originalPost?.retweets || 0 
  : post.retweets || 0,  isRetweet: post.isRetweet || false,
  originalPostId: post.originalPostId || null,

  // Fix: Correctly determine `retweeterName` dynamically
  retweeterName: post.isRetweet
    ? post.user?.username || "Unknown"  // Use the `user` field to get the retweeter
    : null,

  originalAuthor: post.originalPost?.user?.username || post.originalAuthor || null,
  originalProfilePicture: post.originalPost?.user?.profilePicture || post.originalProfilePicture || null,

  retweetedAt: post.retweetedAt || post.createdAt || new Date(),
  createdAt: post.createdAt || new Date(),
  updatedAt: post.updatedAt || new Date(),
  category: post.category || "General",

  commentCount: post.comments?.length || 0  // ✅ ADDED: comment count as number

});


/**
 * Route: Fetch Profile Feed
 * 
 * - Gets a user's posts and retweets.
 * - Formats them correctly.
 */
router.get('/:id/profile-feed', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    // Fetch user's original posts (excluding retweets)
    const userPosts = await Post.findAll({
      where: { userId, isRetweet: false },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'profilePicture']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    // Fetch user's retweets
    const retweets = await Post.findAll({
      where: { userId, isRetweet: true },
      include: [
        {
          model: Post,
          as: 'originalPost',
          include: [{ model: User, as: 'user', attributes: ['username', 'profilePicture'] }],
        },
        {
          model: User,
          as: 'user',
          attributes: ['username', 'profilePicture']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    const formattedRetweets = retweets.map((retweet) => ({
      ...formatPost(retweet, userId),
      retweeterName: retweet.user?.username || "Unknown"
    }));

    const formattedPosts = userPosts.map((post) => formatPost(post, userId));

    const combinedPosts = [...formattedPosts, ...formattedRetweets].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json({ posts: combinedPosts });
  } catch (error) {
    console.error("Error fetching user posts and retweets:", error);
    res.status(500).json({ message: "Failed to fetch posts and retweets." });
  }
});



/**
 * @route   GET /api/posts
 * @desc    Get all posts with optional user filtering and pagination
 * @access  Public
 */
/**
 * @route   GET /api/posts
 * @desc    Get all posts with optional user filtering and pagination
 * @access  Public
 */
router.get('/', async (req, res) => {
  const { userId, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const whereCondition = userId ? { userId } : {};

  try {
    const posts = await Post.findAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profilePicture'] // ✅ DO NOT add author here
        },
        {
          model: Post,
          as: 'originalPost',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'profilePicture'] // ✅ Same here
            }
          ]
        }
      ]
    });

    const formattedPosts = posts.map(formatPost); // ✅ adds author, etc.

    res.json({
      posts: formattedPosts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(posts.length / limit),
      totalPosts: posts.length,
    });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Failed to fetch posts.' });
  }
});



/**
 * @route   GET /api/posts/trending
 * @desc    Get trending posts sorted by likes
 * @access  Public
 */
// router.get('/trending', async (req, res) => {
//   try {
//     const trendingPosts = await Post.findAll({
//       where: { deletedAt: null },
//       order: [['likes', 'DESC']],
//       limit: 10,
//       include: [{ model: User, as: 'user', attributes: ['username', 'profilePicture'] }],
//     });

//     const formattedPosts = trendingPosts.map(formatPost);
//     res.json({ posts: formattedPosts });
//   } catch (err) {
//     console.error('Error fetching trending posts:', err);
//     res.status(500).json({ error: 'Failed to fetch trending posts.' });
//   }
// });


router.get('/trending', async (req, res) => {
  try {
    const trendingPosts = await Post.findAll({
      where: { deletedAt: null },
      order: [['likes', 'DESC']],
      limit: 20,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profilePicture']
        },
        {
          model: Post,
          as: 'originalPost',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'profilePicture']
            }
          ]
        }
      ]
    });

    const formattedPosts = trendingPosts.map(formatPost);
    res.json({ posts: formattedPosts });
  } catch (err) {
    console.error('Error fetching trending posts:', err);
    res.status(500).json({ error: 'Failed to fetch trending posts.' });
  }
});



/**
 * @route   GET /api/posts/likes
 * @desc    Get posts liked by the authenticated user
 * @access  Private
 */
router.get('/likes', authMiddleware, async (req, res) => {
  try {
    // Step 1: Find posts created by the logged-in user
    const userPosts = await Post.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'content'],
    });

    if (!userPosts.length) {
      return res.status(404).json({ message: 'No posts found for this user.' });
    }

    const postIds = userPosts.map((post) => post.id);

    // Step 2: Find who liked these posts
    const likes = await Like.findAll({
      where: { postId: postIds },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username'], // Who liked it
        },
        {
          model: Post,
          as: 'likedPost',
          attributes: ['content', 'userId'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['username'], // Original post owner
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    if (!likes.length) {
      return res.status(404).json({ message: 'No likes found for your posts.' });
    }

    // Step 3: Format response
    const formatted = likes.map((like) => ({
      postId: like.postId,
      postOwner: like.likedPost?.user?.username || 'Unknown',
      content: like.likedPost?.content || '',
      likedBy: like.user?.username || 'Unknown',
      createdAt: like.createdAt,
    }));

    res.status(200).json({ likes: formatted });
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    res.status(500).json({ message: 'Failed to fetch liked posts.' });
  }
});


// Optimized Client-Side Requests
// Instead of calling /like-status and /retweet-status for every post, we now batch fetch all 
// liked and retweeted posts at once.

// Batch fetch all liked posts for a user
router.get("/likes/batch", authMiddleware, async (req, res) => {
  try {
      const userId = req.user.id;
      const likedPosts = await Like.findAll({ 
          where: { userId }, 
          attributes: ["postId"] 
      });

      res.json({ likedPosts: likedPosts.map((like) => like.postId) });
  } catch (error) {
      console.error("Error fetching batch like data:", error);
      res.status(500).json({ error: "Failed to fetch batch like data." });
  }
});

// Batch fetch all retweeted posts for a user
router.get("/retweets/batch", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    // read from Posts table
    const retweetedPosts = await Post.findAll({
      where: { isRetweet: true, userId },
      attributes: ["originalPostId"],
    });
    res.json({
      retweetedPosts: retweetedPosts.map(p => p.originalPostId),
    });
  } catch (error) {
    console.error("Error fetching batch retweet data:", error);
    res.status(500).json({ error: "Failed to fetch batch retweet data." });
  }
});



/**
 * @route   GET /api/posts/:id/like-status
 * @desc    Check if the authenticated user has liked a specific post
 * @access  Private
 *  */
router.get("/:id/like-status", authMiddleware, async (req, res) => {
  try {
      const { id } = req.params;
      const userId = req.user.id;

      const existingLike = await Like.findOne({
          where: { postId: id, userId }
      });

      res.status(200).json({ liked: !!existingLike }); // Returns true if liked, false otherwise
  } catch (error) {
      console.error("Error checking like status:", error);
      res.status(500).json({ error: "Failed to check like status." });
  }
});


/**
 * @route   GET /api/posts/:id/retweet-status
 * @desc    Check if the authenticated user has retweeted a specific post
 * @access  Private
 */
router.get("/:id/retweet-status", authMiddleware, async (req, res) => {
  try {
      const { id } = req.params;
      const userId = req.user.id;

      const existingRetweet = await Post.findOne({
          where: { userId, isRetweet: true, originalPostId: id }
      });

      res.status(200).json({ retweeted: !!existingRetweet }); // Returns true if retweeted, false otherwise
  } catch (error) {
      console.error("Error checking retweet status:", error);
      res.status(500).json({ error: "Failed to check retweet status." });
  }
});


/**
 * @route   GET /api/posts/retweets
 * @desc    Get posts retweeted by the authenticated user
 * @access  Private
 */
router.get('/retweets', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; 

    //  Fetch retweets of the user's posts
    const retweets = await Post.findAll({
      where: { 
        isRetweet: true,
        originalUserId: userId //  Gets retweets of the user's posts
      },
      include: [
        {
          model: User,
          as: 'user', //  Retweeter info
          attributes: ['username'],
        },
        {
          model: Post,
          as: 'originalPost', //  Original post details
          attributes: ['content', 'userId'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['username'],  //  Original post owner
            }
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    if (!retweets.length) {
      return res.status(404).json({ message: 'No retweets found for your posts.' });
    }

    //  Format response
    res.status(200).json({
      retweets: retweets.map((retweet) => ({
        postId: retweet.originalPostId,
        postOwner: retweet.originalPost?.user?.username || "Unknown", //  Original post owner
        content: retweet.originalPost?.content || "No content", //  Original post content
        retweetedBy: retweet.user?.username || "Unknown", //  Retweeter username
        createdAt: retweet.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching retweeted posts:', error);
    res.status(500).json({ message: 'Failed to fetch retweeted posts.' });
  }
});



/**
 * @route   GET /api/posts/:id
 * @desc    Fetch a single post with comments and user data
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: Comment, as: 'comments' },
        { model: User, as: 'user', attributes: ['id', 'username', 'profilePicture'] },
        { 
          model: Post, 
          as: 'originalPost', 
          include: [{ model: User, as: 'user', attributes: ['id', 'username', 'profilePicture'] }] 
        }
      ],
    });

    if (!post) return res.status(404).json({ message: 'Post not found.' });

    //  Fix: Correctly determine original user (even for retweets)
    const formattedPost = formatPost(post);

    res.status(200).json({ post: formattedPost, comments: formattedPost.comments || [] });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'An error occurred while fetching the post.' });
  }
});

/**
 * @route   POST /api/posts
 * @desc    Create a new post with optional media and cryptoTag
 * @access  Private
 */

router.post('/', authMiddleware, upload.single('media'), async (req, res) => {
  const { content, cryptoTag } = req.body;
  const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const category = categorizePost(content); // ✅ Assign category based on content

    const post = await Post.create({
      userId: req.user.id,
      content,
      mediaUrl,
      cryptoTag,
      category, // ✅ Store it in DB
    });

    const populatedPost = await Post.findByPk(post.id, {
      include: [{ model: User, as: 'user', attributes: ['username', 'profilePicture'] }],
    });

    res.status(201).json({ post: formatPost(populatedPost), message: 'Post created successfully!' });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Failed to create post.' });
  }
});

/**
 * @route   POST /api/posts/:id/like
 * @desc    Like a post
 * @access  Private
 */
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
      const { id } = req.params;
      const userId = req.user.id;

      const post = await Post.findByPk(id);
      if (!post) return res.status(404).json({ message: "Post not found." });

      // Check if the user already liked this post
      const existingLike = await Like.findOne({ where: { postId: id, userId } });

      if (existingLike) {
          await existingLike.destroy();
          post.likes = Math.max(0, post.likes - 1);
      } else {
          await Like.create({ postId: id, userId });
          post.likes += 1;
      }

      await post.save();

      // Update all retweeted versions of the post
      await Post.update(
          { likes: post.likes },
          { where: { originalPostId: id, isRetweet: true } }
      );

      res.status(200).json({ 
          likes: post.likes, 
          message: existingLike ? "Like removed" : "Post liked" 
      });
  } catch (error) {
      console.error("Error liking/unliking post:", error);
      res.status(500).json({ message: "An error occurred while liking/unliking the post." });
  }
});


/**
 * @route   POST /api/posts/:id/retweet
 * @desc    Retweet a post
 * @access  Private
 */
router.post('/:id/retweet', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;  // Retweeter’s ID
    const retweeterName = req.user.username;  // Retweeter’s username

    // Fetch the original post
    const originalPost = await Post.findByPk(id, {
      include: [{ model: User, as: "user", attributes: ["id", "username", "profilePicture"] }]
    });

    if (!originalPost) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Check if the user already retweeted this post
    const existingRetweet = await Post.findOne({
      where: { userId, isRetweet: true, originalPostId: id },
    });

    if (existingRetweet) {
      return res.status(400).json({ message: "You have already retweeted this post." });
    }

    // Create the retweet post
    const retweetedPost = await Post.create({
      userId,  // This is the retweeter
      content: originalPost.content,
      mediaUrl: originalPost.mediaUrl,
      cryptoTag: originalPost.cryptoTag,
      isRetweet: true,
      originalPostId: originalPost.id,
      originalUserId: originalPost.userId, 
      originalAuthor: originalPost.user?.username || "Unknown",
      originalProfilePicture: originalPost.user?.profilePicture || "http://localhost:5001/uploads/default-avatar.png",
    });

    // Increment retweet count on the original post
    originalPost.retweets += 1;
    await originalPost.save();

    // Create notification for the original post owner
    await Notification.create({
      type: "retweet",
      actorId: userId,  // The user who retweeted
      userId: originalPost.userId,  //  Correctly set the recipient
      postId: originalPost.id,
      message: `${retweeterName} retweeted your post`,
    });
    

    // Fetch the retweet again, now including the retweeter’s username
    const populatedRetweet = await Post.findByPk(retweetedPost.id, {
      include: [{ model: User, as: "user", attributes: ["id", "username", "profilePicture"] }]
    });

    res.status(201).json({
      message: "Post retweeted successfully!",
      likes: originalPost.likes,
      retweets: originalPost.retweets,
      retweetData: {
        ...formatPost(populatedRetweet),
        retweets: originalPost.retweets,
        retweeterName: populatedRetweet.user?.username || "Unknown" // Finally fixes the issue
      },
      comments: 0,
    });
  } catch (error) {
    console.error("Error retweeting post:", error);
    res.status(500).json({ message: "An error occurred while retweeting the post." });
  }
});




/**
 * @route   GET /api/posts/:id/interactions
 * @desc    Get users who liked or reposted a post
 * @access  Public
 */
/**
 * @route   GET /api/posts/:id/interactions
 * @desc    Get users who liked or reposted a post
 * @access  Public (or Private if you prefer)
 */
router.get('/:id/interactions', async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id || null; // If you want to check who is viewing

    // 1) Get all likes on this post
    const likes = await Like.findAll({
      where: { postId: id },
      include: [
        {
          model: User,
          as: 'user',
          // Make sure we include what we need:
          attributes: ['id', 'username', 'profilePicture', 'bio'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // 2) Get all reposts (retweets) of this post
    const reposts = await Post.findAll({
      where: { originalPostId: id, isRetweet: true },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profilePicture', 'bio'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // OPTIONAL: If you also want to add "isFollowedByCurrentUser" or "isFollowingYou":
    //    (You can skip this if you don't need follow logic here)
    //
    //    For each user in likes[] or reposts[], you could run a quick check with your
    //    Followers model. Typically you'd do a Promise.all or something similar. But
    //    here's a minimal synchronous example just for clarity:

    // Turn them into plain objects so we can attach extra fields
    const likesMapped = [];
    for (const like of likes) {
      const user = like.user;
      // If you want follow info, do something like:
      // let isFollowedByCurrentUser = false;
      // let isFollowingYou = false;
      // if (currentUserId) {
      //   isFollowedByCurrentUser = !!(await Follower.findOne({
      //     where: {
      //       followerId: currentUserId,
      //       followingId: user.id,
      //     },
      //   }));
      //   isFollowingYou = !!(await Follower.findOne({
      //     where: {
      //       followerId: user.id,
      //       followingId: currentUserId,
      //     },
      //   }));
      // }
      likesMapped.push({
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture,
        bio: user.bio,
        // isFollowedByCurrentUser,
        // isFollowingYou,
      });
    }

    const repostsMapped = [];
    for (const retweet of reposts) {
      const user = retweet.user;
      // same optional follower logic...
      repostsMapped.push({
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture,
        bio: user.bio,
        // isFollowedByCurrentUser,
        // isFollowingYou,
      });
    }

    res.status(200).json({
      likes: likesMapped,
      reposts: repostsMapped,
    });
  } catch (error) {
    console.error("Error fetching post interactions:", error);
    res.status(500).json({ message: "Failed to fetch interactions." });
  }
});


/**
 * {
  "likes": [
    {
      "id": 1,
      "username": "satoshi",
      "profilePicture": "/uploads/satoshi.png"
    }
  ],
  "reposts": [
    {
      "id": 2,
      "username": "vitalik",
      "profilePicture": "/uploads/vitalik.png"
    }
  ]
}

 */


/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post
 * @access  Private
 */
router.delete('/:id', authMiddleware, checkOwnership, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    await post.destroy();
    res.status(200).json({ message: 'Post deleted successfully.' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'An error occurred while deleting the post.' });
  }
});

router.delete('/:id/retweet', authMiddleware, async (req, res) => {
  try {
      const { id } = req.params;
      const userId = req.user.id;

      // Find the reposted post by this user
      const retweetedPost = await Post.findOne({
          where: { userId, isRetweet: true, originalPostId: id },
      });

      if (!retweetedPost) {
          return res.status(404).json({ message: "Retweet not found." });
      }

      // Find the original post to decrement retweet count
      const originalPost = await Post.findByPk(id);
      if (originalPost) {
          originalPost.retweets = Math.max(0, originalPost.retweets - 1);
          await originalPost.save();
      }

      // Ensure likes on the retweeted post don't persist after deletion
      await Like.destroy({
          where: { postId: retweetedPost.id }
      });

      // Delete the retweeted post
      await retweetedPost.destroy();

      res.status(200).json({ 
          message: "Retweet removed successfully!", 
          retweets: originalPost ? originalPost.retweets : 0 
      });
  } catch (error) {
      console.error("Error removing retweet:", error);
      res.status(500).json({ message: "An error occurred while removing retweet." });
  }
});



module.exports = router;


/**
 * 🔍 Potential Issues & Optimizations
✅ Optimize Retweet & Like Queries
✅ Use WebSockets for Real-Time Likes & Retweets
✅ Batch Fetch Likes & Retweets Instead of Individual Requests
 */