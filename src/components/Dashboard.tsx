import React from 'react'
import { GSIMatchState } from '../types'

interface DashboardProps {
  matchState: GSIMatchState | null
  isConnected: boolean
  onConnect: () => void
  onDisconnect: () => void
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '20px',
    transition: 'border-color 0.15s',
  },
  cardLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginBottom: '8px',
  },
  cardValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  scoreRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
  },
  scoreCard: {
    flex: 1,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center' as const,
  },
  connectBtn: {
    padding: '12px 32px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
    letterSpacing: '0.5px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center' as const,
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '8px',
    color: 'var(--text-primary)',
  },
  emptyDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    maxWidth: '400px',
    lineHeight: '1.6',
  },
}

function formatGameTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function getGameStateLabel(state: string): string {
  const states: Record<string, string> = {
    'DOTA_GAMERULES_STATE_INIT': 'Инициализация',
    'DOTA_GAMERULES_STATE_WAIT_FOR_PLAYERS_TO_LOAD': 'Ожидание игроков',
    'DOTA_GAMERULES_STATE_HERO_SELECTION': 'Выбор героев',
    'DOTA_GAMERULES_STATE_STRATEGY_TIME': 'Стратегия',
    'DOTA_GAMERULES_STATE_PRE_GAME': 'Подготовка',
    'DOTA_GAMERULES_STATE_GAME_IN_PROGRESS': 'В игре',
    'DOTA_GAMERULES_STATE_POST_GAME': 'Конец игры',
    'DOTA_GAMERULES_STATE_DISCONNECT': 'Отключение',
  }
  return states[state] || state
}

export const Dashboard: React.FC<DashboardProps> = ({
  matchState,
  isConnected,
  onConnect,
  onDisconnect,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Приватная панель</h1>
        <p style={styles.subtitle}>Мониторинг игровых данных Dota 2 в реальном времени</p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        {!isConnected ? (
          <button
            style={{
              ...styles.connectBtn,
              background: 'var(--accent)',
              color: '#fff',
            }}
            onClick={onConnect}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--accent-hover)' }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--accent)' }}
          >
            ▶ Подключить GSI
          </button>
        ) : (
          <button
            style={{
              ...styles.connectBtn,
              background: 'var(--bg-card)',
              color: 'var(--error)',
              border: '1px solid var(--error)',
            }}
            onClick={onDisconnect}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239,83,80,0.1)' }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-card)' }}
          >
            ■ Отключить GSI
          </button>
        )}
      </div>

      {!matchState ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>◈</div>
          <div style={styles.emptyTitle}>
            {isConnected ? 'Ожидание данных от Dota 2...' : 'GSI не подключен'}
          </div>
          <div style={styles.emptyDesc}>
            {isConnected
              ? 'Запустите матч в Dota 2 — данные появятся автоматически. Убедитесь, что GSI конфигурация установлена.'
              : 'Нажмите "Подключить GSI" для начала мониторинга. Убедитесь, что Dota 2 запущена и GSI конфигурация установлена (раздел Настройки).'}
          </div>
        </div>
      ) : (
        <>
          <div style={styles.grid}>
            <div style={styles.card}>
              <div style={styles.cardLabel}>Статус игры</div>
              <div style={{ ...styles.cardValue, fontSize: '18px' }}>
                {getGameStateLabel(matchState.gameState)}
              </div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardLabel}>Время</div>
              <div style={styles.cardValue}>
                {formatGameTime(matchState.gameTime)}
              </div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardLabel}>Игроков</div>
              <div style={styles.cardValue}>
                {matchState.players.length}
              </div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardLabel}>Match ID</div>
              <div style={{ ...styles.cardValue, fontSize: '16px', fontFamily: 'monospace' }}>
                {matchState.matchId || '—'}
              </div>
            </div>
          </div>

          <div style={styles.scoreRow}>
            <div style={{ ...styles.scoreCard, borderColor: 'var(--radiant)' }}>
              <div style={{ ...styles.cardLabel, color: 'var(--radiant)' }}>Radiant</div>
              <div style={{ ...styles.cardValue, color: 'var(--radiant)' }}>
                {matchState.radiantScore}
              </div>
            </div>
            <div style={{ ...styles.scoreCard, borderColor: 'var(--dire)' }}>
              <div style={{ ...styles.cardLabel, color: 'var(--dire)' }}>Dire</div>
              <div style={{ ...styles.cardValue, color: 'var(--dire)' }}>
                {matchState.direScore}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
