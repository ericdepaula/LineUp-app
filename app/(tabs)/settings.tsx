import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Info, Shield, HelpCircle, Star, ExternalLink } from 'lucide-react-native';

export default function SettingsTab() {
  const openURL = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open the link');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open the link');
    }
  };

  const showAbout = () => {
    Alert.alert(
      'About Contact Export',
      'Version 1.0.0\n\nA simple and secure way to export your contacts to Excel format. All processing is done locally on your device to ensure your privacy.',
      [{ text: 'OK' }]
    );
  };

  const showPrivacyInfo = () => {
    Alert.alert(
      'Privacy & Security',
      'Your contact data is processed entirely on your device. No information is sent to external servers. The app only accesses contacts when you explicitly grant permission.',
      [{ text: 'OK' }]
    );
  };

  const showHelp = () => {
    Alert.alert(
      'How to Use',
      '1. Grant contact permissions when prompted\n2. Select the contacts you want to export\n3. Tap "Export" to generate an Excel file\n4. Share or save the file using your device\'s sharing options\n\nThe Excel file will contain all available contact information including names, phone numbers, emails, and addresses.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          App information and preferences
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={showAbout}>
            <View style={styles.settingIcon}>
              <Info size={20} color="#007AFF" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>About</Text>
              <Text style={styles.settingDescription}>
                App version and information
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={showPrivacyInfo}>
            <View style={styles.settingIcon}>
              <Shield size={20} color="#34C759" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Privacy & Security</Text>
              <Text style={styles.settingDescription}>
                How we protect your data
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={showHelp}>
            <View style={styles.settingIcon}>
              <HelpCircle size={20} color="#FF9500" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Help & Support</Text>
              <Text style={styles.settingDescription}>
                How to use the app
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>📱 Native Contact Access</Text>
            <Text style={styles.featureDescription}>
              Direct access to your device contacts without requiring cloud exports
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>📊 Excel Export</Text>
            <Text style={styles.featureDescription}>
              Professional .xlsx format with organized columns and proper formatting
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>🔒 Privacy First</Text>
            <Text style={styles.featureDescription}>
              All processing happens locally on your device - no data leaves your phone
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>📤 Easy Sharing</Text>
            <Text style={styles.featureDescription}>
              Share via email, cloud storage, or save to your device
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Text style={styles.supportText}>
            If you find this app helpful, please consider rating it in the App Store. Your feedback helps us improve the app and reach more users who need this functionality.
          </Text>
          
          <TouchableOpacity 
            style={styles.rateButton}
            onPress={() => {
              Alert.alert(
                'Rate App',
                'Thank you for your interest in rating our app! Please visit your device\'s app store to leave a review.',
                [{ text: 'OK' }]
              );
            }}
          >
            <Star size={20} color="#FFD700" />
            <Text style={styles.rateButtonText}>Rate This App</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Contact Export App v1.0.0
          </Text>
          <Text style={styles.footerSubtext}>
            Built with React Native & Expo
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  featureItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  supportText: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  rateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#C7C7CC',
    marginTop: 4,
  },
});