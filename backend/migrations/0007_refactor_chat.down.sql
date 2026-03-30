ALTER TABLE chats
DROP CONSTRAINT check_different_users;

ALTER TABLE chats
DROP CONSTRAINT unique_chat_per_entity;

ALTER TABLE chats
ALTER COLUMN user_id2 DROP NOT NULL;

ALTER TABLE chats
ALTER COLUMN user_id1 DROP NOT NULL;

ALTER TABLE chats
DROP COLUMN entity_type;

ALTER TABLE chats
DROP COLUMN entity_id;

ALTER TABLE chats
ADD CONSTRAINT unique_chat_pair UNIQUE (user_id1, user_id2);