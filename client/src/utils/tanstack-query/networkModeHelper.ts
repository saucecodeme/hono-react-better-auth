type Status = 'pending' | 'error' | 'success'
type FetchStatus = 'idle' | 'fetching' | 'paused'
type NewStatus = Status | 'offline'

// return a new understandable status
export function networkModeHelper({
  status,
  fetchStatus,
}: {
  status: Status
  fetchStatus: FetchStatus
}): NewStatus {
  if (status === 'pending' && fetchStatus === 'paused') {
    return 'offline'
  }
  return status
}
