CREATE TABLE profiles (
	user_id BIGSERIAL NOT NULL PRIMARY KEY REFERENCES users(id),
	samples_completed_cnt INTEGER DEFAULT 0,
	total_completed_cnt INTEGER DEFAULT 0,
	created_data DATE DEFAULT current_date
);
