import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { email, password } = createUserDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Este e-mail já está em uso.');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(newUser);
    delete savedUser.password;
    return savedUser;
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.find();
    users.forEach(user => delete user.password);
    return users;
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuário com o ID '${id}' não encontrado.`);
    }

    delete user.password;
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    if (updateUserDto.email) {
      const existingUser = await this.userRepository.findOne({
        where: {
          email: updateUserDto.email,
          id: Not(id),
        },
      });
      if (existingUser) {
        throw new ConflictException('O e-mail informado já está em uso por outra conta.');
      }
    }

    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    const userToUpdate = await this.userRepository.preload({
      id: id,
      ...updateUserDto,
    });

    if (!userToUpdate) {
      throw new NotFoundException(`Usuário com o ID '${id}' não encontrado.`);
    }

    const updatedUser = await this.userRepository.save(userToUpdate);
    delete updatedUser.password;
    return updatedUser;
  }

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Usuário com o ID '${id}' não encontrado.`);
    }

    return { message: `Usuário com o ID '${id}' foi deletado com sucesso.` };
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

}

