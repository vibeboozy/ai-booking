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
export { Modal } from '@/shared/ui/modal';
export { PriceSlider } from '@/components/ui/slider';
export { Checkbox } from '@/components/ui/checkbox';
export { Sheet } from '@/components/ui/sheet';
export { Calendar } from '@/components/ui/calendar';
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
