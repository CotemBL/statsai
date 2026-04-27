import React from 'react'

const styles = {
  titleBar: {
    height: 'var(--title-bar-height)',
    background: 'var(--bg-secondary)',
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 8px',
    WebkitAppRegion: 'drag',
    borderBottom: '1px solid var(--border-color)',
  } as React.CSSProperties,
  title: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
    paddingLeft: '8px',
  },
  controls: {
    display: 'flex' as const,
    gap: '4px',
    WebkitAppRegion: 'no-drag',
  } as React.CSSProperties,
  btn: {
    width: '28px',
    height: '22px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    transition: 'background 0.15s',
  },
}

export const TitleBar: React.FC = () => {
  return (
    <div style={styles.titleBar}>
      <span style={styles.title}>StatsAI — Dota 2 Mod Launcher</span>
      <div style={styles.controls}>
        <button
          style={styles.btn}
          onClick={() => window.electronAPI.app.minimize()}
          onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-card)' }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'transparent' }}
          title="Свернуть"
        >
          ─
        </button>
        <button
          style={styles.btn}
          onClick={() => window.electronAPI.app.maximize()}
          onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-card)' }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'transparent' }}
          title="Развернуть"
        >
          □
        </button>
        <button
          style={{ ...styles.btn }}
          onClick={() => window.electronAPI.app.quit()}
          onMouseOver={(e) => { e.currentTarget.style.background = '#e74c3c' }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'transparent' }}
          title="Закрыть"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
