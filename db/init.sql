-- Создание таблицы tasks
CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(1000),
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'COMPLETED'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);