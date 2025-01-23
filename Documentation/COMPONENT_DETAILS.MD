# Component Details (Part 1)

This file describes the detailed functionality and properties of specific components in the project.

## FollowButton.js
   - **Purpose**: Allows users to follow/unfollow others.
   - **Props**:
     - `userId`: ID of the user to follow/unfollow.
     - `isFollowing`: Boolean indicating current follow status.
   - **Usage**: Seen on `Profile` and `FollowersFollowing` pages to facilitate connection-building.

## Hashtag.js
   - **Purpose**: Enables hashtag functionality within posts.
   - **Props**:
     - `content`: Text content to parse for hashtags.
   - **Usage**: Used in post creation and detail components to highlight hashtags.

## LikeButton.js
   - **Purpose**: Lets users like posts.
   - **Props**:
     - `postId`: ID of the post being liked.
     - `isLiked`: Boolean to track current like status.
   - **Usage**: Primarily used in `Post` and `PostDetail` components.

## LikeRetweetButtons.js
   - **Purpose**: Combines both liking and retweeting functionalities.
   - **Props**:
     - `postId`: ID of the post.
   - **Usage**: Seen in `PostDetail` to support user interactions.

## MediaUpload.js
   - **Purpose**: Allows users to upload media files (images or videos) when creating posts.
   - **Props**:
     - `onMediaSelect`: Callback function to handle selected media.
   - **Usage**: Used in `PostCreation` for user-generated content.

# Component Details (Part 2)

## MessagePreview.js
   - **Purpose**: Shows a preview of messages in the `Messages` page.
   - **Props**:
     - `message`: The message content to display.
   - **Usage**: Used to give a quick overview of recent conversations.

## NavBar.js
   - **Purpose**: Provides navigation options for the application.
   - **Props**: None.
   - **Usage**: Displayed on every main page, allowing access to dashboard, profile, messages, and more.

## NotificationBell.js
   - **Purpose**: Shows a bell icon with unread notification count.
   - **Props**:
     - `unreadCount`: Number of unread notifications.
   - **Usage**: Used in `Dashboard` and `Notifications` pages.

## ParentComponent.js
   - **Purpose**: Acts as a parent or wrapper component.
   - **Props**: Varies based on use case.
   - **Usage**: Supports rendering of child components with shared styles or state.

## Post.js
   - **Purpose**: Renders an individual post with options to like, comment, or retweet.
   - **Props**:
     - `post`: Object containing post details (content, author, etc.).
   - **Usage**: Utilized in `Feed` and `PostDetail` to display posts.

# Component Details (Part 3)

## RetweetButton.js
   - **Purpose**: Allows users to retweet posts.
   - **Props**:
     - `postId`: ID of the post being retweeted.
   - **Usage**: Used alongside `LikeButton` in `PostDetail` and `Post`.

## SearchBar.js
   - **Purpose**: Enables users to search for posts, users, or crypto-related content.
   - **Props**:
     - `initialQuery`: Initial query text for the search.
     - `onSearch`: Callback function to handle search actions.
   - **Usage**: Used in `SearchResults` and `Dashboard` pages.

## UserCard.js
   - **Purpose**: Displays a user’s profile information.
   - **Props**:
     - `user`: Object containing user details.
   - **Usage**: Used in `FollowersFollowing` and `Profile` pages to show user info.
