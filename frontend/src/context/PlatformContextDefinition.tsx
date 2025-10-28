import { PlatformContextType } from '@/types';
import { createContext } from 'react';

// Создание контекста
export const PlatformContext = createContext<PlatformContextType | undefined>(undefined);
