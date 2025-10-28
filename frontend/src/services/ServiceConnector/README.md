# 🚀 ServiceConnector - Универсальная система подключения сервисов

## 📋 Обзор

ServiceConnector - это комплексная система для автоматического подключения, валидации и мониторинга сервисов в BARSUKOV OS. Система обеспечивает единообразный подход к работе с сервисами, автоматическую валидацию и health check.

## 🏗️ Архитектура

### Основные компоненты

1. **HealthCheckService** - Единая система мониторинга здоровья сервисов
2. **ServiceConnector** - Стандартизированные коннекторы для HTTP-коммуникации
3. **ConnectorManager** - Менеджер всех коннекторов
4. **ConnectorValidator** - Валидация и тестирование коннекторов
5. **ServiceConnectorInterface** - UI для подключения новых сервисов
6. **ServiceConnectorIntegration** - Интеграция с ServiceManager

## 🚀 Быстрый старт

### Подключение нового сервиса через UI

```tsx
import { ServiceConnectorInterface } from '@/services/ServiceConnector';

function App() {
  return (
    <div>
      <ServiceConnectorInterface
        onServiceAdded={(serviceId) => console.log(`Сервис ${serviceId} добавлен`)}
        onServiceRemoved={(serviceId) => console.log(`Сервис ${serviceId} удален`)}
      />
    </div>
  );
}
```

### Программное подключение сервиса

```typescript
import { serviceConnectorIntegration } from '@/services/ServiceConnector';

// Конфигурация сервиса
const serviceConfig: ServiceConfig = {
  id: 'my-service',
  name: 'Мой сервис',
  description: 'Описание сервиса',
  icon: 'Settings',
  version: '1.0.0',
  isActive: true,
  category: 'utility',
  priority: 10,
  author: 'BARSUKOV OS Team',
  tools: [],
  chatButtons: [],
  dependencies: []
};

// Подключение сервиса
await serviceConnectorIntegration.connectService(serviceConfig);
```

## 🔧 Конфигурация

### HealthCheck конфигурация

```typescript
import { healthCheckService } from '@/services/ServiceConnector';

// Добавление health check для сервиса
healthCheckService.addHealthCheck({
  serviceId: 'my-service',
  endpoint: '/api/health/my-service',
  timeout: 5000,
  interval: 30000,
  retries: 3,
  critical: true,
  dependencies: []
});
```

### Connector конфигурация

```typescript
import { connectorManager } from '@/services/ServiceConnector';

// Добавление коннектора
connectorManager.addConnector({
  serviceId: 'my-service',
  connector: {
    serviceId: 'my-service',
    baseUrl: '/api/my-service',
    timeout: 5000,
    retries: 3,
    headers: {
      'X-Service-Type': 'utility'
    },
    healthCheck: {
      endpoint: '/health',
      interval: 30000,
      timeout: 5000
    }
  },
  autoConnect: true,
  retryOnFailure: true,
  maxRetries: 5,
  healthCheckInterval: 30000
});
```

## 🧪 Валидация и тестирование

### Автоматическая валидация

```typescript
import { connectorValidator } from '@/services/ServiceConnector';

// Валидация конфигурации сервиса
const validation = connectorValidator.validateServiceConfig(serviceConfig);
if (!validation.isValid) {
  console.error('Ошибки валидации:', validation.errors);
}

// Тестирование коннектора
const testResults = await connectorValidator.testConnector(
  'my-service',
  connectorConfig
);
```

### Тесты включают

- ✅ Валидация конфигурации
- ✅ Проверка доступности endpoint
- ✅ Тестирование времени ответа
- ✅ Проверка авторизации
- ✅ Валидация health check

## 📊 Мониторинг

### Получение статуса сервисов

```typescript
import { serviceConnectorIntegration } from '@/services/ServiceConnector';

// Статус всех сервисов
const status = serviceConnectorIntegration.getServicesStatus();
console.log('Статус сервисов:', status);

// Health check результаты
const healthResults = healthCheckService.getAllHealthResults();
console.log('Health check:', healthResults);
```

### Подписка на события

```typescript
// Подписка на изменения статуса коннекторов
connectorManager.subscribe((serviceId, status) => {
  console.log(`Сервис ${serviceId}: ${status}`);
});

// Подписка на health check результаты
healthCheckService.subscribe((result) => {
  console.log(`Health check ${result.serviceId}: ${result.status}`);
});
```

## 🔄 Автоматическое переподключение

Система автоматически переподключает сервисы при сбоях:

```typescript
// Настройка автоматического переподключения
serviceConnectorIntegration.updateConfig({
  autoConnect: true,
  autoHealthCheck: true,
  autoRetry: true,
  maxRetries: 5,
  retryDelay: 1000
});
```

## 📈 Метрики

### Доступные метрики

- **Время ответа** - Среднее время ответа сервиса
- **Uptime** - Время работы сервиса
- **Error Rate** - Процент ошибок
- **Request Count** - Количество запросов
- **Memory Usage** - Использование памяти
- **CPU Usage** - Использование CPU

### Получение метрик

```typescript
const connector = connectorManager.getConnector('my-service');
const metrics = connector?.getMetrics();
console.log('Метрики:', metrics);
```

## 🛠️ Расширение

### Создание кастомного коннектора

```typescript
import { ServiceConnector } from '@/services/ServiceConnector';

class CustomConnector extends ServiceConnector {
  // Кастомная логика
  async customMethod() {
    return this.request('/custom-endpoint');
  }
}
```

### Добавление кастомных тестов

```typescript
import { ConnectorValidator } from '@/services/ServiceConnector';

class CustomValidator extends ConnectorValidator {
  async customTest(serviceId: string, config: ConnectorConfig) {
    // Кастомная логика тестирования
  }
}
```

## 🚨 Обработка ошибок

### Типы ошибок

- **Connection Error** - Ошибки подключения
- **Timeout Error** - Превышение времени ожидания
- **Auth Error** - Ошибки авторизации
- **Validation Error** - Ошибки валидации
- **Health Check Error** - Ошибки health check

### Обработка ошибок

```typescript
try {
  await serviceConnectorIntegration.connectService(serviceConfig);
} catch (error) {
  if (error instanceof ConnectionError) {
    console.error('Ошибка подключения:', error.message);
  } else if (error instanceof ValidationError) {
    console.error('Ошибка валидации:', error.message);
  }
}
```

## 📚 API Reference

### ServiceConnectorInterface

```tsx
interface ServiceConnectorInterfaceProps {
  onServiceAdded?: (serviceId: string) => void;
  onServiceRemoved?: (serviceId: string) => void;
  className?: string;
}
```

### ServiceConnectorIntegration

```typescript
class ServiceConnectorIntegration {
  async initialize(): Promise<void>;
  async connectService(service: ServiceConfig): Promise<boolean>;
  disconnectService(serviceId: string): void;
  getServicesStatus(): ServiceStatus[];
  async request<T>(serviceId: string, endpoint: string, options?: any): Promise<T>;
  updateConfig(config: Partial<ServiceConnectorIntegrationConfig>): void;
  getConfig(): ServiceConnectorIntegrationConfig;
}
```

### HealthCheckService

```typescript
class HealthCheckService {
  addHealthCheck(config: HealthCheckConfig): void;
  removeHealthCheck(serviceId: string): void;
  getHealthResult(serviceId: string): HealthCheckResult | null;
  getAllHealthResults(): HealthCheckResult[];
  getOverallStatus(): 'healthy' | 'degraded' | 'unhealthy';
  subscribe(callback: (result: HealthCheckResult) => void): () => void;
  async checkAllServices(): Promise<HealthCheckResult[]>;
  stopAllHealthChecks(): void;
}
```

## 🎯 Лучшие практики

1. **Всегда валидируйте** конфигурацию перед подключением
2. **Используйте health check** для критических сервисов
3. **Настройте автоматическое переподключение** для важных сервисов
4. **Мониторьте метрики** для оптимизации производительности
5. **Обрабатывайте ошибки** gracefully
6. **Используйте правильные timeout** значения
7. **Настройте retry логику** для нестабильных сервисов

## 🔧 Troubleshooting

### Частые проблемы

1. **Сервис не подключается** - Проверьте URL и доступность endpoint
2. **Health check падает** - Проверьте endpoint и timeout
3. **Медленные запросы** - Увеличьте timeout или оптимизируйте сервис
4. **Ошибки авторизации** - Проверьте токены и API ключи
5. **Валидация не проходит** - Проверьте обязательные поля

### Отладка

```typescript
// Включение детального логирования
console.log('Connector status:', connectorManager.getServicesStatus());
console.log('Health check results:', healthCheckService.getAllHealthResults());
console.log('Test results:', connectorValidator.getAllTestResults());
```

## 📝 Changelog

### v1.0.0

- ✅ Базовая система health check
- ✅ Стандартизированные коннекторы
- ✅ Автоматическая валидация
- ✅ UI для подключения сервисов
- ✅ Интеграция с ServiceManager
- ✅ Метрики и мониторинг
- ✅ Автоматическое переподключение
