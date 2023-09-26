import { Model } from 'mongoose';
import IUsuario from '../models/interfaces/IUsuario';
import AuthService from './AuthService';
import IUsuarioService from './interfaces/IUsuarioService';
import Usuario from '../models/Usuario';
import UsuarioRepository from '../repositorys/UsuarioRepository';

class UsuarioService implements IUsuarioService {
	private model: Model<IUsuario>;

	constructor() {
		this.model = Usuario;
	}
	public async salvarUsuario(
		nome: string,
		email: string,
		senha: string,
	): Promise<IUsuario> {
		try {
			const usuarioExistente = await UsuarioRepository.pegarEmail(email);
			const hashedPassword = await AuthService.hashPassword(senha);

			if (usuarioExistente) {
				throw new Error('Usuário já está Cadstrado!');
			}
			const newUser = await Usuario.create({
				nome,
				email,
				senha: hashedPassword,
			});

			return newUser;
		} catch (error) {
			throw new Error('Erro ao Salvar o Usuário!' + error);
		}
	}

	public async autenticarUsuario(email: string, senha: string): Promise<string> {
		try {
			const token = await AuthService.authenticateUser(email, senha);

			if (token) {
				return token;
			} else {
				throw new Error('Credenciais inválidas!');
			}
		} catch (error) {
			throw new Error('Erro ao Autenticar o Usuário!' + error);
		}
	}
	public async alterarUsuario(
		id: string,
		nome: string,
		email: string,
		senha: string,
	): Promise<IUsuario> {
		try {
			const user = await this.model.findById(id);
			if (!user) {
				throw new Error('Usuário não Encontrado!');
			}

			user.nome = nome;
			user.email = email;

			if (senha) {
				const hashedPassword = await AuthService.hashPassword(senha);
				user.senha = hashedPassword;
			}

			await user.save();

			return user;
		} catch (error) {
			throw new Error('Erro ao Alterar o Usuário!' + error);
		}
	}
	public async alterarSenhaUsuario(id: string, senha: string): Promise<void> {
		try {
			const user = await Usuario.findById(id);
			if (!user) {
				throw new Error('Usuário não Encontrado!');
			}

			const hashedPassword = await AuthService.hashPassword(senha);
			user.senha = hashedPassword;

			await user.save();
		} catch (error) {
			throw new Error('Erro ao Alterar a Senha do Usuário!' + error);
		}
	}

	public async deletarUsuario(id: string): Promise<void> {
		try {
			await this.model.findByIdAndDelete(id);
		} catch (error) {
			throw new Error('Erro ao Deletar o Usuário!' + error);
		}
	}

	public async deletarTodosUsuarios(): Promise<void> {
		try {
			await this.model.deleteMany({});
		} catch (error) {
			throw new Error('Erro ao Deletar todos os Usuários!' + error);
		}
	}
}

export default new UsuarioService();
