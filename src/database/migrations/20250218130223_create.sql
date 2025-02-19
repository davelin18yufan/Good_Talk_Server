-- "GoodTalk".achievements definition

CREATE TABLE "GoodTalk".achievements (
	id uuid DEFAULT "GoodTalk".uuid_generate_v4() NOT NULL,
	title varchar(100) NOT NULL,
	description text NOT NULL,
	icon_url varchar(255) NULL,
	category varchar(50) NULL,
	points int4 DEFAULT 0 NULL,
	requirements jsonb NULL, -- a json ibject for required threshold
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT achievements_pkey PRIMARY KEY (id)
);
COMMENT ON TABLE "GoodTalk".achievements IS 'Achievement based on user activities';

-- Column comments

COMMENT ON COLUMN "GoodTalk".achievements.requirements IS 'a json ibject for required threshold';


-- "GoodTalk".instruments definition

CREATE TABLE "GoodTalk".instruments (
	id uuid DEFAULT "GoodTalk".uuid_generate_v4() NOT NULL,
	external_id varchar(50) NOT NULL, -- The unque identifier in third-party API
	"type" varchar(20) NOT NULL,
	symbol varchar(20) NOT NULL, -- The combimation list in agency
	market varchar(20) NULL, -- country based
	currency varchar(10) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT instruments_pkey PRIMARY KEY (id)
);

-- Column comments

COMMENT ON COLUMN "GoodTalk".instruments.external_id IS 'The unque identifier in third-party API';
COMMENT ON COLUMN "GoodTalk".instruments.symbol IS 'The combimation list in agency';
COMMENT ON COLUMN "GoodTalk".instruments.market IS 'country based';


-- "GoodTalk".profile_videos definition

CREATE TABLE "GoodTalk".profile_videos (
	id uuid DEFAULT "GoodTalk".uuid_generate_v4() NOT NULL,
	video_url varchar(255) NOT NULL,
	title varchar(100) NOT NULL,
	description text NULL,
	is_active bool DEFAULT true NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT profile_videos_pkey PRIMARY KEY (id)
);
COMMENT ON TABLE "GoodTalk".profile_videos IS 'The video links for profile page';


-- "GoodTalk".tag_categories definition

CREATE TABLE "GoodTalk".tag_categories (
	id uuid DEFAULT "GoodTalk".uuid_generate_v4() NOT NULL,
	"name" varchar(50) NOT NULL,
	description text NULL,
	icon_url varchar(255) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT tag_categories_name_key UNIQUE (name),
	CONSTRAINT tag_categories_pkey PRIMARY KEY (id)
);
COMMENT ON TABLE "GoodTalk".tag_categories IS 'Category of tag, like list title.';


-- "GoodTalk".users definition

CREATE TABLE "GoodTalk".users (
	id uuid DEFAULT "GoodTalk".uuid_generate_v4() NOT NULL,
	username varchar(50) NOT NULL,
	email varchar(255) NOT NULL,
	password_hash varchar(255) NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id),
	CONSTRAINT users_username_key UNIQUE (username)
);


-- "GoodTalk".articles definition

CREATE TABLE "GoodTalk".articles (
	id uuid DEFAULT "GoodTalk".uuid_generate_v4() NOT NULL, -- author
	user_id uuid NULL,
	title varchar(255) NOT NULL,
	"content" text NOT NULL,
	status varchar(20) DEFAULT 'DRAFT'::character varying NULL,
	view_count int4 DEFAULT 0 NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	published_at timestamptz NULL,
	cover_url varchar(255) DEFAULT 'https://placehold.co/900x600'::character varying NOT NULL, -- default set to placeholder
	cover_alt_text varchar(50) DEFAULT 'Cover image'::character varying NOT NULL,
	CONSTRAINT articles_pkey PRIMARY KEY (id),
	CONSTRAINT articles_user_id_fkey FOREIGN KEY (user_id) REFERENCES "GoodTalk".users(id)
);

-- Column comments

COMMENT ON COLUMN "GoodTalk".articles.id IS 'author';
COMMENT ON COLUMN "GoodTalk".articles.cover_url IS 'default set to placeholder';


-- "GoodTalk".holdings definition

CREATE TABLE "GoodTalk".holdings (
	id uuid DEFAULT "GoodTalk".uuid_generate_v4() NOT NULL,
	user_id uuid NULL,
	instrument_id uuid NULL,
	quantity numeric(15, 4) NULL,
	average_cost numeric(15, 4) NULL,
	current_value numeric(15, 2) NULL,
	unrealized_pnl numeric(15, 2) NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT holdings_pkey PRIMARY KEY (id),
	CONSTRAINT holdings_user_id_instrument_id_key UNIQUE (user_id, instrument_id),
	CONSTRAINT holdings_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES "GoodTalk".instruments(id),
	CONSTRAINT holdings_user_id_fkey FOREIGN KEY (user_id) REFERENCES "GoodTalk".users(id)
);


-- "GoodTalk".investment_plans definition

CREATE TABLE "GoodTalk".investment_plans (
	id uuid DEFAULT "GoodTalk".uuid_generate_v4() NOT NULL,
	user_id uuid NULL,
	"comment" text NULL,
	target_amount numeric(15, 2) NULL,
	start_date date NULL,
	end_date date NULL,
	status varchar(20) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	target_price numeric(5, 2) NULL,
	entry_price numeric(5, 2) NULL,
	trade_type varchar(50) NOT NULL, -- Going long or short
	operation varchar(50) NOT NULL, -- Operation of position
	instrument_id uuid NOT NULL,
	stop_price numeric(5, 2) NULL, -- The price plan to stop either profit or loss.
	CONSTRAINT investment_plans_pkey PRIMARY KEY (id),
	CONSTRAINT instrument_plans_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES "GoodTalk".instruments(id),
	CONSTRAINT investment_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES "GoodTalk".users(id)
);

-- Column comments

COMMENT ON COLUMN "GoodTalk".investment_plans.trade_type IS 'Going long or short';
COMMENT ON COLUMN "GoodTalk".investment_plans.operation IS 'Operation of position';
COMMENT ON COLUMN "GoodTalk".investment_plans.stop_price IS 'The price plan to stop either profit or loss.';


-- "GoodTalk".monthly_performance definition

CREATE TABLE "GoodTalk".monthly_performance (
	id uuid DEFAULT "GoodTalk".uuid_generate_v4() NOT NULL,
	user_id uuid NULL,
	"year" int4 NOT NULL,
	"month" int4 NOT NULL,
	starting_capital numeric(15, 2) NULL,
	ending_capital numeric(15, 2) NULL,
	deposits numeric(15, 2) DEFAULT 0 NULL,
	withdrawals numeric(15, 2) DEFAULT 0 NULL,
	realized_profit numeric(15, 2) NULL,
	unrealized_profit numeric(15, 2) NULL,
	roi_percentage numeric(8, 4) NULL,
	best_performing_instrument_id uuid NULL,
	worst_performing_instrument_id uuid NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT monthly_performance_pkey PRIMARY KEY (id),
	CONSTRAINT monthly_performance_user_id_year_month_key UNIQUE (user_id, year, month),
	CONSTRAINT monthly_performance_best_instrument_fkey FOREIGN KEY (best_performing_instrument_id) REFERENCES "GoodTalk".instruments(id),
	CONSTRAINT monthly_performance_user_id_fkey FOREIGN KEY (user_id) REFERENCES "GoodTalk".users(id),
	CONSTRAINT monthly_performance_worst_instrument_fkey FOREIGN KEY (worst_performing_instrument_id) REFERENCES "GoodTalk".instruments(id)
);


-- "GoodTalk".social_links definition

CREATE TABLE "GoodTalk".social_links (
	user_id uuid NOT NULL,
	platform varchar(20) NOT NULL,
	url varchar(255) NOT NULL,
	is_visible bool DEFAULT true NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT social_links_pkey PRIMARY KEY (user_id, platform),
	CONSTRAINT social_links_user_id_fkey FOREIGN KEY (user_id) REFERENCES "GoodTalk".users(id)
);


-- "GoodTalk".tags definition

CREATE TABLE "GoodTalk".tags (
	id uuid DEFAULT "GoodTalk".uuid_generate_v4() NOT NULL,
	category_id uuid NULL,
	"name" varchar(50) NOT NULL,
	description text NULL,
	icon_url varchar(255) NULL,
	is_system bool DEFAULT true NULL, -- Is it created bt admin.
	created_by uuid NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT tags_categories_id_name_key UNIQUE (category_id, name),
	CONSTRAINT tags_pkey PRIMARY KEY (id),
	CONSTRAINT tags_category_id_fkey FOREIGN KEY (category_id) REFERENCES "GoodTalk".tag_categories(id),
	CONSTRAINT tags_created_by_fkey FOREIGN KEY (created_by) REFERENCES "GoodTalk".users(id)
);
COMMENT ON TABLE "GoodTalk".tags IS 'Listed items of categories.';

-- Column comments

COMMENT ON COLUMN "GoodTalk".tags.is_system IS 'Is it created bt admin.';


-- "GoodTalk".transactions definition

CREATE TABLE "GoodTalk".transactions (
	id uuid DEFAULT "GoodTalk".uuid_generate_v4() NOT NULL,
	user_id uuid NULL,
	instrument_id uuid NULL,
	transaction_type varchar(20) NOT NULL,
	quantity numeric(15, 4) NOT NULL,
	price numeric(15, 4) NOT NULL,
	commission numeric(10, 2) NULL,
	transaction_date timestamptz NOT NULL,
	plan_id uuid NULL,
	notes text NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT transactions_pkey PRIMARY KEY (id),
	CONSTRAINT transactions_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES "GoodTalk".instruments(id),
	CONSTRAINT transactions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES "GoodTalk".investment_plans(id),
	CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES "GoodTalk".users(id)
);


-- "GoodTalk".user_achievements definition

CREATE TABLE "GoodTalk".user_achievements (
	user_id uuid NOT NULL,
	achievement_id uuid NOT NULL,
	achieved_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT user_achievements_pkey PRIMARY KEY (user_id, achievement_id),
	CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES "GoodTalk".achievements(id),
	CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES "GoodTalk".users(id)
);


-- "GoodTalk".user_follows definition

CREATE TABLE "GoodTalk".user_follows (
	id uuid DEFAULT "GoodTalk".uuid_generate_v4() NOT NULL,
	follower_id uuid NOT NULL,
	following_id uuid NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT no_self_follow CHECK ((follower_id <> following_id)),
	CONSTRAINT user_follows_follower_id_following_id_key UNIQUE (follower_id, following_id),
	CONSTRAINT user_follows_pkey PRIMARY KEY (id),
	CONSTRAINT user_follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES "GoodTalk".users(id),
	CONSTRAINT user_follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES "GoodTalk".users(id)
);


-- "GoodTalk".user_settings definition

CREATE TABLE "GoodTalk".user_settings (
	user_id uuid NOT NULL,
	initial_capital numeric(15, 2) NOT NULL,
	current_capital numeric(15, 2) NULL,
	leverage_ratio numeric(5, 2) DEFAULT 1 NOT NULL, -- Default to 1 = no leverage.
	commission_rate numeric(5, 4) NULL,
	dashboard_layout jsonb NULL,
	risk_tolerance numeric NOT NULL, -- Risk tolerance ratio.
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	avatar_url varchar(255) NULL,
	profile_video_id int4 NULL,
	bio text NULL, -- Self intro.
	"location" varchar(50) NULL,
	aka varchar(50) NULL, -- Nickname or title.
	CONSTRAINT user_settings_pkey PRIMARY KEY (user_id),
	CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES "GoodTalk".users(id)
);

-- Column comments

COMMENT ON COLUMN "GoodTalk".user_settings.leverage_ratio IS 'Default to 1 = no leverage.';
COMMENT ON COLUMN "GoodTalk".user_settings.risk_tolerance IS 'Risk tolerance ratio.';
COMMENT ON COLUMN "GoodTalk".user_settings.bio IS 'Self intro.';
COMMENT ON COLUMN "GoodTalk".user_settings.aka IS 'Nickname or title.';


-- "GoodTalk".user_tag_preferences definition

CREATE TABLE "GoodTalk".user_tag_preferences (
	user_id uuid NOT NULL,
	tag_id uuid NOT NULL,
	preference_level int4 DEFAULT 1 NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT user_tag_preferences_pkey PRIMARY KEY (user_id, tag_id),
	CONSTRAINT user_tag_preferences_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES "GoodTalk".tags(id),
	CONSTRAINT user_tag_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES "GoodTalk".users(id)
);


-- "GoodTalk".yearly_performance definition

CREATE TABLE "GoodTalk".yearly_performance (
	id uuid DEFAULT "GoodTalk".uuid_generate_v4() NOT NULL,
	user_id uuid NULL,
	"year" int4 NOT NULL,
	starting_capital numeric(15, 2) NULL,
	ending_capital numeric(15, 2) NULL,
	deposits numeric(15, 2) DEFAULT 0 NULL,
	withdrawals numeric(15, 2) DEFAULT 0 NULL,
	realized_profit numeric(15, 2) NULL,
	unrealized_profit numeric(15, 2) NULL,
	roi_percentage numeric(8, 4) NULL,
	best_performing_instrument_id uuid NULL,
	worst_performing_instrument_id uuid NULL,
	best_performing_month int4 NULL,
	worst_performing_month int4 NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT yearly_performance_pkey PRIMARY KEY (id),
	CONSTRAINT yearly_performance_user_id_year_key UNIQUE (user_id, year),
	CONSTRAINT yearly_performance_best_instrument_fkey FOREIGN KEY (best_performing_instrument_id) REFERENCES "GoodTalk".instruments(id),
	CONSTRAINT yearly_performance_user_id_fkey FOREIGN KEY (user_id) REFERENCES "GoodTalk".users(id),
	CONSTRAINT yearly_performance_worst_instrument_fkey FOREIGN KEY (worst_performing_instrument_id) REFERENCES "GoodTalk".instruments(id)
);


-- "GoodTalk".article_tags definition

CREATE TABLE "GoodTalk".article_tags (
	article_id uuid NOT NULL,
	tag_id uuid NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT article_tags_pkey PRIMARY KEY (article_id, tag_id),
	CONSTRAINT article_tags_article_id_fkey FOREIGN KEY (article_id) REFERENCES "GoodTalk".articles(id),
	CONSTRAINT article_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES "GoodTalk".tags(id)
);
COMMENT ON TABLE "GoodTalk".article_tags IS 'Intersect for article and tag';