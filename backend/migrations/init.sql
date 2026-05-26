-- 1. Расширения
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Главная сущность (от нее зависят все остальные таблицы)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    pass_hash BYTEA NOT NULL
);

-- 3. Зависимые таблицы первого уровня (ссылаются на users)
CREATE TABLE IF NOT EXISTS service (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
    name TEXT NOT NULL,
    short_description TEXT NOT NULL,
    all_description TEXT,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    name_specialist TEXT NOT NULL,
    experience INTEGER NOT NULL, 
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    location TEXT NOT NULL,
    embedding vector(512)
);

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
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
    requirements TEXT[],
    embedding vector(512)
);

CREATE TABLE IF NOT EXISTS generate_image (
    id SERIAL PRIMARY KEY, -- Заменено на SERIAL для автоинкремента
    status TEXT NOT NULL CHECK (status IN ('new', 'in_progress', 'created')),
    type TEXT NOT NULL CHECK (type IN ('service', 'task'))
);

-- 4. Зависимые таблицы второго уровня (ссылаются на users и сущности объявлений)
CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    user_id1 INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id2 INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- ID записи из таблицы service или tasks (полиморфная связь)
    entity_id INT NOT NULL,
    -- Тип сущности: строго либо 'service', либо 'task'
    entity_type TEXT NOT NULL CHECK (entity_type IN ('service', 'task')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ограничение: один чат между двумя пользователями по конкретному объявлению
    CONSTRAINT unique_chat_per_entity UNIQUE (user_id1, user_id2, entity_id, entity_type),
    
    -- Проверка, чтобы пользователь не создавал чат сам с собой
    CONSTRAINT check_different_users CHECK (user_id1 != user_id2)
);

-- 5. Зависимые таблицы третьего уровня (ссылаются на chats)
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    chat_id INT NOT NULL REFERENCES chats(id) ON DELETE CASCADE, -- Добавлен NOT NULL
    user_id INT NOT NULL REFERENCES users(id) ON DELETE SET NULL, -- Изменено на SET NULL, чтобы история не удалялась при удалении юзера
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);