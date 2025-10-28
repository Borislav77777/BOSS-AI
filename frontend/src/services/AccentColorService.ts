/**
 * Сервис для управления акцентными цветами из радужной полоски
 * Динамически меняет акцентные цвета интерфейса на основе цветов полоски
 */

export interface AccentColorSet {
  primary: string;
  secondary: string;
  tertiary: string;
  name: string;
}

export class AccentColorService {
  private static instance: AccentColorService;
  private currentAccentSet: AccentColorSet = {
    primary: '#ff0000',
    secondary: '#ff8000',
    tertiary: '#ffff00',
    name: 'rainbow-red-orange-yellow'
  };

  // Все доступные наборы акцентных цветов из радужной полоски
  private accentSets: AccentColorSet[] = [
    {
      primary: '#ff0000',
      secondary: '#ff8000',
      tertiary: '#ffff00',
      name: 'rainbow-red-orange-yellow'
    },
    {
      primary: '#ff8000',
      secondary: '#ffff00',
      tertiary: '#00ff00',
      name: 'rainbow-orange-yellow-green'
    },
    {
      primary: '#ffff00',
      secondary: '#00ff00',
      tertiary: '#000000',
      name: 'rainbow-yellow-green-black'
    },
    {
      primary: '#00ff00',
      secondary: '#000000',
      tertiary: '#8000ff',
      name: 'rainbow-green-black-purple'
    },
    {
      primary: '#000000',
      secondary: '#8000ff',
      tertiary: '#ff0000',
      name: 'rainbow-black-purple-red'
    },
    {
      primary: '#8000ff',
      secondary: '#ff0000',
      tertiary: '#ff8000',
      name: 'rainbow-purple-red-orange'
    }
  ];

  private constructor() {
    this.initializeAccentColors();
  }

  public static getInstance(): AccentColorService {
    if (!AccentColorService.instance) {
      AccentColorService.instance = new AccentColorService();
    }
    return AccentColorService.instance;
  }

  /**
   * Инициализация акцентных цветов
   */
  private initializeAccentColors(): void {
    this.applyAccentColors(this.currentAccentSet);
  }

  /**
   * Применение акцентных цветов к CSS переменным
   */
  private applyAccentColors(accentSet: AccentColorSet): void {
    const root = document.documentElement;

    root.style.setProperty('--dynamic-accent-primary', accentSet.primary);
    root.style.setProperty('--dynamic-accent-secondary', accentSet.secondary);
    root.style.setProperty('--dynamic-accent-tertiary', accentSet.tertiary);

    // Также обновляем базовые переменные
    root.style.setProperty('--accent-primary', accentSet.primary);
    root.style.setProperty('--accent-secondary', accentSet.secondary);
    root.style.setProperty('--accent-tertiary', accentSet.tertiary);
  }

  /**
   * Установка конкретного набора акцентных цветов
   */
  public setAccentSet(setName: string): void {
    const accentSet = this.accentSets.find(set => set.name === setName);
    if (accentSet) {
      this.currentAccentSet = accentSet;
      this.applyAccentColors(accentSet);
      this.saveAccentSet(setName);
    }
  }

  /**
   * Получение текущего набора акцентных цветов
   */
  public getCurrentAccentSet(): AccentColorSet {
    return this.currentAccentSet;
  }

  /**
   * Получение всех доступных наборов акцентных цветов
   */
  public getAllAccentSets(): AccentColorSet[] {
    return this.accentSets;
  }

  /**
   * Циклическое переключение между наборами акцентных цветов
   */
  public cycleAccentSets(): void {
    const currentIndex = this.accentSets.findIndex(set => set.name === this.currentAccentSet.name);
    const nextIndex = (currentIndex + 1) % this.accentSets.length;
    const nextSet = this.accentSets[nextIndex];

    this.setAccentSet(nextSet.name);
  }

  /**
   * Случайный выбор набора акцентных цветов
   */
  public setRandomAccentSet(): void {
    const randomIndex = Math.floor(Math.random() * this.accentSets.length);
    const randomSet = this.accentSets[randomIndex];

    this.setAccentSet(randomSet.name);
  }

  /**
   * Сохранение выбранного набора в localStorage
   */
  private saveAccentSet(setName: string): void {
    try {
      localStorage.setItem('barsukov-accent-set', setName);
    } catch (error) {
      console.warn('Не удалось сохранить акцентные цвета:', error);
    }
  }

  /**
   * Загрузка сохраненного набора из localStorage
   */
  private loadAccentSet(): string | null {
    try {
      return localStorage.getItem('barsukov-accent-set');
    } catch (error) {
      console.warn('Не удалось загрузить акцентные цвета:', error);
      return null;
    }
  }

  /**
   * Восстановление сохраненного набора при инициализации
   */
  public restoreAccentSet(): void {
    const savedSetName = this.loadAccentSet();
    if (savedSetName) {
      this.setAccentSet(savedSetName);
    }
  }

  /**
   * Автоматическое переключение акцентных цветов (как в полоске)
   */
  public startAutoCycle(intervalMs: number = 10000): void {
    setInterval(() => {
      this.cycleAccentSets();
    }, intervalMs);
  }

  /**
   * Получение цвета по имени из текущего набора
   */
  public getAccentColor(colorType: 'primary' | 'secondary' | 'tertiary'): string {
    return this.currentAccentSet[colorType];
  }

  /**
   * Создание градиента из текущих акцентных цветов
   */
  public createAccentGradient(direction: 'horizontal' | 'vertical' | 'diagonal' = 'diagonal'): string {
    const { primary, secondary, tertiary } = this.currentAccentSet;

    switch (direction) {
      case 'horizontal':
        return `linear-gradient(90deg, ${primary}, ${secondary}, ${tertiary})`;
      case 'vertical':
        return `linear-gradient(180deg, ${primary}, ${secondary}, ${tertiary})`;
      case 'diagonal':
      default:
        return `linear-gradient(135deg, ${primary}, ${secondary}, ${tertiary})`;
    }
  }
}

// Экспорт экземпляра для глобального использования
export const accentColorService = AccentColorService.getInstance();
