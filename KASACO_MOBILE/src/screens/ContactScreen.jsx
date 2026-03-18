import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default function ContactScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.message) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsLoading(true);
    
    // Simuler l'envoi du message
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Message envoyé',
        'Nous vous répondrons dans les plus brefs délais.',
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({ name: '', email: '', subject: '', message: '' });
              navigation.goBack();
            },
          },
        ]
      );
    }, 1500);
  };

  const handlePhonePress = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmailPress = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWhatsAppPress = (phone) => {
    Linking.openURL(`https://wa.me/${phone}`);
  };

  const handleMapPress = () => {
    Linking.openURL('https://maps.google.com/?q=Bujumbura+Burundi');
  };

  const ContactCard = ({ icon, title, value, onPress, color }) => (
    <TouchableOpacity style={styles.contactCard} onPress={onPress}>
      <View style={[styles.contactIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactValue}>{value}</Text>
      </View>
      <Icon name="chevron-forward-outline" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* En-tête */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contactez-nous</Text>
        </View>

        {/* Informations de contact */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Nos coordonnées</Text>
          
          <ContactCard
            icon="call-outline"
            title="Téléphone"
            value="+257 69 080 278"
            onPress={() => handlePhonePress('+25769080278')}
            color="#ef4444"
          />
          
          <ContactCard
            icon="mail-outline"
            title="Email"
            value="karinzi.bi.sab@gmail.com"
            onPress={() => handleEmailPress('karinzi.bi.sab@gmail.com')}
            color="#3b82f6"
          />
          
          <ContactCard
            icon="logo-whatsapp"
            title="WhatsApp"
            value="+257 69 080 278"
            onPress={() => handleWhatsAppPress('25769080278')}
            color="#25D366"
          />
          
          <ContactCard
            icon="location-outline"
            title="Adresse"
            value="Bujumbura - Burundi"
            onPress={handleMapPress}
            color="#8b5cf6"
          />
        </View>

        {/* Formulaire de contact */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Envoyez-nous un message</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom complet *</Text>
            <View style={styles.inputContainer}>
              <Icon name="person-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Votre nom"
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email *</Text>
            <View style={styles.inputContainer}>
              <Icon name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="votre@email.com"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Sujet</Text>
            <View style={styles.inputContainer}>
              <Icon name="document-text-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Sujet de votre message"
                value={formData.subject}
                onChangeText={(text) => handleChange('subject', text)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Message *</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Icon name="chatbubble-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Votre message..."
                value={formData.message}
                onChangeText={(text) => handleChange('message', text)}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.submitButtonText}>Envoi en cours...</Text>
              </View>
            ) : (
              <>
                <Icon name="send-outline" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Envoyer le message</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Horaires */}
        <View style={styles.hoursSection}>
          <Text style={styles.sectionTitle}>Horaires d'ouverture</Text>
          <View style={styles.hoursCard}>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Lundi - Vendredi</Text>
              <Text style={styles.hoursTime}>8h00 - 18h00</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Samedi</Text>
              <Text style={styles.hoursTime}>9h00 - 14h00</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Dimanche</Text>
              <Text style={styles.hoursTime}>Fermé</Text>
            </View>
          </View>
        </View>

        {/* Réseaux sociaux */}
        <View style={styles.socialSection}>
          <Text style={styles.sectionTitle}>Suivez-nous</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#1877f2' }]}
              onPress={() => Linking.openURL('https://facebook.com/kasaco')}
            >
              <Icon name="logo-facebook" size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#1da1f2' }]}
              onPress={() => Linking.openURL('https://twitter.com/kasaco')}
            >
              <Icon name="logo-twitter" size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#e4405f' }]}
              onPress={() => Linking.openURL('https://instagram.com/kasaco')}
            >
              <Icon name="logo-instagram" size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#25D366' }]}
              onPress={() => Linking.openURL('https://wa.me/25769080278')}
            >
              <Icon name="logo-whatsapp" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ef4444',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoSection: {
    padding: 20,
  },
  formSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  hoursSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  socialSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 16,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hoursCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  hoursDay: {
    fontSize: 16,
    color: '#666',
  },
  hoursTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});