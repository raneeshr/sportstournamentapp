import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, Share } from 'react-native'
import { getTournaments } from '@sportapp/supabase'
import { tournamentUrl, defaultShareMessage } from '@sportapp/utils'
import { supabase } from '@/lib/supabase'
import { useSportStore } from '@/stores/sport'
import SportSwitcher from '@/components/SportSwitcher'

const SITE = process.env.EXPO_PUBLIC_SITE_URL ?? 'https://example.com'

export default function Tournaments() {
  const sportId = useSportStore(s => s.activeSportId)
  const [list, setList] = useState<any[]>([])
  useEffect(() => { if (sportId) getTournaments(supabase, sportId).then(setList).catch(() => {}) }, [sportId])
  const share = (t: any) => { const url = tournamentUrl(SITE, t.slug); Share.share({ message: defaultShareMessage(t.name, url), url }) }
  return (
    <View style={{ flex: 1, paddingTop: 50 }}>
      <SportSwitcher />
      <FlatList data={list} keyExtractor={t => t.id} contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => (
          <View style={{ padding: 14, borderWidth: 1, borderColor: '#eee', borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View><Text style={{ fontWeight: '600' }}>{item.name}</Text><Text style={{ color: '#666' }}>{item.status}</Text></View>
            <TouchableOpacity onPress={() => share(item)}><Text style={{ color: '#534AB7', fontWeight: '600' }}>Share</Text></TouchableOpacity>
          </View>)}
        ListEmptyComponent={<Text style={{ padding: 16, color: '#666' }}>No tournaments yet.</Text>} />
    </View>
  )
}
