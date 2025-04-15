const formatPost = (post) => ({
    id: post.id,
    userId: post.userId,
    author: post.isRetweet && post.originalPost ? post.originalPost.user.username : post.user.username, // Show original author for retweets
    profilePicture: post.isRetweet && post.originalPost ? post.originalPost.user.profilePicture : post.user.profilePicture || "https://solpulse.onrender.com/uploads/default-avatar.png", // Show original profile for retweets
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
  