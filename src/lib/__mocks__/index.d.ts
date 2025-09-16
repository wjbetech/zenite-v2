import { Mock } from 'jest-mock';

declare const prisma: {
  project: {
    findUnique: Mock<Promise<unknown>, unknown[]>;
    update: Mock<Promise<unknown>, unknown[]>;
    delete: Mock<Promise<unknown>, unknown[]>;
    create?: Mock<Promise<unknown>, unknown[]>;
    findMany?: Mock<Promise<unknown>, unknown[]>;
  };
};

export default prisma;
