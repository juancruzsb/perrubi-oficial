import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

// Pantalla mínima sin diseño: solo para elegir con qué modo entrar
// mientras no hay un flujo real de detección de rol.
export default function ElegirModoScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>¿Cómo querés entrar?</Text>
      <Button title="Soy dueño" onPress={() => router.push('/login')} />
      <Button title="Soy paseador" onPress={() => router.push('/paseador/login-paseador')} />
    </View>
  );
}
