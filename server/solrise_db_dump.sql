--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6 (Postgres.app)
-- Dumped by pg_dump version 16.6 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: cryptouser
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO cryptouser;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: cryptouser
--

COMMENT ON SCHEMA public IS '';


--
-- Name: enum_Notifications_type; Type: TYPE; Schema: public; Owner: cryptouser
--

CREATE TYPE public."enum_Notifications_type" AS ENUM (
    'like',
    'comment',
    'follow',
    'transaction',
    'message',
    'retweet',
    'mention',
    'share',
    'rest'
);


ALTER TYPE public."enum_Notifications_type" OWNER TO cryptouser;

--
-- Name: enum_Posts_mediaType; Type: TYPE; Schema: public; Owner: cryptouser
--

CREATE TYPE public."enum_Posts_mediaType" AS ENUM (
    'image',
    'video',
    'audio',
    'none'
);


ALTER TYPE public."enum_Posts_mediaType" OWNER TO cryptouser;

--
-- Name: enum_Transactions_status; Type: TYPE; Schema: public; Owner: cryptouser
--

CREATE TYPE public."enum_Transactions_status" AS ENUM (
    'pending',
    'completed',
    'failed'
);


ALTER TYPE public."enum_Transactions_status" OWNER TO cryptouser;

--
-- Name: enum_Transactions_type; Type: TYPE; Schema: public; Owner: cryptouser
--

CREATE TYPE public."enum_Transactions_type" AS ENUM (
    'deposit',
    'withdrawal',
    'transfer'
);


ALTER TYPE public."enum_Transactions_type" OWNER TO cryptouser;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Comments; Type: TABLE; Schema: public; Owner: cryptouser
--

CREATE TABLE public."Comments" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "postId" integer NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Comments" OWNER TO cryptouser;

--
-- Name: Comments_id_seq; Type: SEQUENCE; Schema: public; Owner: cryptouser
--

CREATE SEQUENCE public."Comments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Comments_id_seq" OWNER TO cryptouser;

--
-- Name: Comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cryptouser
--

ALTER SEQUENCE public."Comments_id_seq" OWNED BY public."Comments".id;


--
-- Name: Followers; Type: TABLE; Schema: public; Owner: cryptouser
--

CREATE TABLE public."Followers" (
    id integer NOT NULL,
    "followerId" integer NOT NULL,
    "followingId" integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."Followers" OWNER TO cryptouser;

--
-- Name: Followers_id_seq; Type: SEQUENCE; Schema: public; Owner: cryptouser
--

CREATE SEQUENCE public."Followers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Followers_id_seq" OWNER TO cryptouser;

--
-- Name: Followers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cryptouser
--

ALTER SEQUENCE public."Followers_id_seq" OWNED BY public."Followers".id;


--
-- Name: Likes; Type: TABLE; Schema: public; Owner: cryptouser
--

CREATE TABLE public."Likes" (
    id integer NOT NULL,
    "postId" integer NOT NULL,
    "userId" integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."Likes" OWNER TO cryptouser;

--
-- Name: Likes_id_seq; Type: SEQUENCE; Schema: public; Owner: cryptouser
--

CREATE SEQUENCE public."Likes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Likes_id_seq" OWNER TO cryptouser;

--
-- Name: Likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cryptouser
--

ALTER SEQUENCE public."Likes_id_seq" OWNED BY public."Likes".id;


--
-- Name: Messages; Type: TABLE; Schema: public; Owner: cryptouser
--

CREATE TABLE public."Messages" (
    id integer NOT NULL,
    "senderId" integer NOT NULL,
    "recipientId" integer NOT NULL,
    content character varying(255) NOT NULL,
    "cryptoTip" double precision DEFAULT '0'::double precision NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "readAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Messages" OWNER TO cryptouser;

--
-- Name: Messages_id_seq; Type: SEQUENCE; Schema: public; Owner: cryptouser
--

CREATE SEQUENCE public."Messages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Messages_id_seq" OWNER TO cryptouser;

--
-- Name: Messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cryptouser
--

ALTER SEQUENCE public."Messages_id_seq" OWNED BY public."Messages".id;


--
-- Name: Notifications; Type: TABLE; Schema: public; Owner: cryptouser
--

CREATE TABLE public."Notifications" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "actorId" integer NOT NULL,
    type public."enum_Notifications_type" NOT NULL,
    message character varying(255),
    amount double precision,
    "entityId" text,
    "entityType" character varying(255),
    "isRead" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public."Notifications" OWNER TO cryptouser;

--
-- Name: Notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: cryptouser
--

CREATE SEQUENCE public."Notifications_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Notifications_id_seq" OWNER TO cryptouser;

--
-- Name: Notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cryptouser
--

ALTER SEQUENCE public."Notifications_id_seq" OWNED BY public."Notifications".id;


--
-- Name: Posts; Type: TABLE; Schema: public; Owner: cryptouser
--

CREATE TABLE public."Posts" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    content character varying(255) NOT NULL,
    "mediaUrl" character varying(255),
    "mediaType" public."enum_Posts_mediaType" DEFAULT 'none'::public."enum_Posts_mediaType",
    "cryptoTag" character varying(255),
    likes integer DEFAULT 0 NOT NULL,
    retweets integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone,
    "isRetweet" boolean DEFAULT false NOT NULL,
    "originalPostId" integer,
    "originalAuthor" character varying(255),
    "originalProfilePicture" character varying(255)
);


ALTER TABLE public."Posts" OWNER TO cryptouser;

--
-- Name: Posts_id_seq; Type: SEQUENCE; Schema: public; Owner: cryptouser
--

CREATE SEQUENCE public."Posts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Posts_id_seq" OWNER TO cryptouser;

--
-- Name: Posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cryptouser
--

ALTER SEQUENCE public."Posts_id_seq" OWNED BY public."Posts".id;


--
-- Name: Retweets; Type: TABLE; Schema: public; Owner: cryptouser
--

CREATE TABLE public."Retweets" (
    id integer NOT NULL,
    "postId" integer NOT NULL,
    "userId" integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."Retweets" OWNER TO cryptouser;

--
-- Name: Retweets_id_seq; Type: SEQUENCE; Schema: public; Owner: cryptouser
--

CREATE SEQUENCE public."Retweets_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Retweets_id_seq" OWNER TO cryptouser;

--
-- Name: Retweets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cryptouser
--

ALTER SEQUENCE public."Retweets_id_seq" OWNED BY public."Retweets".id;


--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: cryptouser
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO cryptouser;

--
-- Name: Transactions; Type: TABLE; Schema: public; Owner: cryptouser
--

CREATE TABLE public."Transactions" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "walletAddress" character varying(255) NOT NULL,
    amount double precision NOT NULL,
    type public."enum_Transactions_type" NOT NULL,
    status public."enum_Transactions_status" DEFAULT 'pending'::public."enum_Transactions_status" NOT NULL,
    "referenceId" character varying(255) NOT NULL,
    description character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone,
    "walletId" integer
);


ALTER TABLE public."Transactions" OWNER TO cryptouser;

--
-- Name: Transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: cryptouser
--

CREATE SEQUENCE public."Transactions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Transactions_id_seq" OWNER TO cryptouser;

--
-- Name: Transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cryptouser
--

ALTER SEQUENCE public."Transactions_id_seq" OWNED BY public."Transactions".id;


--
-- Name: TrendingCoins; Type: TABLE; Schema: public; Owner: cryptouser
--

CREATE TABLE public."TrendingCoins" (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    symbol character varying(255) NOT NULL,
    "currentPrice" double precision NOT NULL,
    "lastUpdated" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."TrendingCoins" OWNER TO cryptouser;

--
-- Name: Users; Type: TABLE; Schema: public; Owner: cryptouser
--

CREATE TABLE public."Users" (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    "walletAddress" character varying(255) NOT NULL,
    bio text,
    "profilePicture" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public."Users" OWNER TO cryptouser;

--
-- Name: Users_id_seq; Type: SEQUENCE; Schema: public; Owner: cryptouser
--

CREATE SEQUENCE public."Users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Users_id_seq" OWNER TO cryptouser;

--
-- Name: Users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cryptouser
--

ALTER SEQUENCE public."Users_id_seq" OWNED BY public."Users".id;


--
-- Name: Wallets; Type: TABLE; Schema: public; Owner: cryptouser
--

CREATE TABLE public."Wallets" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    address character varying(255) NOT NULL,
    balance double precision DEFAULT '0'::double precision,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public."Wallets" OWNER TO cryptouser;

--
-- Name: Wallets_id_seq; Type: SEQUENCE; Schema: public; Owner: cryptouser
--

CREATE SEQUENCE public."Wallets_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Wallets_id_seq" OWNER TO cryptouser;

--
-- Name: Wallets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cryptouser
--

ALTER SEQUENCE public."Wallets_id_seq" OWNED BY public."Wallets".id;


--
-- Name: Comments id; Type: DEFAULT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Comments" ALTER COLUMN id SET DEFAULT nextval('public."Comments_id_seq"'::regclass);


--
-- Name: Followers id; Type: DEFAULT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Followers" ALTER COLUMN id SET DEFAULT nextval('public."Followers_id_seq"'::regclass);


--
-- Name: Likes id; Type: DEFAULT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Likes" ALTER COLUMN id SET DEFAULT nextval('public."Likes_id_seq"'::regclass);


--
-- Name: Messages id; Type: DEFAULT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Messages" ALTER COLUMN id SET DEFAULT nextval('public."Messages_id_seq"'::regclass);


--
-- Name: Notifications id; Type: DEFAULT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Notifications" ALTER COLUMN id SET DEFAULT nextval('public."Notifications_id_seq"'::regclass);


--
-- Name: Posts id; Type: DEFAULT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Posts" ALTER COLUMN id SET DEFAULT nextval('public."Posts_id_seq"'::regclass);


--
-- Name: Retweets id; Type: DEFAULT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Retweets" ALTER COLUMN id SET DEFAULT nextval('public."Retweets_id_seq"'::regclass);


--
-- Name: Transactions id; Type: DEFAULT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Transactions" ALTER COLUMN id SET DEFAULT nextval('public."Transactions_id_seq"'::regclass);


--
-- Name: Users id; Type: DEFAULT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Users" ALTER COLUMN id SET DEFAULT nextval('public."Users_id_seq"'::regclass);


--
-- Name: Wallets id; Type: DEFAULT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Wallets" ALTER COLUMN id SET DEFAULT nextval('public."Wallets_id_seq"'::regclass);


--
-- Data for Name: Comments; Type: TABLE DATA; Schema: public; Owner: cryptouser
--

COPY public."Comments" (id, "userId", "postId", content, "createdAt", "updatedAt") FROM stdin;
1	1	3	crazy	2025-02-11 18:05:04.27-08	2025-02-11 18:05:04.27-08
2	1	2	hi	2025-02-11 18:58:47.491-08	2025-02-11 18:58:47.491-08
3	2	7	comment 1	2025-02-11 19:01:35.37-08	2025-02-11 19:01:35.37-08
4	2	4	This is a comment on the post!!!	2025-02-11 19:40:18.373-08	2025-02-11 19:40:18.373-08
5	2	7	comment test	2025-02-11 19:41:41.743-08	2025-02-11 19:41:41.743-08
6	2	7	comment #3	2025-02-11 19:47:01.002-08	2025-02-11 19:47:01.002-08
7	1	24	hi zatty	2025-02-12 01:23:46.779-08	2025-02-12 01:23:46.779-08
8	1	26	r4r4r4r4	2025-02-12 06:54:32.628-08	2025-02-12 06:54:32.628-08
9	1	26	grfr	2025-02-12 07:11:38.878-08	2025-02-12 07:11:38.878-08
\.


--
-- Data for Name: Followers; Type: TABLE DATA; Schema: public; Owner: cryptouser
--

COPY public."Followers" (id, "followerId", "followingId", "createdAt", "updatedAt") FROM stdin;
4	1	3	2025-02-12 18:46:41.665-08	2025-02-12 18:46:41.665-08
5	1	2	2025-02-12 19:05:10.18-08	2025-02-12 19:05:10.18-08
6	1	4	2025-02-20 11:35:13.591-08	2025-02-20 11:35:13.591-08
\.


--
-- Data for Name: Likes; Type: TABLE DATA; Schema: public; Owner: cryptouser
--

COPY public."Likes" (id, "postId", "userId", "createdAt", "updatedAt") FROM stdin;
2	12	1	2025-02-11 21:57:04.925-08	2025-02-11 21:57:04.925-08
5	13	2	2025-02-11 22:26:20.953-08	2025-02-11 22:26:20.953-08
11	24	1	2025-02-12 01:23:41.03-08	2025-02-12 01:23:41.03-08
\.


--
-- Data for Name: Messages; Type: TABLE DATA; Schema: public; Owner: cryptouser
--

COPY public."Messages" (id, "senderId", "recipientId", content, "cryptoTip", read, "readAt", "createdAt", "updatedAt") FROM stdin;
1	1	3	wassup	0	f	\N	2025-02-11 18:04:42.264-08	2025-02-11 18:04:42.264-08
2	1	4	hi zatty	0	f	\N	2025-02-12 01:24:12.855-08	2025-02-12 01:24:12.855-08
3	1	4	rffr	0	f	\N	2025-02-12 06:55:50.73-08	2025-02-12 06:55:50.73-08
4	1	2	hi katty	0	f	\N	2025-02-12 19:05:16.227-08	2025-02-12 19:05:16.227-08
5	1	4	hi	0	f	\N	2025-02-20 11:35:19.11-08	2025-02-20 11:35:19.11-08
6	1	4	hi	0	f	\N	2025-02-20 11:38:31.133-08	2025-02-20 11:38:31.133-08
\.


--
-- Data for Name: Notifications; Type: TABLE DATA; Schema: public; Owner: cryptouser
--

COPY public."Notifications" (id, "userId", "actorId", type, message, amount, "entityId", "entityType", "isRead", "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	3	1	message	You have a new message from matty123@gmail.com.	\N	\N	\N	f	2025-02-11 18:04:42.267-08	2025-02-11 18:04:42.267-08	\N
2	3	1	comment	matty123@gmail.com commented on your post.	\N	\N	\N	f	2025-02-11 18:05:04.273-08	2025-02-11 18:05:04.273-08	\N
3	2	1	comment	matty123@gmail.com commented on your post.	\N	\N	\N	f	2025-02-11 18:58:47.493-08	2025-02-11 18:58:47.493-08	\N
8	4	1	comment	matty123@gmail.com commented on your post.	\N	\N	\N	f	2025-02-12 01:23:46.782-08	2025-02-12 01:23:46.782-08	\N
9	4	1	message	You have a new message from matty123@gmail.com.	\N	\N	\N	f	2025-02-12 01:24:12.857-08	2025-02-12 01:24:12.857-08	\N
11	4	1	message	You have a new message from matty123@gmail.com.	\N	\N	\N	f	2025-02-12 06:55:50.733-08	2025-02-12 06:55:50.733-08	\N
13	2	1	message	You have a new message from matty123@gmail.com.	\N	\N	\N	f	2025-02-12 19:05:16.232-08	2025-02-12 19:05:16.232-08	\N
14	4	1	message	You have a new message from matty123@gmail.com.	\N	\N	\N	f	2025-02-20 11:35:19.115-08	2025-02-20 11:35:19.115-08	\N
15	4	1	message	You have a new message from matty123@gmail.com.	\N	\N	\N	f	2025-02-20 11:38:31.142-08	2025-02-20 11:38:31.142-08	\N
4	1	2	comment	katty123 commented on your post.	\N	\N	\N	t	2025-02-11 19:01:35.378-08	2025-02-20 11:46:43.9-08	\N
5	1	2	comment	katty123 commented on your post.	\N	\N	\N	t	2025-02-11 19:40:18.382-08	2025-02-20 11:46:43.9-08	\N
6	1	2	comment	katty123 commented on your post.	\N	\N	\N	t	2025-02-11 19:41:41.748-08	2025-02-20 11:46:43.9-08	\N
7	1	2	comment	katty123 commented on your post.	\N	\N	\N	t	2025-02-11 19:47:01.012-08	2025-02-20 11:46:43.9-08	\N
10	1	1	comment	matty123@gmail.com commented on your post.	\N	\N	\N	t	2025-02-12 06:54:32.638-08	2025-02-20 11:46:43.9-08	\N
12	1	1	comment	matty123@gmail.com commented on your post.	\N	\N	\N	t	2025-02-12 07:11:38.888-08	2025-02-20 11:46:43.9-08	\N
\.


--
-- Data for Name: Posts; Type: TABLE DATA; Schema: public; Owner: cryptouser
--

COPY public."Posts" (id, "userId", content, "mediaUrl", "mediaType", "cryptoTag", likes, retweets, "createdAt", "updatedAt", "deletedAt", "isRetweet", "originalPostId", "originalAuthor", "originalProfilePicture") FROM stdin;
1	1	Testings bros	\N	none	\N	0	0	2025-02-10 18:25:58.79-08	2025-02-10 18:25:58.79-08	\N	f	\N	\N	\N
4	1	hello folks	\N	none	\N	0	0	2025-02-11 18:05:14.892-08	2025-02-11 18:05:14.892-08	\N	t	3	latty123	\N
49	1	test 20	\N	none	\N	0	1	2025-02-12 23:13:23.488-08	2025-02-12 23:25:42.194-08	\N	f	\N	\N	\N
5	1	hi	\N	none	\N	0	0	2025-02-11 18:58:29.053-08	2025-02-11 18:58:29.053-08	\N	f	\N	\N	\N
22	3	test again	\N	none	\N	0	1	2025-02-12 01:19:57.415-08	2025-02-12 01:21:00.294-08	2025-02-12 01:21:00.293-08	t	20	matty123@gmail.com	/uploads/1739325860906.png
6	1	Testings katty	\N	none	\N	0	0	2025-02-11 18:59:52.731-08	2025-02-11 18:59:52.731-08	\N	t	2	katty123	\N
2	2	Testings katty	\N	none	\N	1	1	2025-02-10 18:27:29.224-08	2025-02-11 18:59:52.734-08	\N	f	\N	\N	\N
23	3	test again	\N	none	\N	0	2	2025-02-12 01:21:08.303-08	2025-02-12 01:21:08.303-08	\N	t	20	matty123@gmail.com	/uploads/1739325860906.png
40	4	wtf	\N	none	\N	0	9	2025-02-12 20:05:42.471-08	2025-02-12 20:11:00.865-08	2025-02-12 20:11:00.864-08	t	32	matty123@gmail.com	/uploads/1739325860906.png
8	2	testing comments	\N	none	\N	0	0	2025-02-11 19:51:24.259-08	2025-02-11 19:55:23.943-08	2025-02-11 19:55:23.942-08	t	7	matty123@gmail.com	/uploads/1739325860906.png
24	4	wait what. 	\N	none	\N	1	1	2025-02-12 01:23:13.324-08	2025-02-12 01:23:41.032-08	\N	f	\N	\N	\N
25	1	wait what. 	\N	none	\N	1	1	2025-02-12 01:23:30.797-08	2025-02-12 01:23:41.034-08	\N	t	24	zatty123	\N
27	4	hello folks	\N	none	\N	1	3	2025-02-12 03:38:18.043-08	2025-02-12 03:38:18.043-08	\N	t	3	latty123	/default-avatar.png
3	3	hello folks	\N	none	\N	1	3	2025-02-11 17:58:29.625-08	2025-02-12 03:38:18.053-08	\N	f	\N	\N	\N
7	1	testing comments	\N	none	\N	6	2	2025-02-11 19:00:35-08	2025-02-11 19:57:47.03-08	\N	f	\N	\N	\N
9	2	testing comments	\N	none	\N	5	1	2025-02-11 19:55:33.969-08	2025-02-11 19:57:47.885-08	\N	t	7	matty123@gmail.com	/uploads/1739325860906.png
28	3	matty test	\N	none	\N	0	1	2025-02-12 03:45:41.051-08	2025-02-12 03:45:41.051-08	\N	t	26	matty123@gmail.com	/uploads/1739325860906.png
26	1	matty test	\N	none	\N	0	1	2025-02-12 02:13:08.613-08	2025-02-12 03:45:41.059-08	\N	f	\N	\N	\N
11	1	like repost test	\N	none	\N	0	0	2025-02-11 21:56:00.668-08	2025-02-11 21:56:17.213-08	2025-02-11 21:56:17.213-08	t	10	katty123	\N
29	1	test today	\N	none	\N	0	1	2025-02-12 19:49:07.662-08	2025-02-12 19:49:51.018-08	\N	f	\N	\N	\N
12	1	like repost test	\N	none	\N	1	0	2025-02-11 21:56:19.25-08	2025-02-11 21:57:04.932-08	\N	t	10	katty123	\N
31	1	test again	\N	none	\N	0	3	2025-02-12 19:53:30.066-08	2025-02-12 19:53:30.066-08	\N	t	20	matty123@gmail.com	/uploads/1739325860906.png
10	2	like repost test	\N	none	\N	0	1	2025-02-11 20:16:28.121-08	2025-02-11 21:59:19.23-08	\N	f	\N	\N	\N
14	2	testing	\N	none	\N	0	0	2025-02-11 22:25:19.434-08	2025-02-11 22:25:19.434-08	\N	t	13	matty123@gmail.com	/uploads/1739325860906.png
20	1	test again	\N	none	\N	0	3	2025-02-12 01:16:00.379-08	2025-02-12 19:53:30.07-08	\N	f	\N	\N	\N
13	1	testing	\N	none	\N	1	1	2025-02-11 22:23:48.015-08	2025-02-11 22:26:20.961-08	\N	f	\N	\N	\N
33	4	wtf	\N	none	\N	0	1	2025-02-12 19:55:57.399-08	2025-02-12 20:00:02.197-08	2025-02-12 20:00:02.197-08	t	32	matty123@gmail.com	/uploads/1739325860906.png
16	3	hi	\N	none	\N	0	0	2025-02-12 00:14:18.467-08	2025-02-12 00:14:18.467-08	\N	t	15	matty123@gmail.com	/uploads/1739325860906.png
41	4	wtf	\N	none	\N	0	10	2025-02-12 20:11:04.36-08	2025-02-12 20:13:21.593-08	2025-02-12 20:13:21.592-08	t	32	matty123@gmail.com	/uploads/1739325860906.png
34	4	wtf	\N	none	\N	0	2	2025-02-12 20:00:09.061-08	2025-02-12 20:00:44.826-08	2025-02-12 20:00:44.826-08	t	32	matty123@gmail.com	/uploads/1739325860906.png
30	4	test today	\N	none	\N	0	1	2025-02-12 19:49:51.009-08	2025-02-12 20:00:46.959-08	2025-02-12 20:00:46.959-08	t	29	matty123@gmail.com	/uploads/1739325860906.png
15	1	hi	\N	none	\N	0	1	2025-02-12 00:13:06.032-08	2025-02-12 00:15:00.426-08	\N	f	\N	\N	\N
42	4	wtf	\N	none	\N	0	0	2025-02-12 20:13:32.374-08	2025-02-12 20:13:32.374-08	\N	t	32	matty123@gmail.com	/uploads/1739325860906.png
35	4	wtf	\N	none	\N	0	3	2025-02-12 20:00:54.757-08	2025-02-12 20:01:42.411-08	2025-02-12 20:01:42.411-08	t	32	matty123@gmail.com	/uploads/1739325860906.png
54	4	testing 500	\N	none	\N	0	0	2025-02-12 23:48:29.745-08	2025-02-12 23:48:29.745-08	\N	t	53	matty123@gmail.com	/uploads/1739325860906.png
36	4	wtf	\N	none	\N	0	4	2025-02-12 20:01:52.086-08	2025-02-12 20:02:13.234-08	2025-02-12 20:02:13.233-08	t	32	matty123@gmail.com	/uploads/1739325860906.png
18	1	testing number 5	\N	none	\N	0	1	2025-02-12 01:14:33.008-08	2025-02-12 01:15:32.831-08	2025-02-12 01:15:32.83-08	t	17	latty123	\N
19	1	testing number 5	\N	none	\N	0	2	2025-02-12 01:15:45.506-08	2025-02-12 01:15:45.506-08	\N	t	17	latty123	\N
17	3	testing number 5	\N	none	\N	0	2	2025-02-12 01:13:12.96-08	2025-02-12 01:15:45.511-08	\N	f	\N	\N	\N
32	1	wtf	\N	none	\N	0	12	2025-02-12 19:55:05.215-08	2025-02-12 20:13:32.381-08	\N	f	\N	\N	\N
21	3	test again	\N	none	\N	0	1	2025-02-12 01:16:51.423-08	2025-02-12 01:17:02.752-08	2025-02-12 01:17:02.751-08	t	20	matty123@gmail.com	/uploads/1739325860906.png
44	4	hi	\N	none	\N	0	0	2025-02-12 20:14:53.343-08	2025-02-12 20:14:53.343-08	\N	t	43	matty123@gmail.com	/uploads/1739325860906.png
37	4	wtf	\N	none	\N	0	0	2025-02-12 20:02:25.349-08	2025-02-12 20:03:36.199-08	2025-02-12 20:03:36.199-08	t	32	matty123@gmail.com	/uploads/1739325860906.png
53	1	testing 500	\N	none	\N	0	1	2025-02-12 23:48:12.241-08	2025-02-12 23:48:29.748-08	\N	f	\N	\N	\N
38	4	wtf	\N	none	\N	0	7	2025-02-12 20:03:44.108-08	2025-02-12 20:05:08.292-08	2025-02-12 20:05:08.292-08	t	32	matty123@gmail.com	/uploads/1739325860906.png
39	4	wtf	\N	none	\N	0	8	2025-02-12 20:05:14.468-08	2025-02-12 20:05:38.368-08	2025-02-12 20:05:38.367-08	t	32	matty123@gmail.com	/uploads/1739325860906.png
43	1	hi	\N	none	\N	0	2	2025-02-12 20:14:40.259-08	2025-02-12 20:14:53.348-08	\N	f	\N	\N	\N
46	4	hi	\N	none	\N	0	0	2025-02-12 20:17:16.02-08	2025-02-12 20:17:16.02-08	\N	t	45	matty123@gmail.com	/uploads/1739325860906.png
56	4	testing 900	\N	none	\N	0	0	2025-02-12 23:50:14.839-08	2025-02-12 23:50:14.839-08	\N	t	55	matty123@gmail.com	/uploads/1739325860906.png
45	1	hi	\N	none	\N	0	2	2025-02-12 20:17:06.718-08	2025-02-12 20:17:16.026-08	\N	f	\N	\N	\N
48	4	test10\r\n	\N	none	\N	0	0	2025-02-12 20:23:02.907-08	2025-02-12 20:23:02.907-08	\N	t	47	matty123@gmail.com	/uploads/1739325860906.png
47	1	test10\r\n	\N	none	\N	0	1	2025-02-12 20:22:07.638-08	2025-02-12 20:23:02.915-08	\N	f	\N	\N	\N
51	4	test 70\r\n	\N	none	\N	0	0	2025-02-12 23:24:17.4-08	2025-02-12 23:24:17.4-08	\N	t	50	matty123@gmail.com	/uploads/1739325860906.png
50	1	test 70\r\n	\N	none	\N	0	1	2025-02-12 23:23:55.825-08	2025-02-12 23:24:17.403-08	\N	f	\N	\N	\N
52	4	test 20	\N	none	\N	0	0	2025-02-12 23:25:42.185-08	2025-02-12 23:25:42.185-08	\N	t	49	matty123@gmail.com	/uploads/1739325860906.png
55	1	testing 900	\N	none	\N	0	1	2025-02-12 23:49:56.322-08	2025-02-12 23:50:14.843-08	\N	f	\N	\N	\N
58	4	testing 1000	\N	none	\N	0	0	2025-02-12 23:52:15.781-08	2025-02-12 23:52:15.781-08	\N	t	57	matty123@gmail.com	/uploads/1739325860906.png
57	1	testing 1000	\N	none	\N	0	1	2025-02-12 23:52:06.53-08	2025-02-12 23:52:15.785-08	\N	f	\N	\N	\N
62	1	create a post 	\N	none	solana	0	0	2025-02-20 11:33:47.519-08	2025-02-20 11:33:47.519-08	\N	f	\N	\N	\N
60	4	testing 7000	\N	none	\N	0	0	2025-02-12 23:56:14.093-08	2025-02-12 23:56:32.457-08	2025-02-12 23:56:32.457-08	t	59	matty123@gmail.com	/uploads/1739325860906.png
61	4	testing 7000	\N	none	\N	0	0	2025-02-12 23:56:34.758-08	2025-02-12 23:56:34.758-08	\N	t	59	matty123@gmail.com	/uploads/1739325860906.png
59	1	testing 7000	\N	none	\N	0	2	2025-02-12 23:55:51.002-08	2025-02-12 23:56:34.761-08	\N	f	\N	\N	\N
\.


--
-- Data for Name: Retweets; Type: TABLE DATA; Schema: public; Owner: cryptouser
--

COPY public."Retweets" (id, "postId", "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: cryptouser
--

COPY public."SequelizeMeta" (name) FROM stdin;
20241203115402-create-database-schema.js
20241223-add-message-to-notification-type.js
\.


--
-- Data for Name: Transactions; Type: TABLE DATA; Schema: public; Owner: cryptouser
--

COPY public."Transactions" (id, "userId", "walletAddress", amount, type, status, "referenceId", description, "createdAt", "updatedAt", "deletedAt", "walletId") FROM stdin;
\.


--
-- Data for Name: TrendingCoins; Type: TABLE DATA; Schema: public; Owner: cryptouser
--

COPY public."TrendingCoins" (id, name, symbol, "currentPrice", "lastUpdated", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: cryptouser
--

COPY public."Users" (id, username, email, password, "walletAddress", bio, "profilePicture", "createdAt", "updatedAt", "deletedAt") FROM stdin;
2	katty123	katty123@gmail.com	$2b$10$TG2uEt/boUqj/yIVIGqzJecuFYdcAxIFN58wEE1Fms.TtgnoC8EfO	9oBpDW43XmJst3BqzaYgatptWh2eQ2awMscoXf9unCz3	\N	\N	2025-02-10 18:27:14.774-08	2025-02-10 18:27:14.774-08	\N
3	latty123	latty123@gmail.com	$2b$10$3YpY8ThHyA.p4HcWQ1n6buBB1MULHOv.Ze32pL5PXHp5RX4SrB522	7mRu73rp24p3YjqxDeig8N4sLVkDusT3hR5gum7N8BSB	\N	\N	2025-02-11 17:58:03.328-08	2025-02-11 17:58:03.328-08	\N
4	zatty123	zatty123@gmail.com	$2b$10$2nGOF5XKLkftd0JhjHJNyORUQ64L6/u3Cy4XpOWa0gLgryEV.wu1W	8Sjm82BiRoJ3sWC3cDYrjJcfrx9FLTkC1FzzQ2pDrgn2	\N	\N	2025-02-12 01:22:24.004-08	2025-02-12 01:22:24.004-08	\N
1	matty123@gmail.com	matty123@gmail.com	$2b$10$wGxKaHCq7p5tNshQqU4cS.EzljGARSFBuzLzzUWe3Cj1N7/tCSOlm	g1QPBuPoXBocwL1cWWivsomo4LfvsnVn7Gc8STW6L8o	wassup122213	/uploads/1740080888107.png	2025-02-10 18:25:45.759-08	2025-02-20 11:48:30.54-08	\N
\.


--
-- Data for Name: Wallets; Type: TABLE DATA; Schema: public; Owner: cryptouser
--

COPY public."Wallets" (id, "userId", address, balance, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Name: Comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cryptouser
--

SELECT pg_catalog.setval('public."Comments_id_seq"', 9, true);


--
-- Name: Followers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cryptouser
--

SELECT pg_catalog.setval('public."Followers_id_seq"', 6, true);


--
-- Name: Likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cryptouser
--

SELECT pg_catalog.setval('public."Likes_id_seq"', 11, true);


--
-- Name: Messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cryptouser
--

SELECT pg_catalog.setval('public."Messages_id_seq"', 6, true);


--
-- Name: Notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cryptouser
--

SELECT pg_catalog.setval('public."Notifications_id_seq"', 15, true);


--
-- Name: Posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cryptouser
--

SELECT pg_catalog.setval('public."Posts_id_seq"', 62, true);


--
-- Name: Retweets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cryptouser
--

SELECT pg_catalog.setval('public."Retweets_id_seq"', 1, false);


--
-- Name: Transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cryptouser
--

SELECT pg_catalog.setval('public."Transactions_id_seq"', 1, false);


--
-- Name: Users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cryptouser
--

SELECT pg_catalog.setval('public."Users_id_seq"', 4, true);


--
-- Name: Wallets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cryptouser
--

SELECT pg_catalog.setval('public."Wallets_id_seq"', 1, false);


--
-- Name: Comments Comments_pkey; Type: CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Comments"
    ADD CONSTRAINT "Comments_pkey" PRIMARY KEY (id);


--
-- Name: Followers Followers_pkey; Type: CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Followers"
    ADD CONSTRAINT "Followers_pkey" PRIMARY KEY (id);


--
-- Name: Likes Likes_pkey; Type: CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Likes"
    ADD CONSTRAINT "Likes_pkey" PRIMARY KEY (id);


--
-- Name: Messages Messages_pkey; Type: CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_pkey" PRIMARY KEY (id);


--
-- Name: Notifications Notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "Notifications_pkey" PRIMARY KEY (id);


--
-- Name: Posts Posts_pkey; Type: CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Posts"
    ADD CONSTRAINT "Posts_pkey" PRIMARY KEY (id);


--
-- Name: Retweets Retweets_pkey; Type: CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Retweets"
    ADD CONSTRAINT "Retweets_pkey" PRIMARY KEY (id);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: Transactions Transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_pkey" PRIMARY KEY (id);


--
-- Name: Transactions Transactions_referenceId_key; Type: CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_referenceId_key" UNIQUE ("referenceId");


--
-- Name: TrendingCoins TrendingCoins_pkey; Type: CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."TrendingCoins"
    ADD CONSTRAINT "TrendingCoins_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_username_key; Type: CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key" UNIQUE (username);


--
-- Name: Users Users_walletAddress_key; Type: CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_walletAddress_key" UNIQUE ("walletAddress");


--
-- Name: Wallets Wallets_address_key; Type: CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Wallets"
    ADD CONSTRAINT "Wallets_address_key" UNIQUE (address);


--
-- Name: Wallets Wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Wallets"
    ADD CONSTRAINT "Wallets_pkey" PRIMARY KEY (id);


--
-- Name: followers_follower_id_following_id; Type: INDEX; Schema: public; Owner: cryptouser
--

CREATE UNIQUE INDEX followers_follower_id_following_id ON public."Followers" USING btree ("followerId", "followingId");


--
-- Name: notifications_user_id_is_read; Type: INDEX; Schema: public; Owner: cryptouser
--

CREATE INDEX notifications_user_id_is_read ON public."Notifications" USING btree ("userId", "isRead");


--
-- Name: Comments Comments_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Comments"
    ADD CONSTRAINT "Comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Posts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Comments Comments_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Comments"
    ADD CONSTRAINT "Comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Followers Followers_followerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Followers"
    ADD CONSTRAINT "Followers_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Followers Followers_followingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Followers"
    ADD CONSTRAINT "Followers_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Likes Likes_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Likes"
    ADD CONSTRAINT "Likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Posts"(id) ON DELETE CASCADE;


--
-- Name: Likes Likes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Likes"
    ADD CONSTRAINT "Likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON DELETE CASCADE;


--
-- Name: Messages Messages_recipientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: Messages Messages_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: Notifications Notifications_actorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "Notifications_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: Notifications Notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: Posts Posts_originalPostId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Posts"
    ADD CONSTRAINT "Posts_originalPostId_fkey" FOREIGN KEY ("originalPostId") REFERENCES public."Posts"(id) ON DELETE SET NULL;


--
-- Name: Posts Posts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Posts"
    ADD CONSTRAINT "Posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Retweets Retweets_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Retweets"
    ADD CONSTRAINT "Retweets_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Posts"(id) ON DELETE CASCADE;


--
-- Name: Retweets Retweets_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Retweets"
    ADD CONSTRAINT "Retweets_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON DELETE CASCADE;


--
-- Name: Transactions Transactions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Transactions Transactions_walletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES public."Wallets"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Wallets Wallets_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cryptouser
--

ALTER TABLE ONLY public."Wallets"
    ADD CONSTRAINT "Wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: cryptouser
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

