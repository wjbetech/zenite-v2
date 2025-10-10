import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Extended user type that includes the id field
   */
  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  }

  /**
   * Extended session type to include user id
   */
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT token type to include userId
   */
  interface JWT {
    userId?: string;
  }
}
