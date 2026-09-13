const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// GET /api/pontos -> lista todos os pontos de coleta
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM pontos_coleta ORDER BY criado_em DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar pontos de coleta' });
  }
});

// GET /api/pontos/:id -> busca um ponto específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM pontos_coleta WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Ponto de coleta não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar ponto de coleta' });
  }
});

// POST /api/pontos -> cria um novo ponto de coleta
router.post('/', async (req, res) => {
  try {
    const { nome, descricao, tipo_material, latitude, longitude, endereco } = req.body;

    if (!nome || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ erro: 'Campos obrigatórios: nome, latitude, longitude' });
    }

    const result = await pool.query(
      `INSERT INTO pontos_coleta (nome, descricao, tipo_material, latitude, longitude, endereco)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nome, descricao, tipo_material, latitude, longitude, endereco]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar ponto de coleta' });
  }
});

// PUT /api/pontos/:id -> atualiza um ponto de coleta existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, tipo_material, latitude, longitude, endereco } = req.body;

    const result = await pool.query(
      `UPDATE pontos_coleta
       SET nome = $1, descricao = $2, tipo_material = $3,
           latitude = $4, longitude = $5, endereco = $6,
           atualizado_em = NOW()
       WHERE id = $7 RETURNING *`,
      [nome, descricao, tipo_material, latitude, longitude, endereco, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Ponto de coleta não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar ponto de coleta' });
  }
});

// DELETE /api/pontos/:id -> exclui um ponto de coleta
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM pontos_coleta WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Ponto de coleta não encontrado' });
    }

    res.json({ mensagem: 'Ponto de coleta excluído com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir ponto de coleta' });
  }
});

module.exports = router;
