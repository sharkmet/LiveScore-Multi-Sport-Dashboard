export default function ConnectionStatus({ status = 'mock' }) {
  const configs = {
    mock: { dot: 'bg-amber-500', text: 'Mock data', ring: 'ring-amber-900/50' },
    connected: { dot: 'bg-live animate-pulse', text: 'Live', ring: 'ring-live/20' },
    connecting: { dot: 'bg-yellow-500 animate-pulse', text: 'Connecting', ring: 'ring-yellow-900/50' },
    reconnecting: { dot: 'bg-yellow-500 animate-pulse', text: 'Reconnecting', ring: 'ring-yellow-900/50' },
    disconnected: { dot: 'bg-red-500', text: 'Offline', ring: 'ring-red-900/50' },
  }

  const config = configs[status] ?? configs.mock

  return (
    <div className={`flex items-center gap-1.5 rounded-full border border-edge-subtle bg-pitch-800 px-2.5 py-1 text-[11px] text-slate-400 ring-1 ${config.ring}`}>
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${config.dot}`} />
      {config.text}
    </div>
  )
}
