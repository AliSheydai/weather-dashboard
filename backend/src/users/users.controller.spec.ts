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
