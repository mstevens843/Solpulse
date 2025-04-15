olPulse Project Updates (March 20 – April 4, 2025)

🛠 Implemented Features

Feed and Explore Enhancements

Category Filtering

Implemented local client-side filtering via UI tabs (Meme, NFT, Crypto, DAO, On-chain Drama, General).

Powered by keyword matcher utility (categorizePost.js).

Posts filter instantly without additional backend calls.

Infinite Scrolling

Resolved pagination issues (duplicates and reposts no longer interrupt loading).

Improved Intersection Observer logic for smooth continuous loading.

Ensured consistent sort order (createdAt DESC) from backend.

Repost Logic Refinements

Fixed repost count increment and persistence.

Implemented Undo Repost feature that correctly decrements repost count.

Improved UI consistency across Feed, Profile Feed, and Post Modal.

Synced repost states using AuthContext and sessionStorage.

Notifications Overhaul

Introduced notificationId linking for likes, retweets, comments, messages, follows, and tips.

NotificationsList component improvements:

Persistent active tab on refresh (localStorage).

Bulk Mark All as Read per tab.

Username duplication removed.

Profile pictures displayed consistently.

Improved sorting and selection UX.

Added optional message support to crypto tips:

Users can attach a short message (255 char limit).

Messages display alongside notifications clearly styled.

Signup UX Improvement

Replaced signup toast notification with a welcoming banner on Home Page.

Banner conditionally displays once per signup success.

Ensured smooth layout adjustments to prevent UI shifts.

Post Interaction Modal

New PostInteractionsModal.jsx component:

Displays users who liked or reposted posts.

Smooth tabbed interface ("Liked By" and "Reposted By").

User list includes avatars, usernames, and follow buttons.

🚀 Frontend Architecture & UI/UX Enhancements

Post Composer

Added emoji picker, character counter, and drag‑and‑drop uploads.

Profile Picture Management

Implemented image cropping and upload flow.

General UI Fixes

Improved feed layout stability, removed flickers, and reduced layout shifts.

Ensured posts and comments reliably display user avatars and usernames.

🔧 Backend Improvements

Database & Sequelize

Added category column to Posts table.

Integrated automatic categorization (categorizePost) during post creation.

Fixed Sequelize association alias conflicts (standardized on as: 'user').

Enhanced caching for search queries and suggestions using node-cache.

Introduced deletedAt column for soft deletes in Messages.

API Routes Optimization

Standardized retweet endpoints to ensure correct count handling.

Improved search endpoints for broader matching and better suggestions.

Extended notifications API to handle custom content/messages.

🐞 Bugs Squashed

Fixed UI crashes due to null object references in posts.

Resolved Sequelize eager-loading errors from association conflicts.

Corrected infinite scroll interruptions caused by repost duplicates.

Fixed retweet symbol and count not persisting after refresh.

Solved missing toast notification issues during tip transactions.

Ensured comment deletion UI reflects immediate updates.

💸 Crypto Tips Transaction Flow Improvements

Enhanced UX by assuming transaction success immediately after signing, avoiding delayed WebSocket confirmations.

Improved visibility and clarity of toast notifications with Solscan links.

Implemented optional user messages accompanying crypto tips.

🧪 Testing & Verification

Confirmed proper functioning across all new features through extensive manual testing (posts, reposts, notifications, tipping, comments).

Verified database migrations maintain backward compatibility.

📌 Current Application State

Fully functional features:

Follow/unfollow system

Emoji integration, content categorization, and infinite scrolling

Notification bell and comprehensive notification system

Robust tip transactions with improved UX and messaging

Consistent profile, post, and comment interactions across all components

Subsequent Updates

🔁 Community Feed & Following Tab Optimizations (2025‑04‑05)

Backend Enhancements

Ensured fresh fetch of follower data every time the “Following” feed is requested, preventing stale results.

Improved Sequelize query accuracy to reliably join posts with associated user data, resolving missing user issues.

Validated new user and post associations to eliminate null or undefined values returned by backend API.

Frontend Optimizations

Implemented forced state change logic to trigger consistent re‑fetching when switching between “For You” and “Following” tabs.

Added debounce logic to API requests on tab and page changes, reducing redundant network calls.

Enhanced infinite scroll functionality by correctly resetting pagination, post list, and unique ID tracking when filters or tabs change.

Strengthened frontend data integrity by explicitly handling missing user or originalPost.user fields, preventing runtime errors and warnings.

Bug Fixes & Stability Improvements

Fixed critical issue where newly created users/posts were not appearing in the “Following” feed due to stale frontend state and backend query caching.

Verified end‑to‑end flow ensuring new posts instantly reflect in the correct feed upon creation.

Addressed warning messages and ensured proper fallback behaviors for missing associated records.

🔁 Dark/Light Mode Integration & UI Enhancements (2025‑04‑06)

Theming & Tailwind Setup

Enabled darkMode: 'class' in Tailwind config to globally manage themes.

Updated root‑level CSS variables to handle Solana theme colors dynamically for dark/light modes.

Added transition-colors duration-300 globally for smooth dark/light transitions.

Settings Page Updates

Connected Settings toggle with backend API and local storage for persistent dark/light mode.

Adjusted .settings-container and .settings-form CSS to use dynamic theming (bg-white dark:bg-[#1f1f1f]) instead of hard‑coded colors.

Ensured toggle switch UI accurately reflects the user's theme selection.

Navbar Updates

Refactored Navbar to utilize dynamic theme styling (bg-white dark:bg-[#1f1f1f]), enabling automatic theme switching.

Updated CSS to maintain consistent Navbar appearance across themes.

Ensured Navbar responsiveness and mobile compatibility remains intact with dark mode updates.

🔁 Dark/Light Mode Overhaul (2025‑04‑05)

Backend Integration

Extended /api/users/settings to support theme updates (light/dark).

Synced Sequelize model and controller logic to persist theme in DB.

Returned theme in /users/me responses to hydrate frontend on login.

Frontend Logic

Read user?.theme from AuthContext → fallback to localStorage → fallback to system preference.

Updated App.js with multi‑tier theme sync logic across login/logout flows.

Added floating moon toggles to Landing and Signup.

Added 🌓 button to Navbar, styled with .theme-nav-toggle.

UI/UX Styling Pass

Converted hardcoded dark backgrounds and text to Tailwind @apply classes:

bg-white dark:bg-[#1f1f1f]

text-black dark:text-white

Applied across Settings, Landing, Signup, Home, Profile, Navbar, Notifications, Messages, Explore.

Updated all inputs, buttons, tabs, modals, and containers for dual theme compatibility.

Behavior Verification

Verified theme persists across refresh, logout, and re‑login.

Ticker, tabs, hover states, and toast alerts respond correctly to theme changes.

Responsive fallback to system preference for new visitors with no saved theme.

🔒 Privacy Settings & Toggle Implementation (2025‑04‑06)

Backend Enhancements

Added privacy attribute (public/private) to User model.

Updated backend routes (posts, search, users) to conditionally filter private content—accessible only by followers or authors themselves.

Modified /api/users/settings route to securely update privacy settings with validation.

Frontend & UI/UX Updates

Implemented real‑time privacy toggle in Settings page, matching the dark mode toggle UI.

Connected frontend toggle to backend privacy route, confirmed database update on toggle.

Stored privacy settings in localStorage for instant UI feedback and persistence.

Enhanced CSS for toggle consistency across “Dark Mode” and “Private Account.”

Testing & Debugging

Verified privacy changes reflected correctly in PostgreSQL database upon toggling.

Confirmed filtered results: posts, profiles, and search results respect privacy settings.

Resolved styling issues to ensure independent control of label text and toggle switch dimensions.

🔐 Privacy & Follow Request Feature Implementation (2025‑04‑07)

Backend Enhancements

Created FollowRequests table with Sequelize migrations, including routes to:

Send follow requests (POST)

Accept requests (PUT)

Deny requests (DELETE)

Cancel requests (DELETE)

Check if request already exists (GET)

Implemented route /incoming to fetch pending follow requests with requester details.

Added automatic notifications upon sending/accepting requests.

Frontend & UI Updates

Updated FollowButton component to handle private users:

Shows Requested state if a follow request is pending.

Allows sending/canceling requests directly via button toggle.

Enhanced UserCard and UserListItem components:

Added visual indicators (badges) for Requested status.

Passed down new onRequestToggle prop to manage UI state updates.

Added clear tooltips to inform users of follow button actions (e.g., “Request to follow private user,” “Click to cancel request”).

Notifications Integration

Integrated follow requests into the NotificationsList:

Merged incoming follow requests with regular follow notifications.

Added inline Accept/Deny buttons directly in notification items.

Ensured accepting/denying follow requests correctly updates notifications and follower state instantly.

Added custom sorting and filtering logic for notifications (newest, oldest, unread).

CSS & Accessibility

Styled new Requested button states and notification actions clearly.

Improved accessibility by adding ARIA attributes to follow buttons (aria-pressed, clear labeling).

🔁 Message Inbox & Outbox Implementation (2025‑04‑08)

Backend Enhancements

Created MessageRequests table and associated routes (send, accept, deny, cancel).

Added notificationId to both MessageRequests and messages for accurate notification tracking.

Implemented new /messages/sent route to fetch sent messages with recipient details.

Enhanced pagination and included detailed message sender/recipient data.

UI/UX Updates

Integrated Inbox/Sent tabs within Messages page with persistent state and pagination support.

Implemented Send Message modal with emoji picker, recipient search, recent recipient suggestions, and file attachments.

Added individual message read receipts with timestamp indicators.

Notifications

Included message requests in NotificationsList with actionable Accept/Deny buttons.

Ensured accepting message requests moves messages from requests to main inbox seamlessly.

🔒 Block & Mute User Functionality Integration (2025‑04‑09)

Backend Enhancements

Integrated blockUser and unblockUser routes for immediate profile‑level control.

Added muteUser and unmuteUser endpoints for suppressing specific user content without unfollowing.

Optimized fetching logic to accurately reflect block/mute status in user queries.

UI/UX Updates

Implemented a 3‑dot menu on the UserCard component for quick access to block/unblock actions.

Enhanced the FollowButton with a dropdown menu for unfollowing or muting directly from the “Following” state.

Ensured dropdowns auto‑close on outside click for improved UX.

Included dynamic indicators (▼) to clearly signal dropdown availability.

State Management Improvements

Maintained local isBlocked and isMuted states within UserCard and FollowButton components for immediate UI responsiveness.

Ensured consistent mute/block states persist across user sessions through optimized caching.

🔇 Mute & Block Functionality Integration (2025‑04‑10)

Backend Enhancements

Created dedicated API routes for fetching blocked and muted user IDs (/users/blocked, /users/muted).

Implemented logic to prevent messaging interactions with blocked users (returns 403 Forbidden).

Frontend Updates

Integrated global context state for tracking blocked/muted users across components.

Added conditional UI rendering across:

Messages: Prevent message submission to blocked users and visually indicate blocked status.

Posts & Modals: Hide or display warning banners on posts from blocked users; silently hide muted content.

Search Results: Completely removed blocked user results; muted users hidden under the users filter.

Interactions Modal: Filtered out blocked/muted users from likes and repost lists.

Profile UI:

Added dynamic Block and Mute toggle buttons with immediate state updates and toast notifications.

Implemented clear feedback with concise error messages (“You've blocked this user”) and graceful UI degradation for muted content.

Edge Case Handling

Added safeguards in Post.jsx, ExploreModal.jsx, and SearchResults.jsx to prevent direct URL access or search exposure for blocked/muted users.

Ensured profile visits to blocked users clearly indicate blocked status or fully restrict access.

🔁 Auth Token & Notifications Optimization (2025‑04‑11)

Backend Enhancements

Implemented route‑specific token exclusion logic in Axios interceptor, preventing unnecessary JWT headers on static data endpoints (/trendingCrypto, /trade).

Reordered Express.js routes to avoid Sequelize casting errors (22P02), resolving collisions between dynamic and static paths.

Improved PostgreSQL queries by explicitly handling incorrect string‑to‑integer casts, fixing errors for retweets, likes, and muted‑user queries.

Frontend & Auth Context Improvements

Enhanced AuthProvider to conditionally skip fetching likes and retweets on non‑interactive pages (e.g., Trending Crypto), optimizing performance.

Persisted global authentication state (auth/me) independently to maintain consistent navbar state.

Notifications UI/UX & Stability

Added muted‑user fetch logic to Notifications, ensuring notifications from muted accounts don't display.

Resolved notification page crashes by fixing incorrect endpoint handling and type coercion errors.

Refined notification sorting logic with robust filtering and graceful handling of muted accounts.

🚫 User Blocking System Enhancements (2025‑04‑11)

Backend Enhancements

Integrated BlockedUser model logic directly into /api/posts and /api/posts/trending routes, filtering out posts from blocked users.

Implemented middleware (checkBlockStatus) to centralize blocked user checks across post and comment routes.

Ensured blocked users are consistently hidden from “For You,” “Following,” and “Trending” feeds.

Added comprehensive Sequelize queries to exclude posts and retweets from blocked accounts.

UI/UX Updates

Adjusted the UserCard dropdown to correctly position beneath the Blocked button.

Added immediate UI feedback for block/unblock actions using toast notifications.

Ensured the Blocked button and dropdown menu correctly replaces the standard follow/message buttons.

Comment & Interaction Filtering

Extended block logic into comment routes, preventing blocked users from adding/viewing comments.

Added backend filters (checkBlockStatus) to comment creation, fetching, and detailed notification routes.

Planned frontend comment modal safeguards to further exclude blocked users visually.

⚙️ Auth & API Optimization for Selective Token Usage (2025‑04‑11)

🔐 Authentication Routing Enhancements

Updated Axios interceptor to conditionally skip token injection for static API routes like /trendingCrypto, /trade, and future chart‑only pages.

Implemented .toLowerCase().startsWith(route) logic for accurate matching of excluded routes regardless of trailing paths.

Preserved /auth/me request universally to keep navbar state and user context synced, even when skipping likes/retweets.

🧠 AuthProvider Context Optimization

Introduced skipLikesAndRetweets boolean logic in AuthProvider.js based on the current URL using window.location.pathname.

Likes and retweets batch fetch logic now conditionally runs only if the current route is not excluded (e.g., /trending-crypto).

Maintains auth/me request globally to ensure authentication state and theme logic load properly across all pages.

🚫 PostgreSQL Route Collision Fixes

Fixed critical Express route order issues causing PostgreSQL 22P02 errors by:

Moving /users/muted before /users/:id

Moving /posts/likes, /posts/retweets before /posts/:id

These changes prevent “muted” and “retweets” from being treated as string‑based primary keys by Sequelize, which led to invalid cast errors (pg_strtoint32_safe).

🧩 Notification Page Hardening

Investigated and resolved silent 500 errors in the Notifications tab due to backend interpreting “muted” or “retweets” as IDs.

Added fallback handling and debug logging for all notification types (likes, retweets, messages, tips, etc.).

Confirmed muted user list correctly filters out users during fetch and sort without corrupting DB queries.

🔔 Follow Request & Notification System Optimization (2025‑04‑12)

Backend Enhancements

Added notification creation when sending a follow request, linking it explicitly to the request.

Updated incoming follow request route to consistently return notificationId, actor, message, and isRead fields.

Implemented robust error handling and response structure for follow‑request actions (send, accept, deny, cancel).

Enhanced accept route logic to:

Create a started following you notification upon acceptance.

Properly link notifications to the new follower record.

Frontend & UI Improvements

Adjusted frontend mapping logic in NotificationsList.jsx to correctly utilize notificationId, ensuring seamless integration with backend responses.

Ensured notifications display actionable buttons for accepting or denying follow requests directly within the notification interface.

Fixed incorrect notification API endpoint calls to resolve frontend fetching errors.

Improved error messaging for network and API issues to enhance UX clarity.

Bug Fixes

Resolved critical 404 errors on follower notification API calls.

Fixed incorrect Axios URLs causing “Network Error” messages.

🔁 Follow & Message Request System Overhaul (2025‑04‑12)

Backend Enhancements

Added cancel and deny routes for both FollowRequests and MessageRequests.

Updated logic to prevent duplicate pending requests (409s only trigger on true duplicates).

Automatically remove associated notifications when requests are canceled or denied.

Extended models to include message content in message requests and status fields in follow requests.

UI/UX Updates

Added dropdowns to Request Pending states in both FollowButton and MessageButton with cancel actions.

Display Follow Back dynamically when appropriate.

Converted modal toast alerts to react-toastify and ensured modals only close on success.

Notifications & Inbox

Refined notification filters to exclude accepted/denied requests.

Updated notification logic to favor Accept/Deny/Cancel over Mark as Read for actionable items.

Added Sent tab to the Messages page with pagination and accurate sender/recipient logic.

🔥 Account Deletion (Settings Page) (2025‑04‑12)

Soft Delete EndpointAdded DELETE /api/users/delete route using Sequelize’s paranoid mode to soft‑delete the user by setting deletedAt instead of removing the record.

**Frontend Integration