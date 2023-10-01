import { Request, Response, Router } from 'express';
import HospitalService from '../services/HospitalService';
import HospitalRepository from '../repositorys/HospitalRepository';
import { authMiddleware } from '../middlewares/auth';
import validation from '../middlewares/validation';
import EnderecoService from '../services/EnderecoService';

const hospitalRouter = Router();

// cadastrar hospital
hospitalRouter.post(
	'/admin/novo-hospital',
	async (req: Request, res: Response) => {
		try {
			const camposAValidar = [
				'cep',
				'rua',
				'numero',
				'bairro',
				'cidade',
				'uf',
				'nome',
				'horarioSemana',
				'sabado',
				'longitude',
				'latitude',
				'especialidades',
			];

			const erros: string[] = [];
			validation.finalizarValidacao(camposAValidar, req, erros);

			const errosFiltrados = erros.filter(erro => erro !== '');

			if (errosFiltrados.length > 0) {
				return res.json({
					Message: 'Campos inválidos',
					Errors: errosFiltrados,
				});
			} else if (req.body.nome.length < 2) {
				return res.json({ Message: 'Nome muito curto!!' });
			} else {
				const novoEndereco = await EnderecoService.cadastrarEndereco(req.body);

				if (novoEndereco) {
					const novoHospitalData = { ...req.body, endereco: novoEndereco._id };
					const novoHospital = await HospitalService.novoHospital(
						novoHospitalData,
					);

					if (novoHospital === null) {
						return res
							.status(400)
							.json({ Message: 'Esse Hospital já está Cadastrada!' });
					}
					return res.status(201).json({
						Message: 'Hospital salvo com Sucesso!',
						data: novoHospital,
					});
				}
			}
		} catch (error) {
			return res.status(500).json(error);
		}
	},
);

// alterar o hospital
hospitalRouter.put(
	'/admin/alterar-hospital/:id',

	async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			const camposAValidar = [
				'cep',
				'rua',
				'numero',
				'bairro',
				'cidade',
				'uf',
				'nome',
				'horarioSemana',
				'sabado',
				'longitude',
				'latitude',
				'especialidades',
			];

			const erros: string[] = [];
			validation.finalizarValidacao(camposAValidar, req, erros);

			const errosFiltrados = erros.filter(erro => erro !== '');

			if (errosFiltrados.length > 0) {
				return res.json({
					Message: 'Campos inválidos',
					Errors: errosFiltrados,
				});
			} else if (req.body.nome.length < 2) {
				return res.json({ Message: 'Nome muito curto!!' });
			} else {
				const hosítalAtualizado = await HospitalService.alterarHospital(
					id,
					req.body,
				);
				if (hosítalAtualizado === null) {
					return res
						.status(400)
						.json({ Message: 'Esse Hospital já está Cadastrado!' });
				}
				await EnderecoService.alterarEndereco(
					hosítalAtualizado.endereco.toString(),
					req.body,
				);

				return res.status(201).json({
					Message: 'Hospital Atualizado com Sucesso!',
					data: hosítalAtualizado,
				});
			}
		} catch (error) {
			return res.status(500).json(error);
		}
	},
);

// deletar o hospital
hospitalRouter.delete(
	'/admin/deletar-hospital/:id',
	async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			const deletarHospital = await HospitalService.deletarHospital(id);
			if (deletarHospital) {
				EnderecoService.deletarEndereco(deletarHospital.endereco.toString());
				return res.status(204);
			}
			return res.status(404).json({ Message: 'Hospital não Encontrado' });
		} catch (error) {
			return res.status(500).json(error);
		}
	},
);
// deletar todos hospitais
hospitalRouter.delete(
	'/admin/deletar',
	authMiddleware,
	async (req: Request, res: Response) => {
		try {
			await HospitalService.deletarTodosHospitais();
			res
				.status(201)
				.json({ Message: 'Todos os Hospitais foram Deletados com Sucesso!' });
		} catch (error) {
			return res.status(500).json(error);
		}
	},
);

// listar hospitais
hospitalRouter.get('/hospitais', async (req: Request, res: Response) => {
	try {
		const hospitais = await HospitalRepository.pegarHospitais();
		if (!hospitais) {
			return res.status(404).json('Nenhum hsopital foi encontrado!');
		}
		return res.status(201).json(hospitais);
	} catch (error) {
		console.log(error);
		return res.status(500).json(error);
	}
});
// filtrar clinica
hospitalRouter.get('/hospital/:nome', async (req: Request, res: Response) => {
	try {
		const { nome } = req.params;
		const hospital = await HospitalRepository.pegarHospital(nome);
		if (!hospital) {
			res.status(404).json('Hsopital não encontrado!');
		}
		return res.status(201).json(hospital);
	} catch (error) {
		return res.status(500).json(error);
	}
});

export default hospitalRouter;
