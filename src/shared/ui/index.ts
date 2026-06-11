/**
 * ANCHOR: shared
 * PURPOSE: UI-примитивы (shadcn/ui).
 * Dependencies: tailwind, @/shared/utils/cn.
 *
 * DO:
 * - Добавлять компоненты через npx shadcn@latest add
 * DONT:
 * - Создавать кастомные .css файлы для primitives
 */

export { Button } from '@/shared/ui/button';
export { Input } from '@/shared/ui/input';
export { Label } from '@/shared/ui/label';
export {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
export { Footer } from '@/shared/ui/footer';
export { Header } from '@/shared/ui/header';
export { LoginForm } from '@/shared/ui/login-form';
