import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };
  let jwt: { sign: jest.Mock };
  let config: { get: jest.Mock };
  let res: { cookie: jest.Mock; clearCookie: jest.Mock };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed-password',
    firstName: 'Jane',
    lastName: 'Doe',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    jwt = { sign: jest.fn().mockReturnValue('signed-token') };
    config = { get: jest.fn().mockReturnValue('7d') };

    res = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('creates user with normalized email and sets token cookie', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register(
        {
          email: 'Test@Example.com',
          password: 'secret123',
          firstName: '  Jane  ',
          lastName: '  Doe  ',
        },
        res as unknown as Response,
      );

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashed-password',
          firstName: 'Jane',
          lastName: 'Doe',
        },
      });
      expect(jwt.sign).toHaveBeenCalledWith({ sub: 'user-1' });
      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'signed-token',
        expect.objectContaining({ httpOnly: true, path: '/' }),
      );
      expect(result.user).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
      });
    });

    it('throws ConflictException when email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register(
          {
            email: 'test@example.com',
            password: 'secret123',
            firstName: 'Jane',
            lastName: 'Doe',
          },
          res as unknown as Response,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('sets token cookie for valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(
        { email: 'Test@Example.com', password: 'secret123' },
        res as unknown as Response,
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('secret123', 'hashed-password');
      expect(res.cookie).toHaveBeenCalled();
      expect(result.user.email).toBe('test@example.com');
    });

    it('throws UnauthorizedException when user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login(
          { email: 'missing@example.com', password: 'secret123' },
          res as unknown as Response,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password is invalid', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login(
          { email: 'test@example.com', password: 'wrong' },
          res as unknown as Response,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('clears token cookie and returns ok', () => {
      const result = service.logout(res as unknown as Response);

      expect(res.clearCookie).toHaveBeenCalledWith(
        'token',
        expect.objectContaining({ httpOnly: true, path: '/' }),
      );
      expect(result).toEqual({ ok: true });
    });
  });
});
