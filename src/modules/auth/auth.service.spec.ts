import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../common/enums/user-role.enum';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const usersServiceMock = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  } as unknown as UsersService;

  const jwtServiceMock = {
    sign: jest.fn(),
  } as unknown as JwtService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(usersServiceMock, jwtServiceMock);
  });

  it('register should hash password and return token', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pass');
    (usersServiceMock.create as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'user@mail.com',
      role: UserRole.USER,
    });
    (jwtServiceMock.sign as jest.Mock).mockReturnValue('jwt-token');

    const result = await service.register({
      email: 'user@mail.com',
      password: 'secret123',
    });

    expect(usersServiceMock.create).toHaveBeenCalledWith({
      email: 'user@mail.com',
      password: 'hashed-pass',
      role: UserRole.USER,
    });
    expect(result).toEqual({
      accessToken: 'jwt-token',
      user: { id: 'u1', email: 'user@mail.com', role: UserRole.USER },
    });
  });

  it('login should throw when user not found', async () => {
    (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(null);

    await expect(
      service.login({ email: 'missing@mail.com', password: '123456' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('login should throw on invalid password', async () => {
    (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'user@mail.com',
      password: 'hashed-pass',
      role: UserRole.USER,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({ email: 'user@mail.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('login should return token on valid credentials', async () => {
    (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'user@mail.com',
      password: 'hashed-pass',
      role: UserRole.ADMIN,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwtServiceMock.sign as jest.Mock).mockReturnValue('jwt-token');

    const result = await service.login({
      email: 'user@mail.com',
      password: 'secret123',
    });

    expect(result.user.role).toBe(UserRole.ADMIN);
    expect(result.accessToken).toBe('jwt-token');
  });
});
