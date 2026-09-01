import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';

export default function VendorHeader() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.logo}>Momo House</Text>
        <Text style={styles.subtitle}>Vendor Dashboard</Text>
      </View>
      
      <View style={styles.switchContainer}>
        <Text style={[styles.statusText, isOpen ? styles.statusOpen : styles.statusClosed]}>
          {isOpen ? 'OPEN' : 'CLOSED'}
        </Text>
        <Switch
          trackColor={{ false: '#eadfd2', true: '#4c8755' }}
          thumbColor={isOpen ? '#fff' : '#fff'}
          onValueChange={() => setIsOpen(!isOpen)}
          value={isOpen}
          style={styles.switch}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    paddingTop: 60, // safe area spacing
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fffbf2', // cream
    borderBottomWidth: 1,
    borderBottomColor: '#eadfd2',
    zIndex: 30,
  },
  logo: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1,
    color: '#E13328', // red
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#806c61', // muted
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffdf8',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eadfd2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '900',
    marginRight: 8,
    marginLeft: 4,
  },
  statusOpen: {
    color: '#4c8755', // green
  },
  statusClosed: {
    color: '#806c61',
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  }
});
