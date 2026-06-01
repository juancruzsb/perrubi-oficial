// Este archivo va en app/_layout.tsx (el ROOT, no el de tabs)
import { Stack } from 'expo-router';
import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
 
function PhoneFrame({ children }: { children: React.ReactNode }) {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webBg}>
        <View style={styles.phone}>
          <View style={styles.notch} />
          <View style={styles.screen}>{children}</View>
          <View style={styles.homeBar}>
            <View style={styles.homeBarPill} />
          </View>
        </View>
      </View>
    );
  }
  return <>{children}</>;
}
 
export default function RootLayout() {
  return (
    <PhoneFrame>
      <Stack screenOptions={{ headerShown: false }} />
    </PhoneFrame>
  );
}
 
const styles = StyleSheet.create({
  webBg: {
    flex: 1,
    backgroundColor: '#1c1c2e',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh' as any,
  },
  phone: {
    width: 390,
    height: 844,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 10,
    borderColor: '#111',
    // @ts-ignore
    boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px #333',
  },
  notch: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    width: 120,
    height: 30,
    backgroundColor: '#111',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 10,
  },
  screen: {
    flex: 1,
    marginTop: 30,
    overflow: 'hidden',
  },
  homeBar: {
    height: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBarPill: {
    width: 120,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#111',
    opacity: 0.15,
  },
});
