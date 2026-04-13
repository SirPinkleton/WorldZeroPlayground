import { useState } from 'react'
import PageTitle from '../components/ui/PageTitle'
import ModerationTab from './admin/ModerationTab'
import TasksTab from './admin/TasksTab'
import AccountsTab from './admin/AccountsTab'
import OverviewTab from './admin/OverviewTab'

type Tab = 'moderation' | 'tasks' | 'accounts' | 'overview'

const TABS: { key: Tab; label: string }[] = [
  { key: 'moderation', label: 'Moderation' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'overview', label: 'Overview' },
]

function getInitialTab(): Tab {
  const hash = window.location.hash.replace('#', '')
  if (TABS.some((t) => t.key === hash)) return hash as Tab
  return 'moderation'
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>(getInitialTab)

  const switchTab = (tab: Tab) => {
    setActiveTab(tab)
    window.location.hash = tab
  }

  return (
    <div className="py-8">
      <PageTitle title="Admin" />

      {/* Tab bar */}
      <div
        className="flex gap-6 mb-6"
        style={{ borderBottom: '2px solid var(--color-border)' }}
      >
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            className="eyebrow pb-2 transition-colors"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === key ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
              borderBottom: activeTab === key ? '2px solid var(--color-text-primary)' : '2px solid transparent',
              marginBottom: -2,
              fontFamily: "'Courier Prime', monospace",
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'moderation' && <ModerationTab />}
      {activeTab === 'tasks' && <TasksTab />}
      {activeTab === 'accounts' && <AccountsTab />}
      {activeTab === 'overview' && <OverviewTab />}
    </div>
  )
}
