import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToMany,JoinTable, ManyToOne } from 'typeorm';
import { Usuario } from './Usuario';
import { Endereco } from './Endereco';
import { Especialidade } from './Especialidades';

interface IUnidadeDeSaude {
  id?: number;
  nome: string;
  imagem: string;
  tipo: string;
  horarioSemanaAbre: string;
  horarioSemanaFecha: string;
  horarioSabadoAbre: string;
  horarioSabadoFecha: string;
  email: string;
  whatsapp: string;
  instagram: string;
  descricao: string;
  longitude: number;
  latitude: number;
  aprovado: boolean;
  status: boolean;
  imagens: string[];
  usuario:Usuario;
  endereco:Endereco;

}

@Entity('UnidadesDeSaude')
export class UnidadeDeSaude implements IUnidadeDeSaude {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  nome: string;

  @Column()
  imagem: string;

  @Column()
  tipo: string;

  @Column()
  horarioSemanaAbre: string;

  @Column()
  horarioSemanaFecha: string;

  @Column()
  horarioSabadoAbre: string;

  @Column()
  horarioSabadoFecha: string;

  @Column()
  email: string;

  @Column()
  whatsapp: string;

  @Column()
  instagram: string;

  @Column()
  descricao: string;

  @Column({ type: 'double precision' })
  longitude: number;

  @Column({ type: 'double precision' })
  latitude: number;

  @Column('text', { array: true })
  imagens: string[];

  
  @ManyToOne(() => Usuario, usuario => usuario.unidadesSaude,{onDelete:'CASCADE'})
  @JoinColumn()
  usuario: Usuario;
  
  @OneToOne(() => Endereco ,{cascade:true})
  @JoinColumn()
  endereco: Endereco;
 

  @Column({default:false})
  aprovado:boolean
  
  @Column({ default: false})
  status:boolean

  @ManyToMany(() => Especialidade)
  @JoinTable()
  especialidades: Especialidade[];
}
