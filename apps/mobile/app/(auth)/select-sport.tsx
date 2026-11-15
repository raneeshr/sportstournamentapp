import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { getSports, createSport, followSport, setDefaultSport } from '@sportapp/supabase'
import { colors } from '@sportapp/ui'
import { supabase } from '@/lib/supabase'
import { useSportStore, type Sport } from '@/stores/sport'

export default function SelectSport() {
  const router = useRouter()
  const setFollowed = useSportStore(s => s.setFollowed)
  const [sports, setSports] = useState<Sport[]>([])
  const [picked, setPicked] = useState<string[]>([])
  const [custom, setCustom] = useState('')

  useEffect(() => { getSports(supabase).then(setSports as any).catch(e => Alert.alert(e.message)) }, [])
  const toggle = (id: string) => setPicked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  async function addCustom() {
    if (!custom.trim()) return
    try { const s = await createSport(supabase, custom.trim()); setSports(x => [...x, s as Sport]); setPicked(p => [...p, s.id]); setCustom('') }
    catch (e: any) { Alert.alert(e.message) }
  }
  async function next() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !picked.length) return
    await Promise.all(picked.map(id => followSport(supabase, user.id, id)))
    await setDefaultSport(supabase, user.id, picked[0])
    setFollowed(sports.filter(s => picked.includes(s.id)))
    router.replace('/(app)/dashboard')
  }

  return (
    <View style={{ flex: 1, padding: 20, paddingTop: 60 }}>
      <Text style={{ fontSize: 22, fontWeight: '600' }}>What sport are you playing?</Text>
      <Text style={{ color: '#666', marginVertical: 8 }}>Pick one or more. You can add more later.</Text>
      <FlatList data={sports} numColumns={2} keyExtractor={s => s.id} columnWrapperStyle={{ gap: 10 }} contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => {
          const on = picked.includes(item.id)
          return (
            <TouchableOpacity onPress={() => toggle(item.id)} style={{ flex: 1, alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: on ? colors.primary : '#ddd', backgroundColor: on ? colors.primaryLight : '#fff' }}>
              <Text style={{ fontSize: 26 }}>{item.icon ?? '🏅'}</Text><Text style={{ fontWeight: '500' }}>{item.name}</Text>
            </TouchableOpacity>
          )
        }} />
      <View style={{ flexDirection: 'row', gap: 8, marginVertical: 12 }}>
        <TextInput style={{ flex: 1, borderWidth: 1, borderStyle: 'dashed', borderColor: '#bbb', borderRadius: 10, padding: 10 }} placeholder="Add your own sport…" value={custom} onChangeText={setCustom} />
        <TouchableOpacity onPress={addCustom} style={{ justifyContent: 'center', paddingHorizontal: 14 }}><Text style={{ color: colors.primary, fontWeight: '600' }}>Add</Text></TouchableOpacity>
      </View>
      <TouchableOpacity disabled={!picked.length} onPress={next} style={{ backgroundColor: picked.length ? colors.primary : '#bbb', padding: 14, borderRadius: 12 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Continue</Text>
      </TouchableOpacity>
    </View>
  )
}
