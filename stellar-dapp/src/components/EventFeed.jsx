import React from 'react'
import { Activity, Trash2, ExternalLink } from 'lucide-react'
import { formatTime, openInExplorer, shortenAddress } from '../utils/stellar'

const EVENT_CONFIG = {
  success: {
    dot: 'bg-cosmos-green',
    glow: '0 0 8px #00ff88',
    text: 'text-cosmos-green',
    label: 'SUCCESS',
  },
  error: {
    dot: 'bg-cosmos-red',
    glow: '0 0 8px #ff4466',
    text: 'text-cosmos-red',
    label: 'ERROR',
  },
  warn: {
    dot: 'bg-cosmos-gold',
    glow: '0 0 8px #ffd700',
    text: 'text-cosmos-gold',
    label: 'WARN',
  },
  info: {
    dot: 'bg-stellar-400',
    glow: '0 0 8px #38bdf8',
    text: 'text-stellar-400',
    label: 'INFO',
  },
}

export default function EventFeed({ events, clearEvents }) {
  return (
    <div className="stellar-card p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Activity size={18} className="text-cosmos-accent" />
            <span
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cosmos-green"
              style={{ boxShadow: '0 0 6px #00ff88' }}
            />
          </div>
          <h2 className="font-display font-bold text-white text-sm">Live Events</h2>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-cosmos-border text-gray-400 text-xs font-mono">
            {events.length}
          </span>
        </div>
        <button
          onClick={clearEvents}
          className="p-1.5 text-gray-500 hover:text-cosmos-red transition-colors rounded"
          title="Clear events"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Scrollable event list */}
      <div className="flex-1 overflow-y-auto space-y-0 min-h-0">
        {events.length === 0 ? (
          <div className="text-center text-gray-600 text-sm py-8">
            No events yet
          </div>
        ) : (
          events.map(event => <EventRow key={event.id} event={event} />)
        )}
      </div>
    </div>
  )
}

function EventRow({ event }) {
  const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.info

  return (
    <div className="event-row">
      {/* Status dot */}
      <div className="mt-1 shrink-0">
        <span
          className={`w-2 h-2 rounded-full block ${config.dot}`}
          style={{ boxShadow: config.glow }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-gray-300 leading-snug break-words">{event.message}</p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className={`text-xs font-mono font-semibold ${config.text}`}>
            {config.label}
          </span>
          <span className="text-xs font-mono text-gray-600">
            {formatTime(event.timestamp)}
          </span>
          {event.hash && (
            <button
              onClick={() => openInExplorer(event.hash)}
              className="flex items-center gap-1 text-xs text-cosmos-accent hover:underline"
            >
              {event.hash.slice(0, 8)}...
              <ExternalLink size={10} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
