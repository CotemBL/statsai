import React, { useState, useEffect, useCallback } from 'react'
import { GSIMatchState } from './types'
import { TitleBar } from './components/TitleBar'
import { Sidebar, PanelView } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { PlayersPanel } from './components/PlayersPanel'
import { Settings } from './components/Settings'

const styles: Record<string, React.CSSProperties> = {
  app: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  body: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
}

const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<PanelView>('dashboard')
  const [isConnected, setIsConnected] = useState(false)
  const [matchState, setMatchState] = useState<GSIMatchState | null>(null)

  useEffect(() => {
    if (!isElectron) return

    const unsubscribe = window.electronAPI.gsi.onStateUpdate((state: GSIMatchState) => {
      setMatchState(state)
    })

    window.electronAPI.gsi.getStatus().then(setIsConnected)

    return () => {
      unsubscribe()
    }
  }, [])

  const handleConnect = useCallback(async () => {
    if (!isElectron) return
    try {
      await window.electronAPI.gsi.start()
      setIsConnected(true)
    } catch (error) {
      console.error('Ошибка подключения GSI:', error)
    }
  }, [])

  const handleDisconnect = useCallback(async () => {
    if (!isElectron) return
    try {
      await window.electronAPI.gsi.stop()
      setIsConnected(false)
      setMatchState(null)
    } catch (error) {
      console.error('Ошибка отключения GSI:', error)
    }
  }, [])

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard
            matchState={matchState}
            isConnected={isConnected}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        )
      case 'players':
        return <PlayersPanel matchState={matchState} />
      case 'settings':
        return <Settings isConnected={isConnected} />
      default:
        return null
    }
  }

  return (
    <div style={styles.app}>
      {isElectron && <TitleBar />}
      <div style={styles.body}>
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          isConnected={isConnected}
        />
        <div style={styles.content}>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
