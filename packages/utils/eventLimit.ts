/** Client-side mirror of the DB trigger so the UI can block before hitting the server. */
export function canJoinEvent(currentEventCount: number, maxEventsPerPlayer: number, adminOverride = false) {
  return adminOverride || currentEventCount < maxEventsPerPlayer
}
