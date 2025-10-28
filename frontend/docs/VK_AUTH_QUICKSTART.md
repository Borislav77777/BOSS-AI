# 🚀 VK ID - Быстрый старт за 5 минут

Минимальная инструкция для быстрой интеграции VK ID авторизации в BARSUKOV OS.

## ⚡ Супер быстрый старт

### 1. Создайте приложение VK (2 минуты)

1. Идите на [vk.com/dev](https://vk.com/dev)
2. Нажмите "Создать приложение"
3. Заполните:
```text
Название: BARSUKOV OS
Платформа: Веб-сайт
Домен: your-domain.com
```
4. Скопируйте **App ID** и **Secret Key**

### 2. Настройте переменные (1 минута)

Создайте файл `.env`:

```env
VITE_VK_APP_ID=12345678
VITE_VK_SECRET_KEY=your_secret_key_here
```

### 3. Скопируйте код (2 минуты)

Добавьте в ваш компонент:

```tsx
import React, { useEffect } from 'react';

declare global {
    interface Window {
        VK: any;
    }
}

export const VKAuth = () => {
    useEffect(() => {
        // Загружаем VK API
        const script = document.createElement('script');
        script.src = 'https://vk.com/js/api/openapi.js?169';
        script.onload = () => {
            window.VK.init({ apiId: import.meta.env.VITE_VK_APP_ID });
            window.VK.Widgets.Auth('vk_auth', {
                onAuth: (data) => {
                    console.log('Пользователь авторизован:', data);
                    // Ваша логика здесь
                }
            });
        };
        document.head.appendChild(script);
    }, []);

    return <div id="vk_auth" />;
};
```

### 4. Готово! ✅

VK авторизация работает на вашем сайте!

## 🔧 Дополнительные настройки

### Проверка на сервере (PHP)

```php
<?php
$data = json_decode(file_get_contents('php://input'), true);
$appId = $_ENV['VK_APP_ID'];
$secretKey = $_ENV['VK_SECRET_KEY'];

// Проверяем подлинность
$expectedHash = md5($appId . $data['uid'] . $secretKey);
if ($data['hash'] === $expectedHash) {
    // Авторизация успешна
    session_start();
    $_SESSION['user_id'] = $data['uid'];
    $_SESSION['user_name'] = $data['first_name'] . ' ' . $data['last_name'];
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false]);
}
?>
```

### Проверка на сервере (Node.js)

```javascript
const crypto = require('crypto');

app.post('/api/auth/vk', (req, res) => {
    const { uid, first_name, last_name, hash } = req.body;
    const appId = process.env.VK_APP_ID;
    const secretKey = process.env.VK_SECRET_KEY;

    const expectedHash = crypto
        .createHash('md5')
        .update(appId + uid + secretKey)
        .digest('hex');

    if (hash === expectedHash) {
        // Авторизация успешна
        req.session.userId = uid;
        req.session.userName = `${first_name} ${last_name}`;
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false });
    }
});
```

## 🎨 Стилизация

```css
#vk_auth {
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
}

#vk_auth:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0,119,255,0.3);
}
```

## ❓ Частые проблемы

**Q: Не работает кнопка VK**
A: Проверьте, что App ID правильный и VK API загрузился

**Q: Ошибка "Invalid redirect_uri"**
A: Убедитесь, что redirect URI точно совпадает с настройками в VK

**Q: Не проходит проверка hash**
A: Проверьте Secret Key и убедитесь, что используете MD5

## 📚 Подробная документация

- **[VK_AUTH_GUIDE.md](./VK_AUTH_GUIDE.md)** - Полное руководство
- **[VK_AUTH_EXAMPLES.md](./VK_AUTH_EXAMPLES.md)** - Примеры кода

---

## 🎉 Готово!

VK ID авторизация работает за 5 минут! 🚀
