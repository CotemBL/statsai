import React, { useCallback, useEffect, useState } from 'react'
import { ModsConfig } from '../types'

interface LauncherProps {
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
  modGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  modCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  modCardActive: {
    borderColor: 'var(--accent)',
    boxShadow: '0 0 0 2px rgba(108, 92, 231, 0.18)',
  },
  modHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  modTitle: {
    fontSize: '16px',
    fontWeight: 700,
  },
  modBadge: {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
    padding: '2px 8px',
    borderRadius: '999px',
    border: '1px solid var(--border-color)',
    color: 'var(--text-muted)',
  },
  modBadgeActive: {
    color: 'var(--success)',
    borderColor: 'rgba(0, 230, 118, 0.4)',
    background: 'rgba(0, 230, 118, 0.08)',
  },
  modDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    userSelect: 'none' as const,
  },
  switch: {
    width: '36px',
    height: '20px',
    borderRadius: '999px',
    position: 'relative' as const,
    transition: 'background 0.15s',
    flexShrink: 0,
  },
  switchKnob: {
    position: 'absolute' as const,
    top: '2px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: '#fff',
    transition: 'left 0.15s',
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
    fontFamily: 'monospace',
  },
  inputLabel: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
    color: 'var(--text-muted)',
    marginBottom: '6px',
  },
  actionsRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  primaryBtn: {
    padding: '14px 32px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    background: 'var(--accent)',
    color: '#fff',
    letterSpacing: '0.5px',
    transition: 'background 0.15s, transform 0.1s',
  },
  primaryBtnDisabled: {
    background: 'var(--bg-card)',
    color: 'var(--text-muted)',
    cursor: 'not-allowed',
    border: '1px solid var(--border-color)',
  },
  stopBtn: {
    padding: '14px 32px',
    borderRadius: '10px',
    border: '1px solid var(--error)',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    background: 'transparent',
    color: 'var(--error)',
  },
  hint: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '8px',
    lineHeight: 1.6,
  },
  errorBox: {
    background: 'rgba(239, 83, 80, 0.1)',
    border: '1px solid rgba(239, 83, 80, 0.4)',
    color: 'var(--error)',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 600,
    border: '1px solid var(--border-color)',
  },
}

const DEFAULT_CONFIG: ModsConfig = {
  reverseEngineering: { enabled: false },
  steamidGrabber: { enabled: false, targetUrl: '' },
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        ...styles.switch,
        background: checked ? 'var(--accent)' : 'var(--bg-card-hover)',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
      aria-pressed={checked}
    >
      <span
        style={{
          ...styles.switchKnob,
          left: checked ? '18px' : '2px',
        }}
      />
    </button>
  )
}

export const Launcher: React.FC<LauncherProps> = ({ isConnected }) => {
  const [config, setConfig] = useState<ModsConfig>(DEFAULT_CONFIG)
  const [running, setRunning] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!window.electronAPI) return
    window.electronAPI.mods
      .get()
      .then((cfg) => setConfig(cfg as ModsConfig))
      .catch(() => undefined)
    window.electronAPI.launcher
      .isRunning()
      .then(setRunning)
      .catch(() => undefined)
    const unsub = window.electronAPI.launcher.onStatus((next) => setRunning(next))
    return () => unsub()
  }, [])

  const persist = useCallback(async (next: ModsConfig) => {
    setConfig(next)
    if (!window.electronAPI) return
    try {
      await window.electronAPI.mods.set(next)
    } catch (err) {
      console.error('Не удалось сохранить конфиг модов:', err)
    }
  }, [])

  const handleLaunch = useCallback(async () => {
    if (!window.electronAPI) return
    setPending(true)
    setError(null)
    try {
      const result = await window.electronAPI.launcher.launch()
      if (!result.success) {
        setError(result.error || 'Не удалось запустить оверлей')
      }
    } finally {
      setPending(false)
    }
  }, [])

  const handleStop = useCallback(async () => {
    if (!window.electronAPI) return
    setPending(true)
    try {
      await window.electronAPI.launcher.stop()
    } finally {
      setPending(false)
    }
  }, [])

  const anyEnabled = config.reverseEngineering.enabled || config.steamidGrabber.enabled
  const grabberMisconfigured =
    config.steamidGrabber.enabled && !config.steamidGrabber.targetUrl.trim()

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Лаунчер</h1>
        <p style={styles.subtitle}>
          Выберите моды, которые будут подключены к Dota 2, и нажмите «Запустить» — внутри Dota
          появится перетаскиваемое меню оверлея.
        </p>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.modGrid}>
        <div
          style={{
            ...styles.modCard,
            ...(config.reverseEngineering.enabled ? styles.modCardActive : {}),
          }}
        >
          <div style={styles.modHeader}>
            <div>
              <div style={styles.modTitle}>Reverse Engineering</div>
              <div
                style={{
                  ...styles.modBadge,
                  ...(config.reverseEngineering.enabled ? styles.modBadgeActive : {}),
                }}
              >
                {config.reverseEngineering.enabled ? 'Включён' : 'Выключен'}
              </div>
            </div>
            <ToggleSwitch
              checked={config.reverseEngineering.enabled}
              onChange={(next) =>
                persist({
                  ...config,
                  reverseEngineering: { enabled: next },
                })
              }
            />
          </div>
          <div style={styles.modDesc}>
            Достаёт полные сырые данные от Dota 2 (GSI payload) и показывает их в оверлее. Нужен
            для разработки и отладки будущих модов: можно копировать JSON, исследовать поля и
            строить новые механики поверх этих данных.
          </div>
        </div>

        <div
          style={{
            ...styles.modCard,
            ...(config.steamidGrabber.enabled ? styles.modCardActive : {}),
          }}
        >
          <div style={styles.modHeader}>
            <div>
              <div style={styles.modTitle}>Steam ID Grabber</div>
              <div
                style={{
                  ...styles.modBadge,
                  ...(config.steamidGrabber.enabled ? styles.modBadgeActive : {}),
                }}
              >
                {config.steamidGrabber.enabled ? 'Включён' : 'Выключен'}
              </div>
            </div>
            <ToggleSwitch
              checked={config.steamidGrabber.enabled}
              onChange={(next) =>
                persist({
                  ...config,
                  steamidGrabber: { ...config.steamidGrabber, enabled: next },
                })
              }
            />
          </div>
          <div style={styles.modDesc}>
            Берёт Steam ID всех игроков в твоём матче (тиммейтов и противников) и отправляет их
            POST-запросом на указанный URL. Дубликаты в рамках одного матча не отправляются.
          </div>
          <div>
            <div style={styles.inputLabel}>URL для отправки</div>
            <input
              style={styles.input}
              type="url"
              placeholder="https://example.com/api/steam-ids"
              value={config.steamidGrabber.targetUrl}
              onChange={(e) =>
                persist({
                  ...config,
                  steamidGrabber: { ...config.steamidGrabber, targetUrl: e.target.value },
                })
              }
            />
            {grabberMisconfigured && (
              <div style={{ fontSize: '12px', color: 'var(--warning)', marginTop: '6px' }}>
                Укажите URL — иначе данные отправляться не будут.
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.actionsRow}>
        {!running ? (
          <button
            style={{
              ...styles.primaryBtn,
              ...((!anyEnabled || pending) ? styles.primaryBtnDisabled : {}),
            }}
            onClick={handleLaunch}
            disabled={!anyEnabled || pending}
          >
            {pending ? 'Запускаю…' : '▶ Запустить'}
          </button>
        ) : (
          <button style={styles.stopBtn} onClick={handleStop} disabled={pending}>
            ■ Остановить оверлей
          </button>
        )}

        <span
          style={{
            ...styles.statusPill,
            color: running ? 'var(--success)' : 'var(--text-muted)',
            borderColor: running ? 'rgba(0, 230, 118, 0.4)' : 'var(--border-color)',
            background: running ? 'rgba(0, 230, 118, 0.08)' : 'transparent',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: running ? 'var(--success)' : 'var(--text-muted)',
            }}
          />
          {running ? 'Оверлей запущен' : 'Оверлей выключен'}
        </span>

        <span
          style={{
            ...styles.statusPill,
            color: isConnected ? 'var(--success)' : 'var(--warning)',
            borderColor: isConnected ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255, 167, 38, 0.4)',
            background: isConnected ? 'rgba(0, 230, 118, 0.08)' : 'rgba(255, 167, 38, 0.08)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isConnected ? 'var(--success)' : 'var(--warning)',
            }}
          />
          GSI {isConnected ? 'подключён' : 'не запущен'}
        </span>
      </div>

      <p style={styles.hint}>
        При запуске лаунчер автоматически стартует GSI-сервер и открывает прозрачное окно
        оверлея поверх Dota 2. Тяни оверлей за заголовок, чтобы передвинуть его. Если GSI ещё не
        установлен — открой раздел «Настройки» и нажми «Установить автоматически».
      </p>
    </div>
  )
}
