import { useEffect, useState } from 'react'
import { View, Text, FlatList } from 'react-native'
import { getTeams } from '@sportapp/supabase'
import { supabase } from '@/lib/supabase'
import { useSportStore } from '@/stores/sport'
import SportSwitcher from '@/components/SportSwitcher'

export default function Teams() {
  const sportId = useSportStore(s => s.activeSportId)
  const [teams, setTeams] = useState<any[]>([])
  useEffect(() => { if (sportId) getTeams(supabase, sportId).then(setTeams).catch(() => {}) }, [sportId])
  return (
    <View style={{ flex: 1, paddingTop: 50 }}>
      <SportSwitcher />
      <FlatList data={teams} keyExtractor={t => t.id} contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => <View style={{ padding: 14, borderWidth: 1, borderColor: '#eee', borderRadius: 12 }}><Text style={{ fontWeight: '600' }}>{item.name}</Text></View>}
        ListEmptyComponent={<Text style={{ padding: 16, color: '#666' }}>No teams yet.</Text>} />
    </View>
  )
}
