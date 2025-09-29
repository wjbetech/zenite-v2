import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// Mock Clerk's useUser hook
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
  SignedIn: (({ children }: { children?: React.ReactNode }) => <>{children}</>) as React.FC,
  SignedOut: (({ children }: { children?: React.ReactNode }) => <>{children}</>) as React.FC,
  SignInButton: (({ children }: { children?: React.ReactNode }) => <>{children}</>) as React.FC,
  SignOutButton: (({ children }: { children?: React.ReactNode }) => <>{children}</>) as React.FC,
}));

import Navbar from '../Navbar';
import { useUser } from '@clerk/nextjs';

describe('Navbar avatar', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders profile image when user has imageUrl', async () => {
    (useUser as jest.Mock).mockReturnValue({
      user: { fullName: 'Test User', imageUrl: 'https://img.clerk.com/avatar.jpg' },
    });
    render(React.createElement(Navbar));

    await waitFor(() => expect(screen.getByAltText(/Test User's avatar/i)).toBeInTheDocument());
  });

  it('renders initials when no imageUrl present', async () => {
    (useUser as jest.Mock).mockReturnValue({ user: { fullName: 'Alpha Beta' } });
    render(React.createElement(Navbar));

    await waitFor(() => expect(screen.getByText('AB')).toBeInTheDocument());
  });
});
