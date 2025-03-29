## Codebase Review 

## BACKEND (Node.js + PostgreSQL)
- **Rate Limiting**: Implemented with `express-rate-limit` to protect API endpoints. 
- **Input Validation**: Strengthened using `express-validator` and custom middleware.
- **Security Headers**: Added `helmet`, CORS settings, and disabled X-Powered-By. 
- **Auth Middleware**: Split out clean `requireAuth`, `isUser`, `isAdmin` helpers. 
- **Logging**: Added request logs, error logs, and tracking with timestamps. 



## FRONTEND (React + Tailwind.css):
- **Lazy Loading**: `Profile`, `Feed`, and `CryptoTicker` load content only when in viewport. 
- **Error Boundaries**: Reusable component now wraps around core pages. 
- **Infinite Scroll**: Replaced pagination in `Feed` using `IntersectionObserver`. 
- **On-Demand Chart Loading**: CryptoTicker only fetches chart data on click. 
- **Component Optimizations**: `LikeButton`, `PostComposer`, `NotificationsList`, and `Messaging` now have better error handling and performance. 
- **Modular Styling**: Tailwind classes moved to reusable external CSS files where needed. 


## DATABASE (PostgreSQL): 
- Normalized Schema with optimized indexes on foreign keys, `createdAt`, and commonly queried fields.
- Soft deletes and timestamps added. 
- Migration system well-documented with full table of contents in README. 



## Blockchain Integration (Solana):
- Wallet connection detection auto-triggers prompt in CryptoTip. 
- Live Transaction status shown for tips via `getSignatureStatus`. 
- Fallbacks for failed wallet loads, malformed tokens, and network issues. 
+ - Full token swap integration using **Jupiter Aggregator API**.
+ - Built custom swap flow: coin selector → quote → route → execute.
+ - Executes serialized swap instructions directly through connected wallet.





### Features I Want to Add (Wish List) 
- **Chart Modal Enhancements**: 
    - Technical inidicator overlays (RSI, MACD). 
    - Toggle between candle and line charts. 
- **Comment System**: under posts (with reply support)
- **Portfolio Tracker**: Visual chart of user wallet holdings over time. 
- **Scheduled Posts**: (queue a tweet-like post for later). 
- **Mobile Responsiveness**: for Messaging Interface. 
- **Notification Archive**: or swipe-to-dismiss on mobile. 
- **Pin a Post to Profile** 
- **Search by Tags/Keywords** within posts. 





### Project Architecture 
| Layer             | Tech Stack               | Description                                                                    |
|-----------------  |--------------------------|--------------------------------------------------------------------------------|
| Frontend         | React, Tailwind, Vite    | SPA wit lazy loading, reusable components, modal system, and responsive design  |
| Backend          | Express.js, Node.js      | RESTful API with JWT auth, rate limiting, logging, and validation               |
| Database         | PostgreSQL + Sequelize   | Normalized schema, migrations, soft deletes, timestamps, indexes.               |
| Blockchain       | Solana Web3.js           | Phantom wallet integration, SPL token support, transaction validation           |


🧱 Architecture Overview
1. Frontend: React (Vite) + Tailwind CSS, global state via AuthProvider, protected routes, modular pages and components

2. Backend: Node.js + Express, Sequelize ORM with PostgreSQL, REST API, WebSockets, structured error handling

3. Authentication: JWT-based, custom AuthProvider, route protection middleware, 7-day token expiry with refresh logic (planned)

4. Database: Relational schema with proper indexing, cascade deletes, ENUM constraints, and soft deletes

5. Blockchain Integration: Phantom Wallet support, on-chain swaps via Jupiter API, Solana balance and transaction tracking

6. Real-Time Features: WebSockets for messaging and planned tipping notifications; heartbeat & reconnect logic

7. Deployment: Render (backend), Vercel (frontend), .env configs for dev/production, PM2 for process management


🔧 What I Built From Scratch
1. Full Sequelize schema with migrations and associations

2. JWT authentication flow + custom React context

3. Feed system with infinite scrolling and batching

4. WebSocket-based real-time messaging with read receipts

5. Crypto wallet integration + tipping system with live confirmation

6. Coin price charts with multiple timeframes (fetched on-demand)

7. Custom rate limiting, error logging, and token validation logic




### Challenges & Solutions 
| Challenge                       | Solution                                                       |
|---------------------------------|----------------------------------------------------------------|
| CoinGecko Rate Limits           | Debounced chart fetching & only trigger fetch on modal open.   |
| Image Errors from API's         | Reusable `FallbackImage` component added accross app.          |
| WebSocket Testing in Cypress    | Refactored route for testable WebSocket event simulation.      |
| Scroll Performance in Feed      | Swtiched to `IntersectionObserver` & deduplicated posts.       |   
| Handling Wallet Disconnections  | Added auto-detection & reconnect prompts.                      |   
| Optimistic UI for Likes         | Added local state updates before server response.              |   
| User Privacy for Wallets        | Only show wallet address if user shares it explicitly.         |   






### Additional Engineering Highlights
These advanced features, practices, and future-focuesed ideas reflect my commitment to writing clean, scalable and production-ready code. 

## Testing Strategy
- Backend: Unit and integration tests using Jest + SuperTest for key routes (auth, posts, tipping). 
- Frontend: Component-level tests for `LikeButton`, `PostComposer`, `CryptoTip`, etc. using React Testing Library. 
- Future: Exploring Cypress for full E2E testing (Login -> Post -> Like -> Logout FLow)


## Accessibility Considerations
- Semantic HTML and proper `aria-labels` added for interactive elements. 
- Color contrast tested for visually impaired users. 
- Keyboard navigation supported for buttons, modals, and input fields. 


## Basic Monitoring & Analyitcs 
- Custom logging middleware tracks API usage and errors with timestamps 
- Transaction logs capture wallet interactions for debugging blockchain events. 


## Deployment & CI/CD 
- Hosted on Render.com with auto-redeploy on every main branch push. 
- PostgreSQL database hosted remotely with secure credentials management. 
- Migrations run as part of deploy pipeline using Sequelize CLI 


## Git Workflow & Versioning 
- Feature-based branching: `feature/add-like-button`, `bugfix/feed-scroll-fix`, etc. 
- Clear, descriptive commit messages (no 'final-final-v3) 
- Tagged versions (v1.0-beta, v1.1 live) mark stable milestones. 




## API Documentation & DX
- RESTful API with consistent JSON response: 
{ "status": "success", "data": {...}, "message": "..." }
- Error handling middleware returns helpful feedback with appropriate status codes. 
- All routes documented in backend README and tested via Insomnia. 



## Security Best Practices 
- Password hashed with `bcrypt` before storage. 
- JWT-based authentication with short expiration and refresh strategies planned. 
- CORS configured by environment (dev vs prod). 
- No hardcoded secrets or exposed keys in frontend bundle. 





#### Data Flow System & Architecture (End-to-End)
- **Auth**: User logs in (email/password or wallet). JWT is issued. 
- **Frontend Context**: React AuthContext tracks session, tokens, and rehydrates on load. 
- **Social**: Posts, likes, and tips flow through protexted Express routes. 
- **Market Data**: CoinGecko fetches token prices + trends. Chart.js renders live. 
- **Swap Engine**: Jupiter API fetches swap route. Wallet signs. UI confirms. 
- **Notifications**: Built-in system for follows, likes, coments, and tips (more)




## 3. Strongest Feature
Trade Page - Custom On-Chain Token Swaps
One of the most powerful features of SolPulse is the integrated DEX experience. 
- Users connect their Phantom wallet and can swap any SPL token inside the app. 
- Uses Jupiter's Swap API to fetch the best route. 
- I built a full coin selector, price display, slippage control, and real-time quote logic. 
- Fetches serialized swap instructions and exectues them via the connected wallet. 
- Handles errors, gas warnings, UI state, and loading/confirmation UX. 

✅ This isn't just embedding a widget --- its a custom trading interface that speaks directly to Solana's RPC and Jupiter's routing layer. 


### How the Custom Swap Flow works (Solpulse Trade System) 
1. **Token List Fetch**: Pulls Solana token list from Jupiter. 
2. **User Selection**: User selects `fromToken`, `toToken`, and amount. 
3. **Swap Quote**: Calls `fetchSwapQuote()` from Jupiter API. 
4. **Build Transaction**: Fetches serialized swap instructions. 
5. **Wallet Execution**: User signs and confirms via Phantom wallet. 
6. **Confirmation**: Swap is confirmed on Solana explorer and UI updates. 
also mention 
"Unlike embedding a widget, I built this flow from scratch to control the UX, route logic, error handling, and real-tie feedback using Solana Web3
and Jupiter's raw endpoints." 







## 4. Common Interview Q&A 
What's the most technically complex part of SolPulse? 

My Answer:
The `Trade Page`. Building a trading experience on Solana required deep understanding of:
- Jupiter's swap API's (quote -> route -> serialized tx) 
- Web3.js transaction creation & signing 
- Wallet UX (feedback, confirmation, failures) I had to build every layer from UI -> API -> RPC. 


How do you ensure security when executing trades ?

All instructions are verified against the wallet's public key, and I display clear previews before 
confirmation. No private keys are ever touched --- swaps execute directly through Phantom using 
secure instructions from Jupiter. 


What would you do next with the Trade feature? 
- Add historical trade tracking profile 
- Enable limit orders or DCA strategies 
- Build a `trade performance dashboard` to track ROI. 


How did you handle authentication and protect routes? 
- I used JWT tokens with a custom `AuthProvider` in React and token validation middleware in Express. 
Tokens are stored in `localStorage`, and protected routes use headers like `Authorization` and `x-auth-token`. 


2. How is your database structured and optimized ? 
I designed the schema using Sequelize, with proper indexing (e.g. `walletAddress`, `postId`) and cascade delete. 
I normalized many-to-many relationships like Likes, Retweets, and Followers. 


3. How do you handle real-time features? 
I implemented WebSockets for notifications and future tipping updates. I ran heartbeat checks, handled reconnections, 
and planned to move to Redis Pub/Sub for scalability. 


4. What was the hardest bug you fixed. 
Definitely authentication persistence + flaky CI tests. Tokens were invalid across environments, so I isolated the issue 
to header formatting and token expiry logic. Fixed it by centralizing validation and extending Cypress test JWTs. 


5. How do you ensure scalability and performance? 
Indexed queries, used rate limiters, optimized Sequelize hooks, added caching for external API requests (CoinGecko), and 
minimized client-side re-renders with useMemo and lazy loading. 





## 5. Mention Auth Strategy in Backend + Frontend
JWT-based Auth across backend and frontend, including middleware like `authMiddleware`, ownership 
checks (`checkOwnerShip.js`), and token validation via custom helpers. Tokens stores in `localStorage`
and handled globally via React Context. 



## 6. Brag About your Docs & Middleware
Add to API documentation & DX
- Extensive README docs cover:
    - API structure & route breakdown
    - Authentiation (backend + frontend)
    - Trade flow using Jupier API 
    - System architecture and project roadmap 
- Ownership middleware ensures only users can modify their content. 
- Frontend axios interceptors automatically inject tokens into secure requests. 


| Phase | Milestone                        | Status     |
|-------|----------------------------------|------------|
| 1     | Project Setup & API Integration | ✅ Complete |
| 2     | Wallet & Auth Integration       | ✅ Complete |
| 3     | Social Features (Post, Like)    | ✅ Complete |
| 4     | Tipping & Wallet History        | ✅ Complete |
| 5     | Market Data + Trending          | ✅ Complete |
| 6     | Trading Page (DEX)              | ✅ Complete |
| 7     | Beta Testing & Deployment       | ✅ Complete |










### CODEBASE REVIEW IN-DEPTH

#### BACKEND
## RATE LIMITING

# A mechanism to control how many requests a user or client can make to your API within a specific timeframe (ex: 100 request per 15 minutes) 
- Prevent `abuse`, like brute-force attacks or DDoS attempts
- Reduce serer load. 
- Ensures `fair usage` of API resources 

# How it works
- You deine a max number of requests per IP per tie window. If a client exceeds it, they get `429 Too Many Requests` response

// routes/middleware/rateLimit.js
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export default limiter;

// app.js or server.js
import limiter from './middleware/rateLimit.js';
app.use(limiter); // apply globally




## INPUT VALIDATION 
- Checks incoming user input (query params, form data, JSON body) to ensure it meets required formats and constraints. 

# Why it's used 
- Prevents invalid or `malicious input` from reaching the database. 
- Protects against `injection attacks`, broken logic, and API misuse. 
- Helps return clean error messages to frontend users. 

# How it Works 
- You define validation chains per route, check for errors using `ValidationResult`, and return early if input is invalid. 


# How Its implemented 
// middleware/validateUser.js
import { body, validationResult } from 'express-validator';

export const userValidationRules = [
  body('username').isAlphanumeric().isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};


// routes/auth.js
import { userValidationRules, validate } from '../middleware/validateUser.js';

router.post('/register', userValidationRules, validate, async (req, res) => {
  // Proceed knowing input is clean
});




### Security Headers 
- HTTP headers that enforce secure browser behavior (like disallowing `iframe` embedding, cross-site scripts, etc.)
# Why it's Used
- Prevents XSS, clickjacking, and MIME sniffing attacks. 
- Obscures backend tech stack (removing `X-Powered-By: Express`)
# How it Works 
`helmet` sets these headers automatically. You can tweak settings depending on app needs. 

# How its Implemented:
import helmet from 'helmet';
import cors from 'cors';

app.use(helmet()); // Sets many secure headers
app.disable('x-powered-by'); // Hide Express fingerprint
app.use(cors({ origin: 'https://your-frontend.com' })); // Whitelist CORS

# HEADERS Set INCLUDE:
- Content-Security-Policy
- X-Frame-Options 
- Strict-Transport-Security
- X-XSS-Protection (deprecated but still good)
- X-Content-Type-Options



### Auth Middleware 
# What it is 
- Middleware functions that check whether a user is authenticated and authorized for specific actions. 
# Why it's used
- Enforces `protected routes`
- Ensures only the correct users can perform actions like editing profiles or deleting data. 
# How it Works 
- You decpde tje JWT token, verify it, and attach the user data to `req.user`. Middleware then checks roles (`isAdmin`)
or ownership (`isUser`). 

# How Its Impelemented
// middleware/auth.js
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../config.js';

export function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error();

    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export function isUser(req, res, next) {
  if (req.user?.username === req.params.username) return next();
  return res.status(403).json({ error: 'Forbidden' });
}

export function isAdmin(req, res, next) {
  if (req.user?.isAdmin) return next();
  return res.status(403).json({ error: 'Admin access required' });
}


// routes/users.js
router.get('/:username', requireAuth, isUser, async (req, res) => {
  // Only the correct user can access this route
});






### Logging 
# What it is:
- Systematocally recording events like incoming requests, errrors, and system activity. 
# Why it's used" 
- Essential for `debugging`, monitoring, and analytics. 
- Helps trace who did what, when. 
- Can help identify `unusual behavior`, abuse, or API misuse. 

# How it Works: 
- You log requests details (method, path, timestamp, user agent), and separately log errors with stack traces. 

# How it's implemented

// middleware/logger.js
export function requestLogger(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}

export function errorLogger(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ERROR: ${err.stack}`);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
}


// app.js
import { requestLogger, errorLogger } from './middleware/logger.js';

app.use(requestLogger); // Logs all requests
app.use(errorLogger); // Catches and logs all errors











#### FRONTEND

### Lazy Loading 
# What it is 
- Loading components or data only when they enter the viewport, instead of initial 
# Why it's Used: 
- `Improves performance` by reducing initial bundle size. 
- Speeds up `First Contentful Paint (FCP) and Time to Interactive (TTI)`/ 
- Especially usefule for heavier views like `Profile`, `Feed`, `CryptoTicker`. 

# How it Works 
- Uses React's `lazy` and `Suspense` to defer component loading until needed 

# How it's impleemented 
// App.jsx
import { lazy, Suspense } from 'react';
const Profile = lazy(() => import('./pages/Profile'));
const Feed = lazy(() => import('./pages/Feed'));
const CryptoTicker = lazy(() => import('./components/CryptoTicker'));

<Suspense fallback={<div>Loading...</div>}>
  <Routes>
    <Route path="/profile/:username" element={<Profile />} />
    <Route path="/feed" element={<Feed />} />
    <Route path="/market" element={<CryptoTicker />} />
  </Routes>
</Suspense>




### Error Boundaries 
# What it is 
- A React component that `catches JavaScript errors` in it's child component tree, logs them, and renders a fallbakc UI. 
# Wny its Used 
- Prevents `app-wide crashes` from unhandled component errors 
- Improves user experience with clean fallback UI and error recovery. 
# How it Works 
- Uses a class component implementing `componentDidCatch` and `getDerivedStateFromError. 
# How its Implemented
// components/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Error caught by ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-red-600">Something went wrong.</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;


// index.jsx or App.jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>








#### Infinite Scroll 
# WHat it is:
- Automatically fetches and renders more content when the user scrolls to the bottom, instead of using page numbers or "Load More"
buttons. 
# Why it's Used: 
- Enhances user experience in dynamic content feeds. 
- Keeps the scroll flow fluid on dynamic content feeds. 
- Boosts engagement 

# How it works 
- Uses the `IntersectionObserver API` to trigger a callback whren a sentential (invisible div) becomes visible. 


# How it's implemented 
// Feed.jsx
const observer = useRef();
const lastPostRef = useCallback(node => {
  if (loading) return;
  if (observer.current) observer.current.disconnect();

  observer.current = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && hasMore) {
      fetchMorePosts(); // Fetch next page of posts
    }
  });

  if (node) observer.current.observe(node);
}, [loading, hasMore]);





### On-Demand Chart Loading 
# What it is: 
- Instead of preloading chart data for every coin, chart data is `fetched only when the user clicks` to view it. 
# Why it's Used 
- Prevents `wasting API calls` (esp with CoinGecko Rate limits)
- Speeds up initial page load
- Improves `perceived performance` 
# How it works: 
- The `onClick` handler opens a modal and `conditionally fetches chart data` only if not cached. 

# How It's Implemented 
const handleCoinClick = async (coinId) => {
  setSelectedCoin(coinId);
  if (!chartCache[coinId]) {
    const data = await fetchChartData(coinId);
    setChartCache(prev => ({ ...prev, [coinId]: data }));
  }
  setShowChart(true);
};





### Component Optimizations 
Applies to:
`LikeButton`
`PostComposer`
`NotificationsList`
`Messaging`
# What it is:
- Targeted refactors to improve `performance`, `error handling`, and `UX flow`. 

# Why it's Used: 
- Reduce re-renders 
- Imrprove response to network errors. 
- Avoid unnecessary fetches or DOM updates. 

# How it's Implemented: 
- `LikeButton` uses `debounced state`, optimistic UI updates, and better ARIA support. 
- `PostComposer` has `drag & drop support`, `file validation`, and retryable uploads. 
- `NotificationsList` supports `bulk actions`, better `sorting` and `empty state` UX. 
- `Messaging` uses `WebSockets` for real-time updates and stores read state per message. 

# Example from `Like Button` 
const handleLike = async () => {
  try {
    setLiked(!liked); // Optimistic UI
    await api.post(`/posts/${postId}/like`);
  } catch (err) {
    setLiked(prev => !prev); // Rollback on error
    toast.error("Failed to like post.");
  }
};




### Modulat Styling
# What it is: 
- Moving Tailwind class definitions into `external .css` or `.module.css files` when they're long, reused, or dynamic. 
# Why it's Used: 
- Keeps JSX cleaner. 
- Encourages `reuse` of common styles. 
- Avoids Tailwind class bloat in components

# How it works:
- You define utilities like this:

/* styles/utilities.css */
.card-hover {
  @apply transition-all shadow-md hover:shadow-xl rounded-2xl;
}

.fade-in {
  @apply animate-fadeIn opacity-0 animate-delay-100;
}

And then use:
<div className="card-hover fade-in">Hello</div>


Or in PostCard.module.css:
.postCard {
  @apply bg-white p-4 rounded-xl shadow-sm hover:shadow-md;
}








##### DB SETUP 

### Normalized Schema with Optimized Indexes 
# What it is 
- A `normalized` PostgreSQL schema avoids data redundancy by separating related data into different tables and using 
and using `foreign keys` to connect them. 

# Why it's Used
A `normalized` PostgreSQL schema avoids data redundancy by separating related data into different tables and using 
`foriegn keys` to connect them. 

# Why it's Used: 
- `Data Integrity` (no duplicate or inconsistent needs) 
- `Performance Optimization` through `indexes` on commonly filtered/joined fields. 
- Enables `scalable and maintainable` data relationships. 

`How it's Implemented` 
-- Example: posts table
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Optimized indexes
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_deleted_at ON posts(deleted_at);



- These indexes support: 
  - Fast feed loading (`ORDER BY created_at DESC_`)
  - User-specific queries (`WHERE user_id = $1`) 
  - Filtering out soft-deleted content (`WHERE deleted_at IS NULL`) 




### SOFT Deletes and Timestamps 
# What it is:
- Instead of deleting a row from the database, you mark it as deleted using a `deleted_at` timestamp. 
- Timestamps like `created_at` and `updated_at` help track record history. 

# Why it's Used:
- `Recoverability`: Deleted records can be restored 
- `Audit Trails`: Know when somethingh was created or modified. 
- `Filtering Logic`: Hide 'deleted' records from users but still retain for analytics or moderation. 


# How it works: 
- Use `deleted_at IS NULL` in queries to only show active records. 
- Optionally cascade soft-deletes manually (deleted user's posts) 


# How it's Implemented: 
-- In SQL migration
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP;

-- In Sequelize or Prisma (example)
timestamps: true,
paranoid: true, // enables soft delete by setting deletedAt

# In Queries: 
SELECT * FROM users WHERE deleted_at IS NULL;





#### Migration System with Full Table of Contents: 
# What is Is: 
- A versioned, descriptive system of datbase changes using timestamped migration files. 
# Why it's Used 
- Enables `safe, trackable schema changes`
- Makes onboarding and deployment easier
- Keeps `history of every change` to the database 

# How it Works
- Each migration file includes `up` (apply changes) and `down` (rollback changes) steps 
- You document each migration in the `README` with a table of contents 

├── migrations/
│   ├── 20240101120000-create-users.js
│   ├── 20240102150000-create-posts.js
│   ├── 20240103100000-add-soft-delete-to-posts.js


### 📋 Migration Table of Contents

| #   | Migration Filename                               | Description                         |
|-----|--------------------------------------------------|-------------------------------------|
| 1   | 20240101120000-create-users.js                   | Creates `users` table               |
| 2   | 20240102150000-create-posts.js                   | Adds `posts` table with FKs         |
| 3   | 20240103100000-add-soft-delete-to-posts.js       | Adds `deleted_at` column to posts   |
















#### BLOCKCHAIN INTEGRATION (SOLANA) 

## WALLET CONNECTION DETECTION: 

# What it is 
- automatic wallet connection that triggers the Solana wallet prompt (e.g. Phantom) if not connected when a user tries to send
a tip. 

# Why It's Used: 
- StreamLines the user experience --- no need to click "Connect Wallet" manually. 
- Ensures all tip actions are wallet-bound. 

# How it Works: 
- Uses the `window.solana` object (standard Solana procider injection) 
- On `CryptoTip` mount or button click, checks if a wallet is connected. 
- If not, it calls `window.solana.connect(), prompting the user. 

# How it's Implemented: 
useEffect(() => {
  if (!walletConnected && window.solana?.isPhantom) {
    window.solana.connect({ onlyIfTrusted: true }).catch(() => {
      // fallback if user not previously connected
    });
  }
}, []);




### Live Transaction Status with `getSignatureStatus`
# What it is: 
- After a user sends a tip, the app polls Solana's RPC via `getSignatureStatus` or `confirmTransaction` to track confirmation status 
in real time. 

# Why It's Used: 
- Gives instant UX feedback (ex: `Pending`, `Confirmed`, `Failed`) 
- Essential for `on-chain interactions` to maintain trust and transparency. 

# How it Works 
- After sending a tip transaction l grab the returned `signature`. 
- Use Solana's RPC API to fetch the confirmation status until it resolves. 

# How its implemented 
const connection = new Connection(clusterApiUrl('mainnet-beta'));

const checkStatus = async (signature) => {
  const status = await connection.getSignatureStatus(signature);
  const confirmation = status?.value?.confirmationStatus;
  setStatus(confirmation); // e.g., "processed", "confirmed", "finalized"
};

useEffect(() => {
  if (signature) {
    const interval = setInterval(() => checkStatus(signature), 1500);
    return () => clearInterval(interval);
  }
}, [signature]);





### Robust FallBacksw
# What it is: 
Catching and handling edge cases like: 
- No Wallet Detected
- Invalid/malformed token metadata 
- RPC/network timeout or rate-limit

# Why it's Used: 
- Prevents app crashes and broken flows. 
- Gives users `meaningful error messages` and retry options 

# How it Works: 
- Wraps wallet actions in try/catche
- Display fallback UIs (ex: 'Wallet not Detected', 'Try Again') 

# How its Implemented 
const handleTip = async () => {
  if (!window.solana) {
    setError("Solana wallet not detected.");
    return;
  }

  try {
    const tx = await sendTipTransaction();
    setSignature(tx);
  } catch (err) {
    setError("Transaction failed. Please try again.");
  }
};






### Full Token Swap with Jupiter Aggregator API 
# What it is: 
- Deep integration with Jupiter -- Solana's leading `DEX Aggregator` - to allow users to swap tokens
directly inside your app. 

# Why it's Used 
  - Enables on-the-fly SOL -> SPL OR SPL -> SPL swaps 
  - Taps into `best route pricing` across Serum, Orca, Raydium, Meteora, etc. 
  - Keeps the user inside your platform instead of redirecting. 





### Custom Swap Flow: Selector -> Quote -> Route -> Executes
# What it is: 
a 4-step user flow designed around Jupiter's API: 

1. `Coin Selector`: User picks input/output tokens (ex: Sol -> BONK) 
2. `Quote`: get best price  expected output. 
3. `Route`: retrieve swap instructions 
4. `Execute`: serialize + send instructions through wallet. 


# How it Works: 
- Uses `/quote` and `/swap` endpoints from Jupiter's REST API. 
- Builds a serialized transaction with Jupiter's response. 
- Signs and sends via `wallet.signAndSendTransaction`

# How it's implemented: 
// Step 1: Quote
const quote = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${fromMint}&outputMint=${toMint}&amount=${amount}`);

// Step 2: Get Swap Route
const route = quote.routes[0];

// Step 3: Get Serialized Swap Tx
const { swapTransaction } = await fetch("https://quote-api.jup.ag/v6/swap", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    route,
    userPublicKey: wallet.publicKey.toString(),
  }),
}).then(res => res.json());

// Step 4: Send Tx
const tx = Transaction.from(Buffer.from(swapTransaction, "base64"));
const signature = await wallet.sendTransaction(tx, connection);

