import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>WukWay</Text>
      <View style={styles.status}>
        <View style={styles.dot} />
        <Text style={styles.statusText}>12 stalls open</Text>
        <TouchableOpacity onPress={logout} style={{ marginLeft: 10 }}>
          <Text style={{ fontSize: 10, color: '#E13328', fontWeight: 'bold' }}>LOGOUT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    paddingHorizontal: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fffbf2f2', // cream with opacity for blur effect
    borderBottomWidth: 1,
    borderBottomColor: '#eadfd2',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1.8,
    color: '#E13328', // red
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    backgroundColor: '#4c8755', // green
    borderRadius: 3.5,
    marginRight: 5,
  },
  statusText: {
    fontSize: 11,
    color: '#806c61', // muted
    fontWeight: '900',
  }
});
