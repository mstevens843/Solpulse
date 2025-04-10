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
const { Post, Comment, User, Like, Retweet, Notification, Follower } = require('../models/Index');
const authMiddleware = require('../middleware/auth');
const checkOwnership = require('../middleware/checkOwnership');
const checkBlockStatus = require('../middleware/checkBlockStatus');
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
    ? post.originalPost?.user?.username || post.originalAuthor || 'Unknown'
    : post.user?.username || post.author || 'Unknown',

  profilePicture: post.isRetweet
    ? post.originalPost?.user?.profilePicture || post.originalProfilePicture || "http://localhost:5001/uploads/default-avatar.png"
    : post.user?.profilePicture || "http://localhost:5001/uploads/default-avatar.png",

    content: post.content || '',
    mediaUrl: post.mediaUrl || null,
    cryptoTag: post.cryptoTag || null,
    likes: post.likes || 0,
    retweets: post.isRetweet
      ? post.originalPost?.retweets || 0
      : post.retweets || 0,
    isRetweet: post.isRetweet || false,
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
  category: post.category || 'General',

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
      return res.status(400).json({ message: 'Invalid user ID format.' });
    }

    // user's original posts
    const userPosts = await Post.findAll({
      where: { userId, isRetweet: false },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'profilePicture', 'privacy'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    // user's retweets
    const retweets = await Post.findAll({
      where: { userId, isRetweet: true },
      include: [
        {
          model: Post,
          as: 'originalPost',
          include: [
            { model: User, as: 'user', attributes: ['username', 'profilePicture', 'privacy'] },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['username', 'profilePicture', 'privacy'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const formattedRetweets = retweets.map((retweet) => ({
      ...formatPost(retweet, userId),
      retweeterName: retweet.user?.username || 'Unknown',
    }));

    const formattedPosts = userPosts.map((post) => formatPost(post, userId));

    const combinedPosts = [...formattedPosts, ...formattedRetweets].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json({ posts: combinedPosts });
  } catch (error) {
    console.error('Error fetching user posts and retweets:', error);
    res.status(500).json({ message: 'Failed to fetch posts and retweets.' });
  }
});




/**
 * @route   GET /api/posts
 * @desc    Get all posts with optional user filtering and pagination
 * Updated /api/posts Route with computeScore
 * @access  Public
 */
router.get('/', authMiddleware.optional, async (req, res) => {
  const { userId, page = 1, limit = 10, feed } = req.query;
  const offset = (page - 1) * limit;

  try {
    let posts;

    // ✅ "Following" feed — show all original + retweeted posts by followed users
    if (feed === 'following' && req.user?.id) {
      const currentUserId = req.user.id;

      const followRecords = await Follower.findAll({
        where: { followerId: currentUserId },
        attributes: ['followingId'],
      });

      const followingIds = followRecords.map(f => Number(f.followingId));

      // ✅ Include user's own posts too
      if (!followingIds.includes(currentUserId)) {
        followingIds.push(currentUserId);
      }

      console.log("🧭 Freshly fetched followingIds:", followingIds);
      if (!followingIds.length) {
        return res.status(200).json({ posts: [] });
      }

      const allFollowingPosts = await Post.findAll({
        where: {
          [Op.or]: [
            { userId: { [Op.in]: followingIds } }, // Their original posts
            {
              isRetweet: true,
              userId: { [Op.in]: followingIds }, // Their retweets
            },
          ],
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'profilePicture', 'privacy'], // ✅ ADDED privacy
          },
          {
            model: Post,
            as: 'originalPost',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'profilePicture', 'privacy'], // ✅ ADDED privacy
              },
            ],
          },
        ],
      });

      const formattedPosts = allFollowingPosts.map((post) => {
        console.log("🧱 Formatting post from:", post.user?.username, "→", post.content);
        return formatPost(post);
      });

      // 🔥 Sort everything first by createdAt DESC
      const sortedPosts = formattedPosts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // ✅ Then paginate AFTER sort
      const paginatedPosts = sortedPosts.slice(offset, offset + parseInt(limit));

      return res.json({
        posts: paginatedPosts,
        currentPage: parseInt(page),
        totalPages: Math.ceil(sortedPosts.length / limit),
        totalPosts: sortedPosts.length,
      });
    }

    // 🌍 "For You" feed or specific user's posts
    const whereCondition = userId ? { userId } : {};

    posts = await Post.findAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profilePicture', 'privacy'], // ✅ ADDED privacy
        },
        {
          model: Post,
          as: 'originalPost',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'profilePicture', 'privacy'], // ✅ ADDED privacy
            },
          ],
        },
      ],
    });

    const formattedPosts = posts.map(formatPost);

    // ✅ Age-weighted score formula
    const computeScore = (post) => {
      const hoursOld = Math.floor((Date.now() - new Date(post.createdAt)) / 3600000);
      const agePenalty = Math.log2(hoursOld + 2); // smooth decay

      return (
        (post.likes || 0) * 2.5 +
        (post.retweets || 0) * 3 +
        (post.commentCount || 0) * 1.5 -
        agePenalty
      );
    };

    const scoredPosts = formattedPosts.map((post) => ({
      ...post,
      score: computeScore(post),
    }));

    scoredPosts.sort((a, b) => b.score - a.score);

    return res.json({
      posts: scoredPosts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(scoredPosts.length / limit),
      totalPosts: scoredPosts.length,
    });
  } catch (err) {
    console.error('🚨 Error fetching posts:', err);
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
          attributes: ['id', 'username', 'profilePicture', 'privacy'],
        },
        {
          model: Post,
          as: 'originalPost',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'profilePicture', 'privacy'],
            },
          ],
        },
      ],
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
    // Step 1: Find all post IDs from this user
    const userPosts = await Post.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'content'],
    });

    if (!userPosts.length) {
      return res.status(404).json({ message: 'No posts found for this user.' });
    }

    const postIds = userPosts.map((post) => post.id);

    // Step 2: Find all Likes for these posts, including Notification + User + Post
    const likes = await Like.findAll({
      where: { postId: { [Op.in]: postIds } },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'profilePicture'],         },
        {
          model: Post,
          as: 'likedPost',
          attributes: ['content'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['username', 'profilePicture'], 
            },
          ],
        },
        {
          model: Notification,
          as: 'notification',
          attributes: ['id', 'isRead'],
          where: {
            isRead: false, // ✅ show only unread
          },
          required: true, // ✅ exclude likes with no matching unread notif
        }
      ],
      order: [['createdAt', 'DESC']],
    });

    if (!likes.length) {
      return res.status(404).json({ message: 'No likes found for your posts.' });
    }

    // Step 3: Format response
    const formatted = likes.map((like) => ({
      notificationId: like.notification?.id || null,
      postId: like.postId,
      postOwner: like.likedPost?.user?.username || 'Unknown',
      content: like.likedPost?.content || '',
      likedBy: like.user?.username || 'Unknown',
      profilePicture: like.user?.profilePicture || null, // ✅ include in response
      createdAt: like.createdAt,
      isRead: like.notification?.isRead ?? false, // ✅ Pull actual status
    }));

    res.status(200).json({ likes: formatted });
  } catch (error) {
    console.error('❌ Error fetching liked posts:', error);
    res.status(500).json({ message: 'Failed to fetch liked posts.' });
  }
});


// Optimized Client-Side Requests
// Instead of calling /like-status and /retweet-status for every post, we now batch fetch all 
// liked and retweeted posts at once.

// Batch fetch all liked posts for a user
router.get('/likes/batch', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const likedPosts = await Like.findAll({
      where: { userId },
      attributes: ['postId'],
    });

    res.json({ likedPosts: likedPosts.map((like) => like.postId) });
  } catch (error) {
    console.error('Error fetching batch like data:', error);
    res.status(500).json({ error: 'Failed to fetch batch like data.' });
  }
});

// Batch fetch all retweeted posts for a user
router.get('/retweets/batch', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const retweetedPosts = await Post.findAll({
      where: { isRetweet: true, userId },
      attributes: ['originalPostId'],
    });
    res.json({
      retweetedPosts: retweetedPosts.map((p) => p.originalPostId),
    });
  } catch (error) {
    console.error('Error fetching batch retweet data:', error);
    res.status(500).json({ error: 'Failed to fetch batch retweet data.' });
  }
});



/**
 * @route   GET /api/posts/:id/like-status
 * @desc    Check if the authenticated user has liked a specific post
 * @access  Private
 *  */
router.get('/:id/like-status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const existingLike = await Like.findOne({
      where: { postId: id, userId },
    });

    res.status(200).json({ liked: !!existingLike });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ error: 'Failed to check like status.' });
  }
});

/**
 * @route   GET /api/posts/:id/retweet-status
 * @desc    Check if the authenticated user has retweeted a specific post
 * @access  Private
 */
router.get('/:id/retweet-status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const existingRetweet = await Post.findOne({
      where: { userId, isRetweet: true, originalPostId: id },
    });

    res.status(200).json({ retweeted: !!existingRetweet });
  } catch (error) {
    console.error('Error checking retweet status:', error);
    res.status(500).json({ error: 'Failed to check retweet status.' });
  }
});

/**
 * @route   GET /api/posts/retweets
 * @desc    Get posts retweeted by the authenticated user
 * @access  Private
 */
// ✅ Full route using Retweet model directly
// router.get('/:id', authMiddleware, checkBlockStatus, async (req, res) => {
//   try {
//     const currentUserId = req.user?.id;

//     const post = await Post.findByPk(req.params.id, {
//       include: [
//         { model: Comment, as: 'comments' },
//         {
//           model: User,
//           as: 'user',
//           attributes: ['id', 'username', 'profilePicture', 'privacy'],
//           include: [
//             {
//               model: Follower,
//               as: 'followers',
//               attributes: ['followerId']
//             }
//           ]
//         },
//         {
//           model: Post,
//           as: 'originalPost',
//           include: [
//             {
//               model: User,
//               as: 'user',
//               attributes: ['id', 'username', 'profilePicture', 'privacy'],
//               include: [
//                 {
//                   model: Follower,
//                   as: 'followers',
//                   attributes: ['followerId']
//                 }
//               ]
//             }
//           ]
//         }
//       ],
//     });

//     if (!post) return res.status(404).json({ message: 'Post not found.' });

//     // 🔐 Privacy check: main post
//     const author = post.user;
//     const isOwner = author?.id === currentUserId;
//     const isFollower = author?.followers?.some(f => f.followerId === currentUserId);
//     const isPrivate = author?.privacy === 'private';

//     if (isPrivate && !isOwner && !isFollower) {
//       return res.status(403).json({ message: "This post is from a private account." });
//     }

//     // 🔐 Privacy check: original post (for reposts)
//     if (post.originalPost) {
//       const originalAuthor = post.originalPost.user;
//       const isOriginalOwner = originalAuthor?.id === currentUserId;
//       const isOriginalFollower = originalAuthor?.followers?.some(f => f.followerId === currentUserId);
//       const isOriginalPrivate = originalAuthor?.privacy === 'private';

//       if (isOriginalPrivate && !isOriginalOwner && !isOriginalFollower) {
//         return res.status(403).json({ message: "This repost is from a private account." });
//       }
//     }

//     const formattedPost = formatPost(post);
//     res.status(200).json({ post: formattedPost, comments: formattedPost.comments || [] });

//   } catch (error) {
//     console.error('Error fetching post:', error);
//     res.status(500).json({ message: 'An error occurred while fetching the post.' });
//   }
// });


/**
 * @route   GET /api/posts/:id
 * @desc    Fetch a single post with comments and user data
 * @access  Public
 */
router.get('/:id', authMiddleware.optional, checkBlockStatus, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: Comment, as: 'comments' },
        { model: User, as: 'user', attributes: ['id', 'username', 'profilePicture', 'privacy'] },
        {
          model: Post,
          as: 'originalPost',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'profilePicture', 'privacy'],
            },
          ],
        },
      ],
    });

    if (!post) return res.status(404).json({ message: 'Post not found.' });
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
    const category = categorizePost(content);
    const post = await Post.create({
      userId: req.user.id,
      content,
      mediaUrl,
      cryptoTag,
      category,
    });

    const populatedPost = await Post.findByPk(post.id, {
      include: [
        { model: User, as: 'user', attributes: ['username', 'profilePicture'] },
      ],
    });

    res.status(201).json({
      post: formatPost(populatedPost),
      message: 'Post created successfully!',
    });
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
router.post('/:id/like', authMiddleware, checkBlockStatus, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findByPk(id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const existingLike = await Like.findOne({ where: { postId: id, userId } });

    if (existingLike) {
      // 👎 Unlike
      await existingLike.destroy();
      post.likes = Math.max(0, post.likes - 1);
      await post.save();

      // Update all retweet versions of this post
      await Post.update(
        { likes: post.likes },
        { where: { originalPostId: id, isRetweet: true } }
      );

      return res.status(200).json({
        likes: post.likes,
        message: 'Like removed',
      });
    } else {
      // 👍 Like
      let newNotification = null;

      if (post.userId !== userId) {
        newNotification = await Notification.create({
          userId: post.userId,   // Recipient
          actorId: userId,       // Who liked
          type: 'like',
          entityId: String(post.id),
          entityType: 'Post',
        });

        console.log('✅ Notification created with ID:', newNotification.id);
      }

      const newLike = await Like.create({
        postId: id,
        userId,
        notificationId: newNotification?.id || null, // ✅ Attach it if created
      });

      console.log('✅ Like created with notification ID:', newLike.notificationId);

      post.likes += 1;
      await post.save();

      await Post.update(
        { likes: post.likes },
        { where: { originalPostId: id, isRetweet: true } }
      );

      return res.status(200).json({
        likes: post.likes,
        message: 'Post liked',
      });
    }
  } catch (error) {
    console.error('❌ Error liking/unliking post:', error);
    res.status(500).json({
      message: 'An error occurred while liking/unliking the post.',
    });
  }
});



/**
 * @route   POST /api/posts/:id/retweet
 * @desc    Retweet a post
 * @access  Private
 */
router.post('/:id/retweet', authMiddleware, checkBlockStatus, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const retweeterName = req.user.username;

    // Step 1: Fetch the original post
    const originalPost = await Post.findByPk(id, {
      include: [{ model: User, as: "user", attributes: ["id", "username", "profilePicture"] }],
    });

    if (!originalPost) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Step 2: Prevent duplicate retweet
    const existingRetweet = await Post.findOne({
      where: { userId, isRetweet: true, originalPostId: id },
    });

    if (existingRetweet) {
      return res.status(400).json({ message: "You have already retweeted this post." });
    }

    // Step 3: Create notification
    let newNotification = null;
    if (originalPost.userId !== userId) {
      newNotification = await Notification.create({
        type: "retweet",
        actorId: userId,
        userId: originalPost.userId,
        postId: originalPost.id,
        message: `${retweeterName} retweeted your post`,
      });

      console.log("✅ Notification created:", newNotification.id);
    }

    // Step 4: Create the retweet post
    const retweetedPost = await Post.create({
      userId,
      content: originalPost.content,
      mediaUrl: originalPost.mediaUrl,
      cryptoTag: originalPost.cryptoTag,
      isRetweet: true,
      originalPostId: originalPost.id,
      originalUserId: originalPost.userId,
      originalAuthor: originalPost.user?.username || "Unknown",
      originalProfilePicture: originalPost.user?.profilePicture || "http://localhost:5001/uploads/default-avatar.png",
    });

    // Step 5: Save it in the Retweets table with notificationId
    await Retweet.create({
      postId: retweetedPost.id,
      userId,
      notificationId: newNotification?.id || null, // ✅ Link notification
    });

    // Step 6: Update retweet count
    originalPost.retweets += 1;
    await originalPost.save();

    // Step 7: Fetch updated retweet with user info
    const populatedRetweet = await Post.findByPk(retweetedPost.id, {
      include: [{ model: User, as: "user", attributes: ["id", "username", "profilePicture"] }],
    });

    res.status(201).json({
      message: "Post retweeted successfully!",
      likes: originalPost.likes,
      retweets: originalPost.retweets,
      retweetData: {
        ...formatPost(populatedRetweet),
        retweets: originalPost.retweets,
        retweeterName: populatedRetweet.user?.username || "Unknown",
      },
      comments: 0,
    });
  } catch (error) {
    console.error("❌ Error retweeting post:", error);
    res.status(500).json({ message: "An error occurred while retweeting the post." });
  }
});



/**
 * @route   GET /api/posts/:id/interactions
 * @desc    Get users who liked or reposted a post
 * @access  Public (or Private if you prefer)
 */
router.get('/:id/interactions', authMiddleware.optional, checkBlockStatus, async (req, res) => {
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