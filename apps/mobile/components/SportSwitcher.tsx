import { ScrollView, Text, TouchableOpacity } from 'react-native'
import { colors } from '@sportapp/ui'
import { useSportStore } from '@/stores/sport'

export default function SportSwitcher() {
  const { followed, activeSportId, setActive } = useSportStore()
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, paddingHorizontal: 12, paddingVertical: 8 }}>
      {followed.map(s => {
        const on = s.id === activeSportId
        return (
          <TouchableOpacity key={s.id} onPress={() => setActive(s.id)} style={{ marginRight: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1.5, borderColor: on ? colors.primary : '#ddd', backgroundColor: on ? colors.primaryLight : '#fff' }}>
            <Text style={{ color: on ? colors.primaryDark : '#555', fontWeight: '500' }}>{s.icon} {s.name}</Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}
