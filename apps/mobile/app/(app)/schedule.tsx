import { View, Text } from 'react-native'
import SportSwitcher from '@/components/SportSwitcher'

// TODO: list matches by date with court + time; completed matches show set scores (use getMatches).
export default function Schedule() {
  return (
    <View style={{ flex: 1, paddingTop: 50 }}>
      <SportSwitcher />
      <Text style={{ padding: 16, color: '#666' }}>Schedule and results by date and court.</Text>
    </View>
  )
}
