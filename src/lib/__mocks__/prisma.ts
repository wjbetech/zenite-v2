const mockProject = {
  findUnique: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockTask = {
  findMany: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

const prisma = {
  project: mockProject,
  task: mockTask,
};

export default prisma;
export { mockProject as __mockProject, mockTask as __mockTask };
