-- Удаляем предыдущие, частично созданные объекты, используя правильный синтаксис для PostgreSQL
DROP CONSTRAINT IF EXISTS check_different_users ON chats;
DROP CONSTRAINT IF EXISTS unique_chat_per_entity ON chats;
DROP CONSTRAINT IF EXISTS unique_chat_pair ON chats; -- Удаляем и старое ограничение, если оно было

-- Удаляем столбцы, если они были добавлены
ALTER TABLE chats DROP COLUMN IF EXISTS entity_type;
ALTER TABLE chats DROP COLUMN IF EXISTS entity_id;

-- Добавляем новые столбцы, разрешая NULL на данном этапе
ALTER TABLE chats ADD COLUMN entity_id INT;
ALTER TABLE chats ADD COLUMN entity_type TEXT CHECK (entity_type IN ('service', 'task'));

-- Обновляем существующие записи. ***ВАЖНО: Замените 0 и 'service' на подходящие значения по умолчанию.***
-- Если у вас нет явного значения по умолчанию, возможно, потребуется другая логика.
-- Предполагается, что у вас есть 4 записи, которые нужно обновить.
UPDATE chats SET entity_id = 0, entity_type = 'service' WHERE entity_id IS NULL;

-- Делаем столбцы NOT NULL
ALTER TABLE chats ALTER COLUMN entity_id SET NOT NULL;
ALTER TABLE chats ALTER COLUMN entity_type SET NOT NULL;

-- Добавляем новое ограничение уникальности
ALTER TABLE chats ADD CONSTRAINT unique_chat_per_entity UNIQUE (user_id1, user_id2, entity_id, entity_type);

-- Добавляем ограничение на разные ID пользователей
ALTER TABLE chats ADD CONSTRAINT check_different_users CHECK (user_id1 != user_id2);

-- Пересоздаем старое уникальное ограничение, если оно все еще нужно
ALTER TABLE chats ADD CONSTRAINT unique_chat_pair UNIQUE (user_id1, user_id2);