import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hash',
    temperatureUnit: 'C',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    findById: jest.fn().mockResolvedValue(mockUser),
    updateTemperatureUnit: jest.fn().mockImplementation((id: string, unit: 'C' | 'F') =>
      Promise.resolve({ ...mockUser, id, temperatureUnit: unit }),
    ),
    updateProfile: jest.fn().mockImplementation((id: string, data: { name?: string; temperatureUnit?: 'C' | 'F' }) =>
      Promise.resolve({
        ...mockUser,
        id,
        ...(data.name !== undefined && { name: data.name }),
        ...(data.temperatureUnit !== undefined && { temperatureUnit: data.temperatureUnit }),
      }),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile with temperature unit', async () => {
      const req = { user: { id: 'user-123' } };
      const profile = await controller.getProfile(req);

      expect(service.findById).toHaveBeenCalledWith('user-123');
      expect(profile).toEqual({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        avatar: null,
        defaultCity: 'New York',
        temperatureUnit: 'C',
      });
    });
  });

  describe('updateProfile', () => {
    it('should update user name', async () => {
      const req = { user: { id: 'user-123' } };
      const dto = { name: 'Alice Smith' };
      const result = await controller.updateProfile(req, dto);

      expect(service.updateProfile).toHaveBeenCalledWith('user-123', dto);
      expect(result.name).toBe('Alice Smith');
      expect(result.email).toBe('test@example.com');
    });

    it('should update user name and temperature unit together', async () => {
      const req = { user: { id: 'user-123' } };
      const dto = { name: 'Bob Johnson', temperatureUnit: 'F' as const };
      const result = await controller.updateProfile(req, dto);

      expect(service.updateProfile).toHaveBeenCalledWith('user-123', dto);
      expect(result.name).toBe('Bob Johnson');
      expect(result.temperatureUnit).toBe('F');
    });
  });

  describe('updatePreferences', () => {
    it('should update temperature unit to Fahrenheit', async () => {
      const req = { user: { id: 'user-123' } };
      const dto = { temperatureUnit: 'F' as const };
      const result = await controller.updatePreferences(req, dto);

      expect(service.updateTemperatureUnit).toHaveBeenCalledWith('user-123', 'F');
      expect(result.temperatureUnit).toBe('F');
    });

    it('should update temperature unit to Celsius', async () => {
      const req = { user: { id: 'user-123' } };
      const dto = { temperatureUnit: 'C' as const };
      const result = await controller.updatePreferences(req, dto);

      expect(service.updateTemperatureUnit).toHaveBeenCalledWith('user-123', 'C');
      expect(result.temperatureUnit).toBe('C');
    });
  });
});

