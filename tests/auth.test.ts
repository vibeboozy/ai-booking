// Unit tests for authentication authorize function
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Set test environment
process.env.NODE_ENV = 'test';

// Mock next-auth and providers
vi.mock('next-auth', () => ({
  default: () => ({ handlers: { GET: () => {}, POST: () => {} } }),
}));
vi.mock('next-auth/providers/credentials', () => ({
  default: (config: any) => config,
}));
vi.mock('next-auth/providers/google', () => ({
  default: (config: any) => config,
}));

// Mock next/server used by next-auth internals
vi.mock('next/server', () => ({}));

// Mock Prisma client using alias
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock bcrypt compare with default export
vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}));

// Import after mocks
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

describe('CredentialsProvider authorize', () => {
  const authorize = (authOptions.providers[0] as any).authorize;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when email is missing', async () => {
    const result = await authorize({ email: undefined, password: 'pwd' });
    expect(result).toBeNull();
  });

  it('returns null when user not found', async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);
    const result = await authorize({ email: 'test@example.com', password: 'pwd' });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    expect(result).toBeNull();
  });

  it('returns user object when password hash matches', async () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      avatarUrl: 'http://example.com/avatar.png',
      passwordHash: 'hashed',
    };
    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
    (bcrypt.compare as any).mockResolvedValue(true);
    const result = await authorize({ email: 'test@example.com', password: 'pwd' });
    expect(bcrypt.compare).toHaveBeenCalledWith('pwd', 'hashed');
    expect(result).toEqual({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      image: mockUser.avatarUrl,
    });
  });

  it('returns null when password hash does not match', async () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      avatarUrl: 'http://example.com/avatar.png',
      passwordHash: 'hashed',
    };
    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
    (bcrypt.compare as any).mockResolvedValue(false);
    const result = await authorize({ email: 'test@example.com', password: 'wrong' });
    expect(bcrypt.compare).toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
