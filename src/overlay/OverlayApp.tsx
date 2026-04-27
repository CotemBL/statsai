import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  GSIMatchState,
  GrabberStatus,
  ModsConfig,
  OverlayPushState,
} from '../types'

const styles: Record<string, React.CSSProperties> = {
  shell: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(10, 10, 18, 0.82)',
    color: '#e8e8f0',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: '12px',
    border: '1px solid rgba(108, 92, 231, 0.4)',
    borderRadius: '10px',
    overflow: 'hidden',
    backdropFilter: 'blur(6px)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    cursor: 'grab',
    userSelect: 'none',
    background: 'rgba(108, 92, 231, 0.18)',
    borderBottom: '1px solid rgba(108, 92, 231, 0.35)',
  },
  headerActive: {
    cursor: 'grabbing',
  },
  title: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1.2px',
    textTransform: 'uppercase' as const,
    color: '#cfc8ff',
  },
  headerControls: {
    display: 'flex',
    gap: '6px',
  },
  iconBtn: {
    border: 'none',
    background: 'transparent',
    color: '#cfc8ff',
    cursor: 'pointer',
    fontSize: '14px',
    width: '22px',
    height: '22px',
    borderRadius: '4px',
  },
  body: {
    flex: 1,
    overflow: 'auto',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: '#9b94c2',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  section: {
    background: 'rgba(26, 26, 46, 0.65)',
    border: '1px solid rgba(108, 92, 231, 0.25)',
    borderRadius: '6px',
    padding: '8px 10px',
  },
  sectionTitle: {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1.2px',
    textTransform: 'uppercase' as const,
    color: '#7c6cf7',
    marginBottom: '6px',
  },
  empty: {
    fontSize: '11px',
    color: '#7a7a96',
    textAlign: 'center' as const,
    padding: '14px 8px',
  },
  jsonView: {
    fontFamily: 'monospace',
    fontSize: '11px',
    background: 'rgba(0, 0, 0, 0.45)',
    color: '#b8b3e6',
    padding: '8px',
    borderRadius: '4px',
    maxHeight: '180px',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
    fontSize: '11px',
    padding: '3px 0',
  },
  rowLabel: {
    color: '#9b94c2',
  },
  rowValue: {
    color: '#e8e8f0',
    fontFamily: 'monospace',
  },
  steamRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '4px 6px',
    borderRadius: '4px',
    background: 'rgba(108, 92, 231, 0.08)',
    fontFamily: 'monospace',
    fontSize: '11px',
  },
  smallBtn: {
    padding: '5px 10px',
    borderRadius: '6px',
    border: '1px solid rgba(108, 92, 231, 0.4)',
    background: 'rgba(108, 92, 231, 0.18)',
    color: '#cfc8ff',
    fontSize: '11px',
    cursor: 'pointer',
  },
  errorText: {
    color: '#ef5350',
    fontSize: '11px',
  },
}

function StateRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={styles.rowValue}>{value}</span>
    </div>
  )
}

function MatchSummary({ state }: { state: GSIMatchState | null }) {
  if (!state) {
    return <div style={styles.empty}>Ожидание данных Dota 2…</div>
  }
  const minutes = Math.max(0, Math.floor(state.gameTime / 60))
  const seconds = Math.max(0, state.gameTime % 60)
  return (
    <div style={styles.list}>
      <StateRow label="Match ID" value={state.matchId ?? '—'} />
      <StateRow label="Игроков" value={state.players.length} />
      <StateRow label="Время" value={`${minutes}:${seconds.toString().padStart(2, '0')}`} />
      <StateRow label="Счёт" value={`${state.radiantScore} : ${state.direScore}`} />
    </div>
  )
}

function ReverseEngineeringPanel({ rawPayload }: { rawPayload: unknown }) {
  const text = useMemo(() => {
    if (rawPayload == null) return ''
    try {
      return JSON.stringify(rawPayload, null, 2)
    } catch {
      return String(rawPayload)
    }
  }, [rawPayload])

  const handleCopy = useCallback(() => {
    if (!text) return
    void navigator.clipboard?.writeText(text).catch(() => undefined)
  }, [text])

  return (
    <div style={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={styles.sectionTitle}>Reverse Engineering</div>
        <button style={styles.smallBtn} onClick={handleCopy} disabled={!text}>
          Копировать
        </button>
      </div>
      {text ? (
        <pre style={styles.jsonView}>{text}</pre>
      ) : (
        <div style={styles.empty}>Нет данных. Запустите матч в Dota 2.</div>
      )}
    </div>
  )
}

function SteamIdGrabberPanel({
  matchState,
  status,
  config,
}: {
  matchState: GSIMatchState | null
  status: GrabberStatus
  config: ModsConfig
}) {
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleSendNow = useCallback(async () => {
    setPending(true)
    setFeedback(null)
    try {
      const result = await window.electronAPI.grabber.sendNow()
      setFeedback(result.ok ? 'Отправлено' : result.error || 'Ошибка')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Ошибка')
    } finally {
      setPending(false)
    }
  }, [])

  const ids = (matchState?.players ?? []).map((p) => p.steamid).filter(Boolean)
  const lastSent = status.lastSentAt
    ? new Date(status.lastSentAt).toLocaleTimeString()
    : '—'

  return (
    <div style={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={styles.sectionTitle}>Steam ID Grabber</div>
        <button
          style={styles.smallBtn}
          onClick={handleSendNow}
          disabled={pending || !config.steamidGrabber.targetUrl || ids.length === 0}
        >
          {pending ? '...' : 'Отправить'}
        </button>
      </div>
      <div style={styles.list}>
        <StateRow
          label="URL"
          value={config.steamidGrabber.targetUrl ? config.steamidGrabber.targetUrl : 'не задан'}
        />
        <StateRow label="Отправлено" value={status.sentCount} />
        <StateRow label="Последняя" value={lastSent} />
        {status.lastError && (
          <div style={styles.errorText}>Ошибка: {status.lastError}</div>
        )}
      </div>
      <div style={{ marginTop: '8px' }}>
        {ids.length === 0 ? (
          <div style={styles.empty}>Steam ID появятся когда начнётся матч.</div>
        ) : (
          <div style={styles.list}>
            {ids.map((id) => (
              <div key={id} style={styles.steamRow}>
                <span>{id}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {feedback && <div style={{ marginTop: '6px', fontSize: '11px' }}>{feedback}</div>}
    </div>
  )
}

export const OverlayApp: React.FC = () => {
  const [state, setState] = useState<OverlayPushState | null>(null)
  const [dragging, setDragging] = useState(false)
  const dragLast = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    let cancelled = false
    const api = window.electronAPI
    if (!api) return
    api.overlay
      .requestState()
      .then((next) => {
        if (!cancelled) setState(next)
      })
      .catch(() => undefined)
    const unsub = api.overlay.onPush((next) => {
      setState(next as OverlayPushState)
    })
    return () => {
      cancelled = true
      unsub()
    }
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragLast.current = { x: e.screenX, y: e.screenY }
    setDragging(true)
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragLast.current) return
      const dx = e.screenX - dragLast.current.x
      const dy = e.screenY - dragLast.current.y
      if (dx === 0 && dy === 0) return
      dragLast.current = { x: e.screenX, y: e.screenY }
      window.electronAPI.overlay.moveBy(dx, dy)
    },
    [],
  )

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    dragLast.current = null
    setDragging(false)
  }, [])

  const handleClose = useCallback(() => {
    window.electronAPI.overlay.close()
  }, [])

  const isConnected = state?.isConnected ?? false
  const mods = state?.modsConfig
  const showRE = mods?.reverseEngineering.enabled ?? false
  const showGrabber = mods?.steamidGrabber.enabled ?? false

  return (
    <div style={styles.shell}>
      <div
        style={{ ...styles.header, ...(dragging ? styles.headerActive : {}) }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div>
          <div style={styles.title}>StatsAI Overlay</div>
          <div style={styles.status}>
            <span
              style={{
                ...styles.dot,
                background: isConnected ? '#00e676' : '#555568',
                boxShadow: isConnected ? '0 0 6px #00e676' : 'none',
              }}
            />
            {isConnected ? 'GSI online' : 'GSI offline'}
          </div>
        </div>
        <div style={styles.headerControls}>
          <button
            style={styles.iconBtn}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleClose}
            title="Закрыть оверлей"
          >
            ✕
          </button>
        </div>
      </div>
      <div style={styles.body}>
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Матч</div>
          <MatchSummary state={state?.matchState ?? null} />
        </div>

        {!showRE && !showGrabber && (
          <div style={styles.empty}>
            Ни один мод не включён. Откройте лаунчер и включите хотя бы один мод.
          </div>
        )}

        {showRE && <ReverseEngineeringPanel rawPayload={state?.rawPayload ?? null} />}

        {showGrabber && state && mods && (
          <SteamIdGrabberPanel
            matchState={state.matchState}
            status={state.grabberStatus}
            config={mods}
          />
        )}
      </div>
    </div>
  )
}
