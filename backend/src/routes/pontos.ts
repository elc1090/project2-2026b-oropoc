import { Router, Request, Response } from 'express';
import pool from '../db/db';
import { PontoColeta, PontoColetaInput } from '../types/ponto';

const router = Router();

// GET /api/pontos -> lista todos os pontos de coleta
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query<PontoColeta>(
      'SELECT * FROM pontos_coleta ORDER BY criado_em DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar pontos de coleta' });
  }
});

// GET /api/pontos/:id -> busca um ponto específico
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query<PontoColeta>(
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
router.post('/', async (req: Request<{}, {}, PontoColetaInput>, res: Response) => {
  try {
    const { nome, descricao, tipo_material, latitude, longitude, endereco } = req.body;

    if (!nome || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ erro: 'Campos obrigatórios: nome, latitude, longitude' });
    }

    const result = await pool.query<PontoColeta>(
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
router.put('/:id', async (req: Request<{ id: string }, {}, PontoColetaInput>, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, descricao, tipo_material, latitude, longitude, endereco } = req.body;

    const result = await pool.query<PontoColeta>(
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
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query<PontoColeta>(
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

export default router;
