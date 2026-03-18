import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function VoitureDetailScreen({ route }) {
  const { id } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Icon name="car-outline" size={80} color="#ccc" />
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Détails de la voiture</Text>
        <Text style={styles.id}>ID: {id}</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Informations générales</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Marque:</Text>
            <Text style={styles.infoValue}>-</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Modèle:</Text>
            <Text style={styles.infoValue}>-</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Année:</Text>
            <Text style={styles.infoValue}>-</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Prix:</Text>
            <Text style={styles.infoValue}>-</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    height: 250,
    backgroundColor: '#fff',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  id: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#ef4444',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});