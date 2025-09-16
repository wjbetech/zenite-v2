declare module 'src/lib/prisma' {
  type MockFn = jest.Mock<Promise<unknown>, unknown[]>;

  const prisma: {
    project: {
      findUnique: MockFn;
      update: MockFn;
      delete: MockFn;
      create?: MockFn;
      findMany?: MockFn;
    };
  };

  export default prisma;
}
