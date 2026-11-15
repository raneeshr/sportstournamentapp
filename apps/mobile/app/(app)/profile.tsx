import { View, Text, TouchableOpacity } from 'react-native'
import { supabase } from '@/lib/supabase'

export default function Profile() {
  return (
    <View style={{ flex: 1, paddingTop: 60, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Profile</Text>
      <TouchableOpacity onPress={() => supabase.auth.signOut()} style={{ marginTop: 20 }}><Text style={{ color: '#A32D2D', fontWeight: '600' }}>Sign out</Text></TouchableOpacity>
    </View>
  )
}
