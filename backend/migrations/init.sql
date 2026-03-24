CREATE TABLE service (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    short_description TEXT NOT NULL,
    all_description TEXT,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    name_specialist TEXT NOT NULL,
    experience INTEGER NOT NULL, 
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    location TEXT NOT NULL
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    short_description TEXT NOT NULL,
    all_description TEXT,
    category TEXT NOT NULL,
    budget INTEGER NOT NULL,
    author TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    deadline DATE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email TEXT NOT NULL,
    location TEXT NOT NULL,
    requirements TEXT[]
);


CREATE TABLE generate_image (
    id INTEGER,
    status TEXT NOT NULL CHECK (status IN ('new', 'in_progress', 'created')),
    type TEXT NOT NULL CHECK (type IN ('service', 'task'))
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    pass_hash BYTEA NOT NULL
);

CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    user_id1 INT REFERENCES users(id) ON DELETE CASCADE,
    user_id2 INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_chat_pair UNIQUE (user_id1, user_id2)
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    chat_id INT REFERENCES chats(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id),
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
