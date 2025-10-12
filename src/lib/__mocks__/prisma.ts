const mockProject = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockTask = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

const mockActivity = {
  create: jest.fn(),
  deleteMany: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
};

const mockUser = {
  upsert: jest.fn(),
  findUnique: jest.fn(),
};

const prisma = {
  project: mockProject,
  task: mockTask,
  activity: mockActivity,
  user: mockUser,
};

export default prisma;
export {
  mockProject as __mockProject,
  mockTask as __mockTask,
  mockActivity as __mockActivity,
  mockUser as __mockUser,
};
