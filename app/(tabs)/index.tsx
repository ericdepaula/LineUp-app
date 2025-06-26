import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Contacts from 'expo-contacts';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Search, Users, Download, CheckCircle2, Circle } from 'lucide-react-native';
import { ContactExporter } from '@/components/ContactExporter';

interface Contact {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumbers?: Array<{ number: string; label?: string }>;
  emails?: Array<{ email: string; label?: string }>;
  addresses?: Array<{ street?: string; city?: string; region?: string; postalCode?: string; country?: string; label?: string }>;
  company?: string;
  jobTitle?: string;
  birthday?: Date;
  note?: string;
}

export default function ExportTab() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.firstName && contact.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.lastName && contact.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.company && contact.company.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);

  const requestPermissions = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status === 'granted') {
        loadContacts();
      }
    } catch (error) {
      console.error('Permission error:', error);
      setHasPermission(false);
    }
  };

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.FirstName,
          Contacts.Fields.LastName,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
          Contacts.Fields.Addresses,
          Contacts.Fields.Company,
          Contacts.Fields.JobTitle,
          Contacts.Fields.Birthday,
          Contacts.Fields.Note,
        ],
      });

      const processedContacts: Contact[] = data.map(contact => ({
        id: contact.id,
        name: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unnamed Contact',
        firstName: contact.firstName,
        lastName: contact.lastName,
        phoneNumbers: contact.phoneNumbers,
        emails: contact.emails,
        addresses: contact.addresses,
        company: contact.company,
        jobTitle: contact.jobTitle,
        birthday: contact.birthday,
        note: contact.note,
      }));

      setContacts(processedContacts);
      setFilteredContacts(processedContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleContactSelection = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const selectAllContacts = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(contact => contact.id)));
    }
  };

  const exportToExcel = async () => {
    if (selectedContacts.size === 0) {
      Alert.alert('No Selection', 'Please select at least one contact to export.');
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress(0);

      const selectedContactsData = contacts.filter(contact => 
        selectedContacts.has(contact.id)
      );

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const exporter = new ContactExporter();
      const filePath = await exporter.exportToExcel(selectedContactsData);

      clearInterval(progressInterval);
      setExportProgress(100);

      // Small delay to show 100% completion
      setTimeout(async () => {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filePath, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Export Contacts',
          });
        } else {
          Alert.alert(
            'Export Complete',
            `Your contacts have been exported successfully!\n\nFile saved to: ${filePath}`,
            [{ text: 'OK' }]
          );
        }
        setIsExporting(false);
        setExportProgress(0);
      }, 500);

    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'There was an error exporting your contacts. Please try again.');
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Checking permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Users size={64} color="#8E8E93" />
          <Text style={styles.permissionTitle}>Contacts Access Required</Text>
          <Text style={styles.permissionText}>
            To export your contacts to Excel, we need access to your contacts. This data is processed locally on your device and never sent to external servers.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermissions}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Export Contacts</Text>
        <Text style={styles.subtitle}>
          Select contacts to export to Excel spreadsheet
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#8E8E93"
        />
      </View>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.selectAllButton}
          onPress={selectAllContacts}
        >
          <Text style={styles.selectAllText}>
            {selectedContacts.size === filteredContacts.length ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.selectedCount}>
          {selectedContacts.size} of {filteredContacts.length} selected
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading contacts...</Text>
        </View>
      ) : (
        <ScrollView style={styles.contactsList} showsVerticalScrollIndicator={false}>
          {filteredContacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={[
                styles.contactItem,
                selectedContacts.has(contact.id) && styles.contactItemSelected
              ]}
              onPress={() => toggleContactSelection(contact.id)}
            >
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                {contact.phoneNumbers && contact.phoneNumbers.length > 0 && (
                  <Text style={styles.contactDetail}>
                    📞 {contact.phoneNumbers[0].number}
                  </Text>
                )}
                {contact.emails && contact.emails.length > 0 && (
                  <Text style={styles.contactDetail}>
                    ✉️ {contact.emails[0].email}
                  </Text>
                )}
                {contact.company && (
                  <Text style={styles.contactDetail}>
                    🏢 {contact.company}
                  </Text>
                )}
              </View>
              <View style={styles.checkboxContainer}>
                {selectedContacts.has(contact.id) ? (
                  <CheckCircle2 size={24} color="#007AFF" />
                ) : (
                  <Circle size={24} color="#C7C7CC" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.exportContainer}>
        {isExporting && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Exporting contacts... {exportProgress}%
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${exportProgress}%` }
                ]}
              />
            </View>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.exportButton,
            (selectedContacts.size === 0 || isExporting) && styles.exportButtonDisabled
          ]}
          onPress={exportToExcel}
          disabled={selectedContacts.size === 0 || isExporting}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Download size={20} color="#FFFFFF" />
          )}
          <Text style={styles.exportButtonText}>
            {isExporting ? 'Exporting...' : `Export ${selectedContacts.size} Contacts`}
          </Text>
        </TouchableOpacity>
      </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1C1C1E',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  selectAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  selectAllText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedCount: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  contactsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  contactItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  contactDetail: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  checkboxContainer: {
    marginLeft: 12,
  },
  exportContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exportButtonDisabled: {
    backgroundColor: '#C7C7CC',
    shadowOpacity: 0,
    elevation: 0,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});