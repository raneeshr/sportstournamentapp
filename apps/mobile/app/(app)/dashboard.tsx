import { View, Text } from 'react-native'
import SportSwitcher from '@/components/SportSwitcher'

export default function Dashboard() {
  return (
    <View style={{ flex: 1, paddingTop: 50 }}>
      <SportSwitcher />
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '600' }}>Dashboard</Text>
        <Text style={{ color: '#666', marginTop: 6 }}>My teams, active tournaments and standings for the selected sport.</Text>
      </View>
    </View>
  )
}
