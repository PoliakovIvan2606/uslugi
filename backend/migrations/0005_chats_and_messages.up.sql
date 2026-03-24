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