const mockProject = {
  findUnique: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const prisma = {
  project: mockProject,
};

export default prisma;
export { mockProject as __mockProject };
