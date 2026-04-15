import { Link } from 'react-router-dom'
import type { ActivityFeedItem } from '../../api/activityFeed'
import FeedBadge from './FeedBadge'

interface Props {
  item: ActivityFeedItem
}

export default function FeedCardEraAnnouncement({ item }: Props) {
  const { era_name, era_notes } = item.payload

  return (
    <div
      className="sidebar-card"
      style={{
        background: '#1a1209',
        color: '#F7F4EE',
        padding: '20px 24px',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>&#x1F310;</span>
        <span className="eyebrow" style={{ color: '#c49a3a', fontSize: 8 }}>
          Era Announcement
        </span>
        <span style={{ marginLeft: 'auto' }}>
          <FeedBadge type="admin" label="Admin" />
        </span>
      </div>

      <h3
        className="font-display italic"
        style={{ fontSize: 18, color: '#F7F4EE', marginBottom: 8, lineHeight: 1.3 }}
      >
        {era_name} is now active.
      </h3>

      {era_notes && (
        <p className="font-body" style={{ fontSize: 11, color: 'rgba(247,244,238,0.75)', marginBottom: 16, lineHeight: 1.5 }}>
          {era_notes}
        </p>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <Link
          to="/tasks"
          style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            background: '#F7F4EE',
            color: '#1a1209',
            padding: '8px 16px',
            textDecoration: 'none',
          }}
        >
          See New Tasks
        </Link>
        <Link
          to="/praxes"
          style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            border: '1px solid rgba(247,244,238,0.4)',
            color: '#F7F4EE',
            padding: '8px 16px',
            textDecoration: 'none',
          }}
        >
          Era Archive
        </Link>
      </div>
    </div>
  )
}
