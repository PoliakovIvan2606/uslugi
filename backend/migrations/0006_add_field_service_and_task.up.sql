ALTER TABLE tasks 
ADD COLUMN user_id INT 
REFERENCES users(id) ON DELETE CASCADE 
DEFAULT 1;

-- После создания можно убрать DEFAULT, чтобы он не подставлялся в будущие задачи автоматически
ALTER TABLE tasks ALTER COLUMN user_id DROP DEFAULT;

-- И добавить NOT NULL, чтобы поле всегда было заполнено
ALTER TABLE tasks ALTER COLUMN user_id SET NOT NULL;

-- 1. Добавляем колонку со значением по умолчанию 1
ALTER TABLE service 
ADD COLUMN user_id INT 
REFERENCES users(id) ON DELETE CASCADE 
DEFAULT 1;

-- 2. Делаем поле обязательным (NOT NULL), чтобы данные были консистентны
ALTER TABLE service ALTER COLUMN user_id SET NOT NULL;

-- 3. (Опционально) Убираем DEFAULT, если для новых записей 
-- вы планируете передавать user_id вручную в коде
ALTER TABLE service ALTER COLUMN user_id DROP DEFAULT;
