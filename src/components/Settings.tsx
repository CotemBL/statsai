import React, { useState, useEffect } from 'react'

interface SettingsProps {
  isConnected: boolean
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    overflow: 'auto',
    flex: 1,
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '12px',
    color: 'var(--text-primary)',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '12px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  label: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  value: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  btn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    outline: 'none',
    marginBottom: '12px',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
  },
  alert: {
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    marginTop: '12px',
  },
}

export const Settings: React.FC<SettingsProps> = ({ isConnected }) => {
  const [gsiInstalled, setGsiInstalled] = useState<boolean | null>(null)
  const [installResult, setInstallResult] = useState<string | null>(null)
  const [manualPath, setManualPath] = useState('')
  const [showManual, setShowManual] = useState(false)

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.gsi.isInstalled().then(setGsiInstalled)
    }
  }, [])

  const handleAutoInstall = async () => {
    try {
      const result = await window.electronAPI.gsi.installConfig()
      if (result.success) {
        setInstallResult(`GSI конфиг установлен: ${result.path}`)
        setGsiInstalled(true)
      } else {
        setInstallResult(result.error || 'Ошибка установки')
        setShowManual(true)
      }
    } catch {
      setInstallResult('Ошибка при установке GSI конфигурации')
    }
  }

  const handleManualInstall = async () => {
    if (!manualPath.trim()) return
    try {
      const result = await window.electronAPI.gsi.installConfigManual(manualPath.trim())
      if (result.success) {
        setInstallResult(`GSI конфиг установлен: ${result.path}`)
        setGsiInstalled(true)
        setShowManual(false)
      } else {
        setInstallResult(result.error || 'Ошибка установки')
      }
    } catch {
      setInstallResult('Ошибка при установке GSI конфигурации')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Настройки</h1>
        <p style={styles.subtitle}>Конфигурация подключения к Dota 2</p>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Статус подключения</div>
        <div style={styles.card}>
          <div style={styles.row}>
            <span style={styles.label}>GSI Сервер</span>
            <span style={{
              ...styles.statusBadge,
              background: isConnected ? 'rgba(0,230,118,0.1)' : 'rgba(85,85,104,0.2)',
              color: isConnected ? 'var(--success)' : 'var(--text-muted)',
              border: `1px solid ${isConnected ? 'rgba(0,230,118,0.3)' : 'var(--border-color)'}`,
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isConnected ? 'var(--success)' : 'var(--text-muted)',
              }} />
              {isConnected ? 'Запущен (порт 3001)' : 'Остановлен'}
            </span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>GSI Конфиг</span>
            <span style={{
              ...styles.statusBadge,
              background: gsiInstalled ? 'rgba(0,230,118,0.1)' : 'rgba(255,167,38,0.1)',
              color: gsiInstalled ? 'var(--success)' : 'var(--warning)',
              border: `1px solid ${gsiInstalled ? 'rgba(0,230,118,0.3)' : 'rgba(255,167,38,0.3)'}`,
            }}>
              {gsiInstalled === null ? 'Проверка...' : gsiInstalled ? 'Установлен' : 'Не установлен'}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Установка GSI конфигурации</div>
        <div style={styles.card}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
            Для получения данных из Dota 2 необходимо установить конфигурационный файл
            Game State Integration в папку игры. Файл будет создан автоматически.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <button
              style={{
                ...styles.btn,
                background: 'var(--accent)',
                color: '#fff',
              }}
              onClick={handleAutoInstall}
              onMouseOver={(e) => { e.currentTarget.style.background = 'var(--accent-hover)' }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'var(--accent)' }}
            >
              Установить автоматически
            </button>
            <button
              style={{
                ...styles.btn,
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
              }}
              onClick={() => setShowManual(!showManual)}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)' }}
            >
              Указать путь вручную
            </button>
          </div>

          {showManual && (
            <div style={{ marginTop: '12px' }}>
              <input
                style={styles.input}
                type="text"
                placeholder="Путь к папке dota 2 beta (например: D:\Steam\steamapps\common\dota 2 beta)"
                value={manualPath}
                onChange={(e) => setManualPath(e.target.value)}
              />
              <button
                style={{
                  ...styles.btn,
                  background: 'var(--accent)',
                  color: '#fff',
                }}
                onClick={handleManualInstall}
              >
                Установить
              </button>
            </div>
          )}

          {installResult && (
            <div style={{
              ...styles.alert,
              background: installResult.includes('установлен')
                ? 'rgba(0,230,118,0.1)'
                : 'rgba(239,83,80,0.1)',
              color: installResult.includes('установлен')
                ? 'var(--success)'
                : 'var(--error)',
              border: `1px solid ${installResult.includes('установлен')
                ? 'rgba(0,230,118,0.2)'
                : 'rgba(239,83,80,0.2)'}`,
            }}>
              {installResult}
            </div>
          )}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Информация</div>
        <div style={styles.card}>
          <div style={{ ...styles.row, marginBottom: '8px' }}>
            <span style={styles.label}>GSI Порт</span>
            <span style={{ ...styles.value, fontFamily: 'monospace' }}>3001</span>
          </div>
          <div style={{ ...styles.row, marginBottom: '8px' }}>
            <span style={styles.label}>Обновление данных</span>
            <span style={styles.value}>каждые 0.5 сек</span>
          </div>
          <div style={{ ...styles.row, marginBottom: '0' }}>
            <span style={styles.label}>C# Моды</span>
            <span style={styles.value}>Поддерживается</span>
          </div>
        </div>
      </div>
    </div>
  )
}
