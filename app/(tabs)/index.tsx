import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Contacts from 'expo-contacts';
import * as Sharing from 'expo-sharing';
import {
  Search,
  Users,
  Download,
  CheckCircle2,
  Circle,
} from 'lucide-react-native';
import { ContactExporter } from '@/components/ContactExporter';
import { enableScreens } from 'react-native-screens';

enableScreens();

interface Contact {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumbers?: Array<{ number: string; label?: string }>;
}

const ExportTab = React.memo(function ExportTab() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  useEffect(() => {
    requestPermissions();
  }, []);

  const filteredContacts = useMemo(() => {
    if (searchQuery.trim() === '') return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(q) ||
        (contact.firstName && contact.firstName.toLowerCase().includes(q)) ||
        (contact.lastName && contact.lastName.toLowerCase().includes(q))
    );
  }, [contacts, searchQuery]);

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
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });

      const processedContacts: Contact[] = data.map((contact) => ({
        id: contact.id || Math.random().toString(36).substring(2, 15),
        name:
          contact.name ||
          `${contact.firstName || ''} ${contact.lastName || ''}`.trim() ||
          'Contato sem nome',
        firstName: contact.firstName, // <-- add this
        lastName: contact.lastName,   // <-- add this
        phoneNumbers: contact.phoneNumbers
          ? contact.phoneNumbers
              .filter((pn) => typeof pn.number === 'string' && pn.number)
              .map((pn) => ({
                number: pn.number as string,
                label: pn.label,
              }))
          : undefined,
      }));
      setContacts(processedContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Erro', 'Falha ao carregar contatos. Tente novamente.');
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
      setSelectedContacts(
        new Set(filteredContacts.map((contact) => contact.id))
      );
    }
  };

  const exportToExcel = async () => {
    if (selectedContacts.size === 0) {
      Alert.alert(
        'Nenhuma seleção',
        'Selecione pelo menos um contato para exportar.'
      );
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress(0);

      const selectedContactsData = contacts.filter((contact) =>
        selectedContacts.has(contact.id)
      );

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const exporter = new ContactExporter();
      const filePath = await exporter.exportToExcel(selectedContactsData);

      clearInterval(progressInterval);
      setExportProgress(100);

      // Small delay to show 100% completion
      setTimeout(async () => {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filePath, {
            mimeType:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Exportar Contatos',
          });
        } else {
          Alert.alert(
            'Exportação Concluída',
            `Seus contatos foram exportados com sucesso!\n\nArquivo salvo em: ${filePath}`,
            [{ text: 'OK' }]
          );
        }
        setIsExporting(false);
        setExportProgress(0);
      }, 500);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Falha na exportação',
        'Ocorreu um erro ao exportar seus contatos. Tente novamente.'
      );
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Verificando permissões...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Users size={64} color="#8E8E93" />
          <Text style={styles.permissionTitle}>Acesso aos Contatos Necessário</Text>
          <Text style={styles.permissionText}>
            Para exportar seus contatos para Excel, precisamos de acesso aos seus contatos.
            Esses dados são processados localmente no seu dispositivo e nunca enviados para servidores externos.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermissions}
          >
            <Text style={styles.permissionButtonText}>Conceder Permissão</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Exportar Contatos</Text>
        <Text style={styles.subtitle}>
          Selecione os contatos que deseja exportar
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar contatos..."
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
            {selectedContacts.size === filteredContacts.length
              ? 'Desmarcar Todos'
              : 'Selecionar Todos'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.selectedCount}>
          {selectedContacts.size} de {filteredContacts.length} selecionados
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando contatos...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(contact) => contact.id}
          renderItem={({ item: contact }) => (
            <TouchableOpacity
              key={contact.id}
              style={[
                styles.contactItem,
                selectedContacts.has(contact.id) && styles.contactItemSelected,
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
              </View>
              <View style={styles.checkboxContainer}>
                {selectedContacts.has(contact.id) ? (
                  <CheckCircle2 size={24} color="#007AFF" />
                ) : (
                  <Circle size={24} color="#C7C7CC" />
                )}
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }} // Add padding for the button
        />
      )}

      {/* Export button fixed at the bottom */}
      <View style={styles.exportButtonWrapper}>
        {isExporting && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Exportando contatos... {exportProgress}%
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${exportProgress}%` }]}
              />
            </View>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.exportButton,
            (selectedContacts.size === 0 || isExporting) &&
              styles.exportButtonDisabled,
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
            {isExporting
              ? 'Exportando...'
              : `Exportar ${selectedContacts.size} Contatos`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});

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
  exportButtonWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    // Add shadow for iOS and elevation for Android if desired
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
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

export default ExportTab;

