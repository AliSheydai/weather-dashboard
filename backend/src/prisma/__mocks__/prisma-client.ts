export class PrismaClient {
  user = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  };
  searchHistory = {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  };
  favoriteCity = {
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  };
  $connect = jest.fn();
  $disconnect = jest.fn();
}
