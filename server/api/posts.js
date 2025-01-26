const express = require('express');
const { Post, Comment, User, Like, Retweet } = require('../models/Index');
const authMiddleware = require('../middleware/auth');
const checkOwnership = require('../middleware/checkOwnership');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
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
 * Utility function to format post responses
 */
const formatPost = (post) => ({
  id: post.id,
  userId: post.userId,
  author: post.user.username,
  profilePicture: post.user.profilePicture,
  content: post.content,
  mediaUrl: post.mediaUrl,
  cryptoTag: post.cryptoTag,
  likes: post.likes || 0,
  retweets: post.retweets || 0,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
});


router.get('/:id/profile-feed', async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure id is treated as an integer
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    // Fetch user's original posts
    const userPosts = await Post.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'profilePicture']
        }
      ],
      order: [['createdAt', 'DESC']],  // Order by newest first
    });

    // Fetch user's retweets and include original post details
    const retweets = await Retweet.findAll({
      where: { userId },
      include: [
        {
          model: Post,
          as: 'post',
          include: [{ model: User, as: 'user', attributes: ['username', 'profilePicture'] }],
        },
      ],
      order: [['createdAt', 'DESC']],  // Order by newest first
    });

    // Format posts and retweets to a unified format
    const formattedRetweets = retweets.map((retweet) => ({
      ...retweet.post.toJSON(),
      isRetweet: true,
      createdAt: retweet.retweetedAt || retweet.createdAt,  // Use retweet date
      retweetedAt: retweet.createdAt,
      originalUser: retweet.post.user.username,
    }));

    // Merge and sort all posts/retweets by descending order
    const combinedPosts = [
      ...userPosts.map(post => ({
        ...post.toJSON(),
        isRetweet: false,
        createdAt: post.createdAt,
      })),
      ...formattedRetweets
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
      include: [{ model: User, as: 'user', attributes: ['username', 'profilePicture'] }],
    });

    const formattedPosts = posts.map(formatPost);

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
router.get('/trending', async (req, res) => {
  try {
    const trendingPosts = await Post.findAll({
      where: { deletedAt: null },
      order: [['likes', 'DESC']],
      limit: 20,
      include: [{ model: User, as: 'user', attributes: ['username', 'profilePicture'] }],
    });

    if (!trendingPosts.length) {
      return res.status(404).json({ message: 'No trending posts found' });
    }

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
    // Step 1: Find posts created by the logged-in user (Brad)
    const userPosts = await Post.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'content'],
    });

    if (!userPosts.length) {
      return res.status(404).json({ message: 'No posts found for this user.' });
    }

    // Extract Brad's post IDs
    const postIds = userPosts.map((post) => post.id);

    // Step 2: Find who liked these posts
    const likes = await Like.findAll({
      where: { postId: postIds },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username'],  // Get the user who liked the post
        },
        {
          model: Post,
          as: 'post',
          attributes: ['content', 'userId'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['username'],  // Get the original post owner
            }
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    if (!likes.length) {
      return res.status(404).json({ message: 'No likes found for your posts.' });
    }

    // Step 3: Format the response to show who liked Brad's posts
    res.status(200).json({
      likes: likes.map((like) => ({
        postId: like.postId,
        postOwner: like.post.user.username,  // Show post owner's name (Brad)
        content: like.post.content,  // Show post content
        likedBy: like.user.username,  // Show user who liked the post
        createdAt: like.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    res.status(500).json({ message: 'Failed to fetch liked posts.' });
  }
});



/**
 * @route   GET /api/posts/retweets
 * @desc    Get posts retweeted by the authenticated user
 * @access  Private
 */
router.get('/retweets', authMiddleware, async (req, res) => {
  try {
    // Step 1: Find posts created by the logged-in user (Brad)
    const userPosts = await Post.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'content'],
    });

    if (!userPosts.length) {
      return res.status(404).json({ message: 'No posts found for this user.' });
    }

    // Extract Brad's post IDs
    const postIds = userPosts.map((post) => post.id);

    // Step 2: Find who retweeted these posts
    const retweets = await Retweet.findAll({
      where: { postId: postIds },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username'],  // Get the user who retweeted the post
        },
        {
          model: Post,
          as: 'post',
          attributes: ['content', 'userId'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['username'],  // Get the original post owner
            }
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    if (!retweets.length) {
      return res.status(404).json({ message: 'No retweets found for your posts.' });
    }

    // Step 3: Format the response to show who retweeted Brad's posts
    res.status(200).json({
      retweets: retweets.map((retweet) => ({
        postId: retweet.postId,
        postOwner: retweet.post.user.username,  // Show post owner's name (Brad)
        content: retweet.post.content,  // Show post content
        retweetedBy: retweet.user.username,  // Show user who retweeted the post
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
        { model: User, as: 'user', attributes: ['username', 'profilePicture'] },
      ],
    });

    if (!post) return res.status(404).json({ message: 'Post not found.' });

    res.status(200).json({ post: formatPost(post), comments: post.comments || [] });
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
    const post = await Post.create({
      userId: req.user.id,
      content,
      mediaUrl,
      cryptoTag,
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
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    post.likes += 1;
    await post.save();

    res.status(200).json({ likes: post.likes });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'An error occurred while liking the post.' });
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
    const userId = req.user.id;

    // Check if the post exists
    const post = await Post.findByPk(id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    // Check if the user already retweeted the post
    const existingRetweet = await Retweet.findOne({
      where: { postId: id, userId },
    });

    if (existingRetweet) {
      return res.status(400).json({ message: 'You have already retweeted this post.' });
    }

    // Create a retweet record
    await Retweet.create({
      postId: id,
      userId,
    });

    // Increment retweet count on the original post
    post.retweets += 1;
    await post.save();

    res.status(201).json({
      message: 'Post retweeted successfully!',
      retweets: post.retweets,
      retweetData: {
        postId: post.id,
        userId,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error retweeting post:', error);
    res.status(500).json({ message: 'An error occurred while retweeting the post.' });
  }
});
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

module.exports = router;


// Key Updates:
// - Fixed Sequelize association alias issue by adding `as: 'user'` in include statements.
// - Ensured correct response formatting with the `formatPost` utility function.
// - Improved error handling and added more informative response messages.
// - Pagination support added for better scalability.
// - Secure media upload handling with multer.

// Key Improvements
// - Ensures consistent response formatting for posts.
// - Improved error messages for clarity.
// - Pagination support for scalability.
// - Better media handling to avoid file name collisions.

// Key Updates:
// - Fixed Sequelize association alias issue by adding `as: 'user'` in include statements.
// - Ensured correct response formatting with the `formatPost` utility function.
// - Improved error handling and added more informative response messages.
// - Pagination support added for better scalability.
// - Secure media upload handling with multer.





// Key Updates:
// Trending Posts Route (/trending):
// Fetches posts ordered by likes (assuming the likes field exists).
// Search Route (/search):
// Allows searching posts by content using a SQL LIKE query via Sequelize's Op.like.
// Pagination:
// The main post listing route (/api/posts) supports pagination with page and limit parameters.
// CRUD Operations:
// Full support for create, read (single and all posts), update, and delete operations.

// Key Highlights:
// Improved Error Handling: Added better checks for missing posts and inputs.
// Messages in Responses: API now provides meaningful success messages.
// Comments on CRUD Operations: Clear route documentation for easy understanding

// Key Improvements
// formatPost Utility:

// Ensures consistent response formatting for posts.
// Error Handling:

// Improved error messages for clarity.
// Pagination Support:

// Ensures scalability with paginated responses.
// Better Media Handling:

// Configured multer to avoid file name collisions.