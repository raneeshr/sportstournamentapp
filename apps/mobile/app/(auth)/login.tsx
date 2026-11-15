import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { supabase } from '@/lib/supabase'
import { colors } from '@sportapp/ui'

export default function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const signIn = async () => { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) Alert.alert(error.message) }
  const signUp = async () => { const { error } = await supabase.auth.signUp({ email, password }); Alert.alert(error ? error.message : 'Check your email to confirm your account') }
  const input = { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 10 } as const
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 16 }}>Sign in</Text>
      <TextInput style={input} placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity onPress={signIn} style={{ backgroundColor: colors.primary, padding: 14, borderRadius: 12, marginBottom: 8 }}><Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Sign in</Text></TouchableOpacity>
      <TouchableOpacity onPress={signUp} style={{ padding: 14 }}><Text style={{ textAlign: 'center', color: colors.primary }}>Create account</Text></TouchableOpacity>
    </View>
  )
}
