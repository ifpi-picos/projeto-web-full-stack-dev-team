import { Request, Response, Router } from 'express';
import ClinicaService from '../services/ClinicaService';
import ClinicaRepository from '../repositorys/ClinicaRepository';
import validation from '../middlewares/validation';
import EnderecoService from '../services/EnderecoService';
import EspecialidadesService from '../services/EspecialidadesService';
import EspecialidadesRepository from '../repositorys/EspecialidadesRepository';
import UsuarioService from '../services/UsuarioService';
const clinicaRouter = Router();

// cadastrar clínica
clinicaRouter.post(
	'/admin/nova-clinica',
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
				return res.json({ Message: 'Nome muito curto!' });
			} else {
				const novoEndereco = await EnderecoService.cadastrarEndereco(req.body);

				if (novoEndereco) {
					const novaClinicaData = { ...req.body, endereco: novoEndereco._id };
					const novaClinica = await ClinicaService.novaClinica(novaClinicaData);

					if (novaClinica === null) {
						return res
							.status(400)
							.json({ Message: 'Essa Clínica já está Cadastrada!' });
					}
					const especialidadesIds = req.body.especialidades;

					await EspecialidadesService.adicionarClinicaAEspecialidades(
						especialidadesIds,
						novaClinica._id,
					);
					await UsuarioService.adicionarClinicaAoUsuario(
						novaClinica.usuario.toString(),
						novaClinica._id,
					);
					return res.status(201).json({
						Message: 'Clínica salva com Sucesso!',
						data: novaClinica,
					});
				}
			}
		} catch (error) {
			if (error instanceof Error) return res.status(500).json(error.message);
		}
	},
);

// alterar a clínica
clinicaRouter.put(
	'/admin/alterar-clinica/:id',
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
				'longitude',
				'latitude',
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
				const enderecoId = await EnderecoService.cadastrarEndereco(req.body);
				const clinicaAtualizadaData = { ...req.body, endereco: enderecoId };
				const clinicaAtualizada = await ClinicaService.alterarClinica(
					id,
					clinicaAtualizadaData,
				);

				if (clinicaAtualizada === null) {
					return res
						.status(400)
						.json({ Message: 'Essa Clínica já está Cadastrada!' });
				}

				const especialidadesIds = req.body.especialidades;
				const idDasEspecialidades =
					await EspecialidadesRepository.listarIdsDasEspecialidadesPorClinica(
						clinicaAtualizada._id,
					);
				await EspecialidadesService.removerclinicaDasEspecialidades(
					clinicaAtualizada._id,
					idDasEspecialidades,
				);

				await EspecialidadesService.adicionarClinicaAEspecialidades(
					especialidadesIds,
					clinicaAtualizada._id,
				);

				return res.status(201).json({
					Message: 'Clínica Atualizada com Sucesso!',
					data: clinicaAtualizada,
				});
			}
		} catch (error) {
			return res.status(500).json(error);
		}
	},
);

// deletar a clínica
clinicaRouter.delete(
	'/admin/deletar-clinica/:id',

	async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			const deletarClinica = await ClinicaService.deletarClinica(id);
			if (deletarClinica) {
				await EnderecoService.deletarEndereco(
					deletarClinica.endereco.toString(),
				);
				const idDasEspecialidades =
					await EspecialidadesRepository.listarIdsDasEspecialidadesPorClinica(
						id,
					);
				await EspecialidadesService.removerclinicaDasEspecialidades(
					id,
					idDasEspecialidades,
				);

				await UsuarioService.removerclinicaDoUsuario(
					deletarClinica.usuario.toString(),
					id,
				);
				return res.status(204).json('');
			}
			return res.status(404).json({ Message: 'Clínica não Encontrada' });
		} catch (error) {
			return res.status(500).json(error);
		}
	},
);

// listar clínicas
clinicaRouter.get('/clinicas', async (req: Request, res: Response) => {
	try {
		const clinicas = await ClinicaRepository.pegarClinicas();

		return res.status(200).json(clinicas);
	} catch (error) {
		return res.status(500).json(error);
	}
});

// filtrar clinica
clinicaRouter.get('/clinica/:nome', async (req: Request, res: Response) => {
	try {
		const { nome } = req.params;
		const clinica = await ClinicaRepository.pegarClinica(nome);
		if (!clinica) {
			return res.status(404).json('Clínica não encontrada!');
		}
		return res.status(200).json(clinica);
	} catch (error) {
		return res.status(500).json(error);
	}
});

export default clinicaRouter;
