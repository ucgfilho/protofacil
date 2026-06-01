import argon2 from 'argon2';
import { v4 as uuid } from 'uuid';
import type { AuthenticatedUser, UserPreferences } from '@protofacil/shared';
import { PreferenceRepository } from '../repositories/preference.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import type { LoginInput, RegisterInput } from '../validators/auth.validator.js';

export interface AuthResult {
  user: AuthenticatedUser;
  preferences: UserPreferences;
}

export class AuthService {
  constructor(
    private readonly users = new UserRepository(),
    private readonly preferences = new PreferenceRepository()
  ) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw new Error('Já existe uma conta com este e-mail.');
    }

    const id = uuid();
    const passwordHash = await argon2.hash(input.password);
    await this.users.create({ id, name: input.name, email: input.email, passwordHash });
    const preferences = await this.preferences.createDefault(id);

    return {
      user: { id, name: input.name, email: input.email },
      preferences
    };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.users.findByEmail(input.email);
    if (!user) {
      throw new Error('E-mail ou senha inválidos.');
    }

    const validPassword = await argon2.verify(user.passwordHash, input.password);
    if (!validPassword) {
      throw new Error('E-mail ou senha inválidos.');
    }

    const preferences = await this.preferences.findByUserId(user.id);
    if (!preferences) {
      throw new Error('Preferências de acessibilidade não encontradas.');
    }

    return {
      user: { id: user.id, name: user.name, email: user.email },
      preferences
    };
  }
}
