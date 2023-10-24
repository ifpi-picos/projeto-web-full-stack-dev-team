import FiltroRepository from '../repositorys/FiltroRepository';
import { Request, Response, Router } from 'express';

const filtroRouter = Router();

filtroRouter.get('/buscar/', async (req: Request, res: Response) => {
	try {
		const nome = req.query.nome?.toString();
		if (!nome) {
			return res.status(400).json('O parâmetro "nome" é obrigatório na query.');
		}
		const filtro = await FiltroRepository.filtrar(nome);

		if (!filtro) {
			return res.status(404).json('Nenhum resultado foi encontado!');
		}

		return res.status(200).json(filtro);
	} catch (error) {
		return res.json(error);
	}
});

filtroRouter.get('/unidades-de-saude', async (req: Request, res: Response) => {
	try {
		const unidadesDeSaude = await FiltroRepository.pegarHospitaiseClinicas();

		return res.status(200).json({ Message: unidadesDeSaude });
	} catch (error) {
		return res.json(error);
	}
});

filtroRouter.get(
	'/hospital-ou-cliinca/:nome',
	async (req: Request, res: Response) => {
		try {
			const { nome } = req.params;
			const unidadesDeSuade = await FiltroRepository.pegarHospitalouClinica(
				nome,
			);

			if (unidadesDeSuade) {
				return res.status(200).json(unidadesDeSuade);
			}
			return res.status(404).json({ Message: 'Nenhum resultado encontrado!' });
		} catch (error) {
			return res.json(error);
		}
	},
);
export default filtroRouter;
