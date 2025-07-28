// Example usage của Avatar component

import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import Avatar from './Avatar';

const AvatarExamples: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sizes</Text>
        <View style={styles.row}>
          <Avatar name="John Doe" size="small" />
          <Avatar name="Jane Smith" size="medium" />
          <Avatar name="Bob Wilson" size="large" />
          <Avatar name="Alice Johnson" size="xlarge" />
          <Avatar name="Custom Size" size={100} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>With Images</Text>
        <View style={styles.row}>
          <Avatar 
            uri="https://ui-avatars.com/api/?name=John-Doe&background=random" 
            name="John Doe" 
            size="medium" 
          />
          <Avatar 
            uri="https://ui-avatars.com/api/?name=Jane-Smith&background=random" 
            name="Jane Smith" 
            size="medium" 
          />
          <Avatar 
            uri="invalid-url" 
            name="Fallback Test" 
            size="medium" 
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Indicators</Text>
        <View style={styles.row}>
          <Avatar 
            name="Online User" 
            size="large" 
            showStatus 
            status="online" 
          />
          <Avatar 
            name="Away User" 
            size="large" 
            showStatus 
            status="away" 
          />
          <Avatar 
            name="Busy User" 
            size="large" 
            showStatus 
            status="busy" 
          />
          <Avatar 
            name="Offline User" 
            size="large" 
            showStatus 
            status="offline" 
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Colors</Text>
        <View style={styles.row}>
          <Avatar 
            name="Custom BG" 
            size="medium" 
            backgroundColor="#FF6B6B" 
            textColor="#FFFFFF" 
          />
          <Avatar 
            name="Custom BG" 
            size="medium" 
            backgroundColor="#4ECDC4" 
            textColor="#2C3E50" 
          />
          <Avatar 
            name="Custom BG" 
            size="medium" 
            backgroundColor="#F39C12" 
            textColor="#FFFFFF" 
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Border Radius</Text>
        <View style={styles.row}>
          <Avatar 
            name="Square" 
            size="medium" 
            borderRadius={8} 
          />
          <Avatar 
            name="Rounded" 
            size="medium" 
            borderRadius={16} 
          />
          <Avatar 
            name="Circle" 
            size="medium" 
            borderRadius={24} 
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
  },
});

export default AvatarExamples;
