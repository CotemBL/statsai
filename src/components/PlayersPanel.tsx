import React from 'react'
import { GSIMatchState, GSIPlayer } from '../types'

interface PlayersPanelProps {
  matchState: GSIMatchState | null
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
  teamSection: {
    marginBottom: '24px',
  },
  teamHeader: {
    fontSize: '14px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginBottom: '12px',
    padding: '8px 16px',
    borderRadius: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    textAlign: 'left' as const,
    padding: '10px 16px',
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    borderBottom: '1px solid var(--border-color)',
  },
  td: {
    padding: '12px 16px',
    fontSize: '13px',
    borderBottom: '1px solid var(--border-color)',
  },
  playerRow: {
    transition: 'background 0.15s',
    cursor: 'default',
  },
  steamId: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: 'var(--accent)',
    background: 'rgba(108,92,231,0.1)',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  kda: {
    fontWeight: 600,
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
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
  goldText: {
    color: 'var(--gold)',
    fontWeight: 600,
  },
}

function PlayerRow({ player }: { player: GSIPlayer }) {
  return (
    <tr
      style={styles.playerRow}
      onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)' }}
      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      <td style={styles.td}>
        <span style={{ fontWeight: 600 }}>{player.name}</span>
      </td>
      <td style={styles.td}>
        <span style={styles.steamId}>{player.steamid}</span>
      </td>
      <td style={styles.td}>
        {player.hero ? player.hero.replace('npc_dota_hero_', '') : '—'}
      </td>
      <td style={styles.td}>
        {player.level ?? '—'}
      </td>
      <td style={styles.td}>
        <div style={styles.kda}>
          <span style={{ color: 'var(--success)' }}>{player.kills ?? 0}</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--error)' }}>{player.deaths ?? 0}</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>{player.assists ?? 0}</span>
        </div>
      </td>
      <td style={styles.td}>
        <span style={styles.goldText}>{player.gold?.toLocaleString() ?? '—'}</span>
      </td>
      <td style={styles.td}>{player.gpm ?? '—'}</td>
      <td style={styles.td}>{player.xpm ?? '—'}</td>
    </tr>
  )
}

export const PlayersPanel: React.FC<PlayersPanelProps> = ({ matchState }) => {
  if (!matchState || matchState.players.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Игроки</h1>
          <p style={styles.subtitle}>Steam ID и статистика игроков в текущем матче</p>
        </div>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>◎</div>
          <div style={styles.emptyTitle}>Нет данных об игроках</div>
          <div style={styles.emptyDesc}>
            Данные появятся когда начнётся матч. Убедитесь, что GSI подключен и Dota 2 запущена.
          </div>
        </div>
      </div>
    )
  }

  const radiantPlayers = matchState.players.filter(p => p.team === 'radiant')
  const direPlayers = matchState.players.filter(p => p.team === 'dire')
  const otherPlayers = matchState.players.filter(p => p.team !== 'radiant' && p.team !== 'dire')

  const TableHeader = () => (
    <thead>
      <tr>
        <th style={styles.th}>Имя</th>
        <th style={styles.th}>Steam ID</th>
        <th style={styles.th}>Герой</th>
        <th style={styles.th}>Ур.</th>
        <th style={styles.th}>K/D/A</th>
        <th style={styles.th}>Золото</th>
        <th style={styles.th}>GPM</th>
        <th style={styles.th}>XPM</th>
      </tr>
    </thead>
  )

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Игроки</h1>
        <p style={styles.subtitle}>
          Steam ID и статистика {matchState.players.length} игроков в текущем матче
        </p>
      </div>

      {radiantPlayers.length > 0 && (
        <div style={styles.teamSection}>
          <div style={{
            ...styles.teamHeader,
            color: 'var(--radiant)',
            background: 'rgba(76,175,80,0.1)',
            border: '1px solid rgba(76,175,80,0.2)',
          }}>
            Radiant — {radiantPlayers.length} игроков
          </div>
          <table style={styles.table}>
            <TableHeader />
            <tbody>
              {radiantPlayers.map(p => <PlayerRow key={p.steamid} player={p} />)}
            </tbody>
          </table>
        </div>
      )}

      {direPlayers.length > 0 && (
        <div style={styles.teamSection}>
          <div style={{
            ...styles.teamHeader,
            color: 'var(--dire)',
            background: 'rgba(244,67,54,0.1)',
            border: '1px solid rgba(244,67,54,0.2)',
          }}>
            Dire — {direPlayers.length} игроков
          </div>
          <table style={styles.table}>
            <TableHeader />
            <tbody>
              {direPlayers.map(p => <PlayerRow key={p.steamid} player={p} />)}
            </tbody>
          </table>
        </div>
      )}

      {otherPlayers.length > 0 && (
        <div style={styles.teamSection}>
          <div style={{
            ...styles.teamHeader,
            color: 'var(--text-secondary)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}>
            Другие — {otherPlayers.length}
          </div>
          <table style={styles.table}>
            <TableHeader />
            <tbody>
              {otherPlayers.map(p => <PlayerRow key={p.steamid} player={p} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
