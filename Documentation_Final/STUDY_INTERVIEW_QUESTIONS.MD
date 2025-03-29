### SolPulse Interview Prep Kit

## 1-second Elevator Pitch:
“It’s Twitter meets CoinGecko — with real-time tipping and on-chain trading built for Solana.”


## 1. 30-Second-Elevator-Pitch:
"Solpulse is a full stack social platform built for the Solana ecosystem. Think of it like Twitter meets CoinGecko 
& Jupiter. With real-time market data, wallet integration, tipping, messaging, and on-chain token trading. I built 
the entire app from scratch using React, Node.js, PostgreSQL, and Solana Web3, with full trading capabilities
powered by Jupiter's swap API and custom swap execution logic. It's modular, performant, and battle tested."

## 1. 1-Minute-Elevator-Pitch:
SolPulse is a full-stack crypto social platform I built from scratch, kind of like Twitter meets CoinGecko Meets Jupiter but for
the Solana ecosystem. Users can post content, follow others, tip in SOL or SPL tokens, and even trade tokens directly inside the
app using a custom integration with the Jupiter Aggregator API -- not just a widget, but a full swap flow I built myself. 

It's built with React, Node, PostgreSQL, and Solana Web3. I handled everything from JWT auth and role-based middleware to infinite
scrolling, wallet connection detection, and live transaction tracking. There's also real-time messaging via WebSockets, modular 
styling with Tailwind, and a fully documented backend with migrations, error logging and validation. 

The whole thing is optimized for performance, security, and a smooth UX -- and I've solved some real challenges along the way, like
rate limits, wallet edge cases, and scaling the feed efficiently. 


## 2. 3-Minute Project Walkthrough 
What is SolPulse ? 
SolPulse is crypto-native social app with:
- Post, likes, and real-time tipping in $SOL or SPL tokens. 
- Crypto Dashboards, trends, and wallet activity. 
- A full on-chain trading interface (DEX) powered by Jupiter. 
- Messaging, Notifications, Profiles, and more. 


### 3-Minute Verbal Pitch
Yeah, so SolPulse is a crypto-native social platform I built completely from scratch. You can think of it kind of like 
`Twitter meets CoinGecko`, but for the Solana ecosystem. It's designed for people who are deep into crypto -- they can post 
content, follow other users, tip each other in SOL or SPL tokens, and even swap tokens directly inside the app without ever
leaving the platform. 

The app is full-stack -- I used `React with Tailwind` on the frontend and `Node.js with Express and PostgreSQL` on the backend. 
Everything's connected through a REST API with JWT-based authentication, and I handle things like input validation, rate limiting,
and role-based access with custom middleware. 

On the blockchain side, I integrated `Phantom wallet detection`, `live transaction tracking`, and a custom swap flow using the `Jupiter`
`Aggregator API`. So instead of just embedding a widget, I built the entire DEX experience from scratch -- you select your tokens, get a real-time
quote, and execute a serialized swap transaction directly through the user's wallet. It speaks Solana's RPC and Jupiter's raw endpoints. 

There's also real-time messaging system using WebSockets, infinite scroll for the feed, responsive design, and performance optimizations across
the board -- like lazy loading components, error boundaries, and caching API requests when needed. 

I also built out a full migration system with Sequelize, soft deletes, proper indexing, and documented the whole thing in a production level 
README. I wanted this to feel like something you could hand off to a dev team and they'd instantly understand how it works. 

I'm proud of this project not because it works, but because I tackled real problems -- CoinGecko rate limits, wallet disconnects, flaky
WebSocket tests, scroll performance -- and solved them with solid engineering. It's fast, its modular, and i built every layer myself:
backend logic, frontend UX, blockchain integration, all of it.










### 1. How does your trade system work?
So the trading system on SolPulse is fully custom -- I didn't embed a widget or iframe. The flow goes like this:
the user picks two tokens -- say SOL to BONK -- and enters the amount. I then call Jupiter's quote API to get 
best prices across all Solana DEXs. Once the user confirms, I hit the swap endpoint to get a serialized transaction,
which I send through their connected wallet like Phantom using `sendTransaction`. 

It's built from scratch so I could control the entire UX -- from slippage handling and error messages to real-time 
feedback and confirmation tracking via Solana's RPC. The hardest part was getting that serialized swap instruction,
validating it, and making sure the wallet experience felt smooth and safe. 



### 2. Whats the most difficult part you built? 
Definitely the custom token swap system. I had to go pretty deep into Jupiter's raw API and Solana Web3.js to make
that work. Working with the free version was much harder, because of itsl limited capabilities. 
It's one thing to show prices -- it's another to actually serialize a transaction, pipe it through a wallet,
and show live status updates on-chain. 


### 3. How do you handle errors or scaling? 
On the backend , I use middleware for input validation, rate limiting, and centralized error logging. I've got timestamps
on all logs, and i can catch bad actors or API abuse through request tracking. 

For scaling, the database is normalized and indexed -- especially on fields like `user_id`, `created_at`, and `wallet_address`.
On the frontend, I use lazy loading, debounce API calls, and infinite scroll with deduplication to keep performance smooth 
even with large feeds. 

I've also built in retry logic for flaky requests and made sure nothing crashed the app. -- It all gets caught by error boundaries 
or backend middleware. 




### 4. Tell me about your backend security or architecture
Sure -- so its a RESTful API built with Express, and I use JWT for authentication. The token is sent in headers and validated on every
protected route through middleware. I also have ownership checks -- so only the owner of a post or profile can edit it. 

Security-wise, I've got CORS settings that change based on environment, all HTTP headers locked down with HELMET, and passwords hashed with 
bcrypt. I've disabled `X-Powered-By` to obscure the tech stack, and there are no secrets exposed in the frontend -- everything sensitive is
stored in `.env` and injected at build time. 

It's modular too -- auth logic, validation, and rate limiting are all cleanly separated into middlware, so it's easy to extend or swap parts 
out if needed. 



### 5. Why did you choose this tech stack? 
I chose React and Vite for the frontend because I wanted fast dev speed and modularity. `Vite's` build time are insanely fast, and `React's` 
ecosystem make's it easy to scale UI components.  I initially used React Router, but switched fully to Vite routing because Solana was only 
compatible with Vite-based setups, especially when integrating wallet adapters and blockchain-specific packages.`Tailwind` was a no-brainer 
for styling -- it helped me move quickly while keeping the design consistent and responsive. 

For the backend, I went with `Node` and `Express` because I'm `comfortable with JavaScript` across the stack, and `Express` gives me full control 
without a lot of overload. `PostgreSQL made sense for the kind of structured`, relational data I'm working with -- things like `users, posts,`
`followers, and transactions`. And I chose `Solana` for blockchain because it's fast, cheap, and the ecosystem is very developer friendly with 
tools like `Jupiter and Phantom`. 



### 6. How does your app handle Authentication and user sessions? 
So I use JWT authentication -- when a user logs in, the backend generates a token, and the frontend stores it in localStorage. All protected 
routes check for that token using middleware. I also have custom role checks like `isUser` and `isAdmin` to enforce permissions. 

On the frontend, `I built a React context provider that wraps the app and keeps track of the user's auth state globally`, so I can protect 
routes and conditionally render content based on login status. 



### 7. What's your testing strategy ? 
I wrote tests for both backend and frontend. On the backend, I used `Jest and Supertest to test core API routes` -- like auth, posting, tipping, 
-- and made sure all the edge cases were covered. On the frontend `I used React Testing Library for component tests`, especially for interactive
components like the Like button and PostComposer. 


### 8. How do you handle deployments and config? 
I'm using `Vercel for the frontend and Render for the backend`. Deploys happen automatically whenever I pushed to the main branch. I keep sensitive 
data in .env files -- nothing's hardcoded -- and I've got separate configs for dev and production, like CORS and API base URLs. 

Database migrations run automatically on deploys via `Sequelize CLI`, so the schema stays in sync across environments. 


### 9. How do you monitor or debug issues in production. 
Right now I use logging with timestamps for both requests and errors, and I track wallet interactions for any on-chain issues. If something fails, 
-- like a swap or tip -- I log the full payload and error stack so I can trace it. 

Eventually I'd love to integrate something like `Sentry or LogRocket`, but even with basic logging, I've been able to catch a lot of edge cases. 

On the blockchain side, every transaction is signed by the wallet -- the app never touches private keys. And I've got validation everywhere to catch 
malformed inputs or potential abuse. 



### 11. What would you improve if you had more time?
Honestly, there's always more I'd love to do. I'd add real-time trade history tracking for users, maybe limit orders or DCA strategies. I'd optimize the 
messaging UI for mobile, and expant test coverage with `Cypress`. 

On the backend, I'd move `WebSocket handling to Redis Pub/Sub` so it could scale across multiple instances. But overall, the core system is rock solid. 


### 12. How do you structure your frontend for maintainability? 
I separate everything into pages and reusable components. Each major feature lives in it's own folder, and shared styles are extracted into utility 
CSS files isomg Tailwind's `@apply`. I also use `lazy loading` for heavier pages, and I wrapped the app in an error boundary ro catch crashes gracefully. 

For global state like auth, I used a context provider -- and I use debounce, memoization, and conditional fetches to reduce unnecessary renders. 



### 13. Can you walk me through your database schema?
Yeah -- it's a normalized schema uisng Sequelize. I've got tables for users, posts, likes, tips, wallet activity, and tokens. Relationships are managed 
with foreign keys, and I added indexes on things like `createdAt`, `userId`, and `walletAddress` for performance. 

Soft deletes are handled with a `deleted_at` column, and I use `timestamps: true` so I can track when things were created or updated. All my migrations 
are documented with a table of contents in the README. 



### 14. What did you learn building this project? 
Honestly? Everything. This project forced me to level up on architecture, debugging, real-time systems, and blockchain integration. I learned how to solve 
real world problems, not just toy examples. -- like `rate limits from CoinGecko, wallet disconnections, flaky WebSocket behavior, and retrying failed swaps.` 

It taught me how to think like a product engineer -- not just "does it work?" but "does it scale? is it secure? Can someone else understand it" 



### 15. How did you handle real-time features like messaging or notifications?
I used WebSockets to power real-time messaging and future tipping notifications. Messages are sent through a custom socket server, and each client maintains 
a heartbeat connection. I also built reconnection logic and added read receipts to make the experience feel modern and responsive. 

In the future, I'd scale using `Redis Pub/Sub` to support multiple apps instances and user clusters. 



### 16. How would you scale SolPulse if user traffic 10x'd overnight? 
First, I'd horizontally scale the backend using something like `PM2` or containerization with autoscaling. For real-time features, I'd move sockets to a `Redis`
`-based pub/sub system`. I'd also set up API caching for rate limited services like CoinGecko, and use CDN-based caching for static assets. 

On the frontend, I'd lazy load more components, add chunk splitting, and potentially use server-side rendering for faster cold-loads. 




### 17. What's your approach to handling 3rd-party API failures like CoinGecko or Jupiter? 
I use `debounce` and `on-demand fetches` to avoid flooding the API, and I wrap every external call in try/catch blocks. For Jupiter swaps, I even built retry 
logic with exponential backoff in case of congestion or network flakiness. 

In production, I'd ideally add a caching layer or fallbacks for stale data if the API is temporarily down. 




### 18. How do you ensure your UI is accessible to all users? 
I use semantic HTML, proper `aria-labels`, and ensured all interactive elements are keyboard-navigable -- buttons, modals, and inputs. I also tested color contrast 
to make sure everything meets basic accessibility standards. 

This is definitely an area I want to keep improving on as the app grows. 


### 19. What tradeoffs did you make in your project?
Time was the biggest factor -- I had to make sure core functionality was solid before adding polish. For example, I didnt build limit orders or a fully mobile-optimized
messaging UI yet, but the architecture allows for it. 

I also chose not to add Redux or heavy state management libraries since React Context enough for my use case. I focused on simplicity, performance, and clean modular design. 



### 20. How would you onboard another dev into this codebase? 
I've documented everything in the README -- from API routes to database migrations to architecture diagrams. The folder structure is modular and easy to follow, and auth, 
validation, and rate-limiting are separated into middleware. 

If I were onboarding someone, I'd walk them through the backend flow, the swap logic, and show them how tokens and wallet interactions work, since that's the most unique 
part of the system. 