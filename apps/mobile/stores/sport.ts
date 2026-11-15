import { create } from 'zustand'

export type Sport = { id: string; name: string; icon: string | null; score_type: string }

/** Active sport context: dashboard, teams and tournaments all filter by activeSportId. */
interface SportState {
  followed: Sport[]
  activeSportId: string | null
  setFollowed: (s: Sport[]) => void
  setActive: (id: string) => void
}
export const useSportStore = create<SportState>((set, get) => ({
  followed: [], activeSportId: null,
  setFollowed: (followed) => set({ followed, activeSportId: get().activeSportId ?? followed[0]?.id ?? null }),
  setActive: (activeSportId) => set({ activeSportId }),
}))
