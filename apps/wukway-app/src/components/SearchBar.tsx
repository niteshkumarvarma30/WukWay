import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

export default function SearchBar() {
  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Text style={styles.icon}>⌕</Text>
        <TextInput 
          style={styles.input}
          placeholder="Search food, craving or stall…"
          placeholderTextColor="#806c61"
        />
      </View>
      <Text style={styles.suggest}>100 people nearby looking for something spicy?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
  },
  searchBox: {
    marginHorizontal: 22,
    height: 55,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#eadfd2',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },
  icon: {
    fontSize: 21,
    color: '#806c61',
    marginRight: 9,
  },
  input: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#2B1710',
  },
  suggest: {
    fontSize: 10,
    fontWeight: '800',
    color: '#806c61',
    paddingHorizontal: 25,
    marginTop: 6,
    minHeight: 22,
  }
});
