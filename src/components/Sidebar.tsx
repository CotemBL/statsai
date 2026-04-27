import React from 'react'

export type PanelView = 'launcher' | 'dashboard' | 'players' | 'settings'

interface SidebarProps {
  activeView: PanelView
  onViewChange: (view: PanelView) => void
  isConnected: boolean
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '220px',
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 0',
  },
  section: {
    padding: '0 12px',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '10px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '1.5px',
    marginBottom: '8px',
    paddingLeft: '12px',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: 500,
    width: '100%',
    textAlign: 'left' as const,
  },
  menuItemActive: {
    background: 'var(--bg-card)',
    color: 'var(--accent)',
    border: '1px solid var(--border-active)',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  statusBlock: {
    marginTop: 'auto',
    padding: '12px',
    margin: '0 12px',
    background: 'var(--bg-card)',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
  },
  statusLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginBottom: '4px',
  },
  statusValue: {
    fontSize: '13px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
}

const menuItems: { id: PanelView; label: string; icon: string }[] = [
  { id: 'launcher', label: 'Лаунчер', icon: '▶' },
  { id: 'dashboard', label: 'Панель', icon: '◈' },
  { id: 'players', label: 'Игроки', icon: '◎' },
  { id: 'settings', label: 'Настройки', icon: '⚙' },
]

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isConnected }) => {
  return (
    <div style={styles.sidebar}>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Навигация</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            style={{
              ...styles.menuItem,
              ...(activeView === item.id ? styles.menuItemActive : {}),
            }}
            onClick={() => onViewChange(item.id)}
            onMouseOver={(e) => {
              if (activeView !== item.id) {
                e.currentTarget.style.background = 'var(--bg-card-hover)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }
            }}
            onMouseOut={(e) => {
              if (activeView !== item.id) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }
            }}
          >
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div style={styles.statusBlock}>
        <div style={styles.statusLabel}>Dota 2 GSI</div>
        <div style={{
          ...styles.statusValue,
          color: isConnected ? 'var(--success)' : 'var(--text-muted)',
        }}>
          <span style={{
            ...styles.statusDot,
            background: isConnected ? 'var(--success)' : 'var(--text-muted)',
            boxShadow: isConnected ? '0 0 8px var(--success)' : 'none',
          }} />
          {isConnected ? 'Подключено' : 'Отключено'}
        </div>
      </div>
    </div>
  )
}
