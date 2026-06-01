import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function MisPaseosScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Mis Paseos</Text>
        <Text style={styles.sub}>Próximamente...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title:     { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  sub:       { fontSize: 14, color: '#999', marginTop: 8 },
});
