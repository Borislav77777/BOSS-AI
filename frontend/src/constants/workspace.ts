/**
 * Константы для рабочего пространства
 */

export const WORKSPACE = {
  // Режимы отображения
  LAYOUTS: {
    GRID: 'grid',
    LIST: 'list',
    COMPACT: 'compact',
  } as const,

  // Размеры элементов
  ITEMS: {
    GRID_ITEM_SIZE: 200,
    GRID_ITEM_MIN_SIZE: 150,
    GRID_ITEM_MAX_SIZE: 300,
    LIST_ITEM_HEIGHT: 60,
    COMPACT_ITEM_HEIGHT: 40,
  },

  // Пагинация
  PAGINATION: {
    ITEMS_PER_PAGE: 20,
    LOAD_MORE_COUNT: 10,
  },

  // Поиск и фильтрация
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    DEBOUNCE_DELAY: 300,
    MAX_RESULTS: 100,
  },

  // Файловые операции
  FILES: {
    MAX_UPLOAD_SIZE: 100 * 1024 * 1024, // 100MB
    ALLOWED_EXTENSIONS: [
      '.txt', '.md', '.json', '.csv', '.xml',
      '.jpg', '.jpeg', '.png', '.gif', '.webp',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx',
      '.zip', '.rar', '.7z',
    ],
    PREVIEW_MAX_SIZE: 5 * 1024 * 1024, // 5MB для предпросмотра
  },

  // Drag & Drop
  DRAG_DROP: {
    DRAG_OVER_CLASS: 'drag-over',
    DRAG_ACTIVE_CLASS: 'drag-active',
    DROP_ZONE_CLASS: 'drop-zone',
  },
} as const;

export type WorkspaceConstants = typeof WORKSPACE;
