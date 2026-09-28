--
-- PostgreSQL database dump
--



SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--



SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: log_v1; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.log_v1 (
    id integer NOT NULL,
    name text,
    message text,
    stack json,
    access_key text,
    server_name text,
    app_name text,
    node_env text,
    category text,
    tag text,
    "time" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: log_v1_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.log_v1_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: log_v1_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.log_v1_id_seq OWNED BY public.log_v1.id;


--
-- Name: order_v1; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_v1 (
    id integer NOT NULL,
    client_id integer,
    type text,
    ticker text,
    side text,
    amount numeric,
    price numeric,
    server_name text,
    app_name text,
    node_env text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: order_v1_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.order_v1 ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.order_v1_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: strength_v1; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.strength_v1 (
    id integer NOT NULL,
    price numeric,
    volume numeric,
    ticker text,
    timenow timestamp with time zone,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "240" numeric,
    "12" numeric,
    "4" numeric,
    "60" numeric,
    "30" numeric,
    "1" numeric,
    "2" numeric,
    average numeric,
    "5" numeric,
    "13" numeric,
    "39" numeric,
    "71" numeric,
    "30S" numeric,
    "3" numeric,
    "59" numeric,
    "7" numeric,
    "19" numeric,
    "101" numeric,
    "10" numeric,
    "11" numeric,
    "9" numeric,
    "29" numeric,
    "109" numeric,
    "181" numeric,
    "D" numeric,
    "W" numeric
);


--
-- Name: strength_v1_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.strength_v1_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: strength_v1_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.strength_v1_id_seq OWNED BY public.strength_v1.id;


--
-- Name: log_v1 id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.log_v1 ALTER COLUMN id SET DEFAULT nextval('public.log_v1_id_seq'::regclass);


--
-- Name: strength_v1 id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.strength_v1 ALTER COLUMN id SET DEFAULT nextval('public.strength_v1_id_seq'::regclass);


--
-- Name: log_v1 log_v1_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.log_v1
    ADD CONSTRAINT log_v1_pkey PRIMARY KEY (id);


--
-- Name: order_v1 order_v1_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_v1
    ADD CONSTRAINT order_v1_pkey PRIMARY KEY (id);


--
-- Name: strength_v1 strength_v1_ticker_timenow_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.strength_v1
    ADD CONSTRAINT strength_v1_ticker_timenow_unique UNIQUE (ticker, timenow);


--
-- PostgreSQL database dump complete
--


