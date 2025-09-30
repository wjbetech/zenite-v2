/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'src/lib/prisma' {
  // Use very permissive any types for the mocked prisma client used in tests
  const prisma: any;

  export default prisma;
}
