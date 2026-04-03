import { useState, useCallback, useEffect, useRef } from 'react'

let eventIdCounter = 0

export function useEventFeed(wallet) {
  const [events, setEvents] = useState([
    {
      id: 0,
      type: 'info',
      message: 'StellarVault dApp initialized. Connect a wallet to begin.',
      timestamp: new Date().toISOString(),
    }
  ])
  const pollingRef = useRef(null)

  const addEvent = useCallback((event) => {
    const newEvent = {
      id: ++eventIdCounter,
      timestamp: new Date().toISOString(),
      ...event,
    }
    setEvents(prev => [newEvent, ...prev].slice(0, 50))
  }, [])

  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  // Poll Horizon for recent payments when wallet is connected
  useEffect(() => {
    if (!wallet?.publicKey) return

    let active = true

    const pollPayments = async () => {
      try {
        const response = await fetch(
          `https://horizon-testnet.stellar.org/accounts/${wallet.publicKey}/payments?order=desc&limit=1`
        )
        if (!response.ok) return
        const data = await response.json()
        const records = data._embedded?.records || []

        if (records.length > 0 && active) {
          const latest = records[0]
          const isIncoming = latest.to === wallet.publicKey
          const isOutgoing = latest.from === wallet.publicKey

          if (latest.type === 'payment' && latest.asset_type === 'native') {
            const msg = isIncoming
              ? `↓ Incoming: +${parseFloat(latest.amount).toFixed(2)} XLM from ${latest.from?.slice(0, 8)}...`
              : isOutgoing
              ? `↑ Outgoing: -${parseFloat(latest.amount).toFixed(2)} XLM to ${latest.to?.slice(0, 8)}...`
              : null

            if (msg) {
              // Only add if it's a new event (avoid duplicate additions)
              setEvents(prev => {
                const already = prev.some(e => e.txId === latest.id)
                if (already) return prev
                return [{
                  id: ++eventIdCounter,
                  type: isIncoming ? 'success' : 'info',
                  message: msg,
                  hash: latest.transaction_hash,
                  txId: latest.id,
                  timestamp: latest.created_at,
                }, ...prev].slice(0, 50)
              })
            }
          }
        }
      } catch {
        // silently ignore polling errors
      }
    }

    // Initial poll
    pollPayments()
    
    // Poll every 10 seconds
    pollingRef.current = setInterval(pollPayments, 10_000)

    return () => {
      active = false
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [wallet?.publicKey])

  return { events, addEvent, clearEvents }
}
