import { Request, Response } from 'express';
import knex from '../database/connection';

class PontosController {

    async create(request: Request, response: Response) {
        const {
            nome,
            email,
            whatsapp,
            latitude,
            longitude,
            uf,
            cidade,
            items
        } = request.body;

        const trx = await knex.transaction();

        const ponto = {
            imagem: request.file.filename,
            nome,
            email,
            whatsapp,
            latitude,
            longitude,
            uf,
            cidade
        }

        const insertedIds = await trx('pontosColeta').insert(ponto);

        const pontoColeta_id = insertedIds[0];

        const itemsPonto = items
            .split(',')
            .map((item: string) => Number(item.trim()))
            .map((item_id: number) => {
                return {
                    item_id,
                    pontoColeta_id,
                }
            })
        await trx('itemsPorPontosColeta').insert(itemsPonto);

        trx.commit();

        return response.json({
            id: pontoColeta_id,
            ...ponto,
        });
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;

        const ponto = await knex('pontosColeta').where('id', id).first();

        if (!ponto) {
            return response.status(400).json({ message: 'Ponto de coleta não encontrado' });
        }

        const serializedPonto = {
            ...ponto,
            imagem_url: `http://192.168.0.2:3333/uploads/${ponto.imagem}`
        };

        const items = await knex('items')
            .join('itemsPorPontosColeta', 'items.id', '=', 'itemsPorPontosColeta.item_id')
            .where('itemsPorPontosColeta.pontoColeta_id', id)
            .select('items.titulo');

        return response.json({ ponto: serializedPonto, items });
    }

    async index(request: Request, response: Response) {

        const { cidade, uf, items } = request.query;

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()));

        const pontos = await knex('pontosColeta')
            .join('itemsPorPontosColeta', 'pontosColeta.id', '=', 'itemsPorPontosColeta.pontoColeta_id')
            .whereIn('itemsPorPontosColeta.item_id', parsedItems)
            .where('cidade', String(cidade))
            .where('uf', String(uf))
            .distinct()
            .select('pontosColeta.*');

        const serializedPontos = pontos.map(ponto => {
            return {
                ...ponto,
                imagem_url: `http://192.168.0.2:3333/uploads/${ponto.imagem}`
            };
        });
        return response.json(serializedPontos);
    }
}

export default PontosController;