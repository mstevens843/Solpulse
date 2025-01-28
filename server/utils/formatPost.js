// utils/formatPost.js

/**
 * Formats a post object to include only the necessary details for the frontend.
 * This function ensures consistency in how posts are structured across the application.
 *
 * Why this file was created:
 * - Reusability: Centralizes the logic for formatting posts, preventing duplication.
 * - Consistency: Ensures all posts have the same structure, whether they are original posts or retweets.
 * - Readability: Simplifies the controller logic by moving formatting responsibilities to a separate utility.
 
 * Formats a post object to include only the necessary details for the frontend.
 * Ensures uniform structure across the app for original posts and retweets.
 *
/**
 * @param {Object} post - The raw post object from the database.
 * @returns {Object} - The formatted post object.
 */
const formatPost = (post) => ({
    id: post.id,
    userId: post.userId,
    author: post.isRetweet && post.originalPost ? post.originalPost.user.username : post.user.username, // Show original author for retweets
    profilePicture: post.isRetweet && post.originalPost ? post.originalPost.user.profilePicture : post.user.profilePicture || "/default-avatar.png", // Show original profile for retweets
    content: post.content,
    mediaUrl: post.mediaUrl,
    cryptoTag: post.cryptoTag,
    likes: post.likes || 0,
    retweets: post.retweets || 0,
    isRetweet: post.isRetweet || false, // Identify retweets
    originalPostId: post.originalPostId || null, // Reference to the original post
    originalAuthor: post.isRetweet && post.originalPost ? post.originalPost.user.username : null, // Add original author explicitly
    originalProfilePicture: post.isRetweet && post.originalPost ? post.originalPost.user.profilePicture : null, // Add original profile picture explicitly
    retweetedAt: post.retweetedAt || null, // Add retweet timestamp
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
});
  