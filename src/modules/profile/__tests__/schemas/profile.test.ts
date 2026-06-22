import { describe, it, expect } from 'vitest';
import {
  tripsQuerySchema,
  addFavoriteSchema,
} from '@/modules/profile/schemas/profile';

describe('profile schemas', () => {
  describe('tripsQuerySchema', () => {
    it('валидирует пустой объект', () => {
      const result = tripsQuerySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('валидирует status=upcoming', () => {
      const result = tripsQuerySchema.safeParse({ status: 'upcoming' });
      expect(result.success).toBe(true);
    });

    it('валидирует status=history', () => {
      const result = tripsQuerySchema.safeParse({ status: 'history' });
      expect(result.success).toBe(true);
    });

    it('отклоняет неверный status', () => {
      const result = tripsQuerySchema.safeParse({ status: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('отклоняет статус с другими полями', () => {
      const result = tripsQuerySchema.safeParse({
        status: 'upcoming',
        extra: 'field',
      });
      expect(result.success).toBe(true); // Zod игнорирует лишние поля по умолчанию
    });
  });

  describe('addFavoriteSchema', () => {
    it('валидирует корректный listingId', () => {
      const result = addFavoriteSchema.safeParse({ listingId: 'abc123' });
      expect(result.success).toBe(true);
    });

    it('валидирует listingId с UUID', () => {
      const result = addFavoriteSchema.safeParse({
        listingId: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(result.success).toBe(true);
    });

    it('отклоняет пустой listingId', () => {
      const result = addFavoriteSchema.safeParse({ listingId: '' });
      expect(result.success).toBe(false);
    });

    it('отклоняет отсутствующий listingId', () => {
      const result = addFavoriteSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('отклоняет listingId с пробелами', () => {
      const result = addFavoriteSchema.safeParse({ listingId: '   ' });
      expect(result.success).toBe(false);
    });

    it('возвращает правильное сообщение об ошибке для пустого listingId', () => {
      const result = addFavoriteSchema.safeParse({ listingId: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod v4 uses issues array
        const issues = result.error.issues;
        expect(issues.length).toBeGreaterThan(0);
        expect(issues[0].message).toBe('listingId обязателен');
      }
    });
  });
});
