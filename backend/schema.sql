-- Schema do banco de dados para o app de Mapa de Pontos de Coleta
-- Execute este arquivo no seu banco PostgreSQL para criar a tabela necessária.

CREATE TABLE IF NOT EXISTS pontos_coleta (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    tipo_material VARCHAR(100),        -- ex: "plástico", "eletrônico", "papel"
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    endereco VARCHAR(255),
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pontos_coleta_lat_lng
    ON pontos_coleta (latitude, longitude);
