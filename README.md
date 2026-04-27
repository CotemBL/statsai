# StatsAI — Dota 2 Mod Launcher

Приватная панель для мониторинга данных Dota 2 в реальном времени. Парсинг Steam ID игроков и игровой статистики через Game State Integration (GSI).

## Возможности

- **Подключение к Dota 2** через Game State Integration (GSI)
- **Парсинг Steam ID** всех игроков в матче
- **Статистика в реальном времени**: K/D/A, золото, GPM, XPM, уровень
- **Приватная панель** с мониторингом состояния игры
- **Автоматическая установка GSI** конфигурации
- **Поддержка C# модов**

## Технологии

- **Electron** — десктопное приложение
- **React + TypeScript** — UI
- **Vite** — сборка
- **Express** — GSI HTTP сервер (порт 3001)

## Запуск

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки (Electron + Vite)
npm run electron:dev

# Сборка
npm run build
```

## Настройка GSI

1. Запустите приложение через `npm run electron:dev`
2. Перейдите в раздел **Настройки**
3. Нажмите **Установить автоматически** (или укажите путь к Dota 2 вручную)
4. Перезапустите Dota 2
5. Нажмите **Подключить GSI** на панели

## Архитектура

```
electron/
├── main.ts           # Electron main process
├── preload.ts        # Preload (contextBridge API)
└── gsi/
    ├── types.ts      # GSI типы данных
    ├── server.ts     # Express GSI сервер
    ├── parser.ts     # Парсинг GSI payload → структуры
    └── installer.ts  # Автоустановка GSI конфига

src/
├── App.tsx           # Основной компонент
├── main.tsx          # Точка входа React
├── types.ts          # Общие типы
├── styles/
│   └── global.css    # Глобальные стили
└── components/
    ├── TitleBar.tsx   # Кастомный title bar
    ├── Sidebar.tsx    # Навигация
    ├── Dashboard.tsx  # Главная панель
    ├── PlayersPanel.tsx # Таблица игроков + Steam ID
    └── Settings.tsx   # Настройки GSI
```

## C# Моды

Моды на C# размещаются отдельно и работают совместно с лаунчером. Панель предоставляет данные для модов через GSI.
