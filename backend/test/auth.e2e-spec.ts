import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { UsersService } from '../src/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
        AuthModule,
      ],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user and return token', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'password123', name: 'Test User' })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.name).toBe('Test User');
      expect(typeof res.body.access_token).toBe('string');
    });

    it('should reject duplicate email', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: '1',
        email: 'existing@example.com',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'existing@example.com', password: 'password123' })
        .expect(409);

      expect(res.body.message).toContain('already registered');
    });

    it('should reject invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email', password: 'password123' })
        .expect(400);
    });

    it('should reject short password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: '123' })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials and return token', async () => {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('password123', 10);

      mockUsersService.findByEmail.mockResolvedValue({
        id: '1',
        email: 'login@example.com',
        name: 'Login User',
        passwordHash: hashedPassword,
      });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'login@example.com', password: 'password123' })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('login@example.com');
      expect(typeof res.body.access_token).toBe('string');
    });

    it('should reject wrong password', async () => {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('correctpassword', 10);

      mockUsersService.findByEmail.mockResolvedValue({
        id: '1',
        email: 'login@example.com',
        passwordHash: hashedPassword,
      });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'login@example.com', password: 'wrongpassword' })
        .expect(401);

      expect(res.body.message).toContain('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' })
        .expect(401);

      expect(res.body.message).toContain('Invalid credentials');
    });
  });
});
