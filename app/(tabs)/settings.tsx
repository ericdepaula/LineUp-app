import React, { useCallback } from 'react';
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
  const openURL = useCallback(async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o link');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o link');
    }
  }, []);

  const showAbout = useCallback(() => {
    Alert.alert(
      'Sobre o Exportador de Contatos',
      'Uma forma simples e segura de exportar seus contatos para o formato Excel. Todo o processamento é feito localmente no seu dispositivo para garantir sua privacidade.\n\nVersão 2.0.1',
      [{ text: 'OK' }]
    );
  }, []);

  const showPrivacyInfo = useCallback(() => {
    Alert.alert(
      'Privacidade e Segurança',
      'Seus dados de contato são processados inteiramente no seu dispositivo. Nenhuma informação é enviada para servidores externos. O app só acessa os contatos quando você concede permissão explicitamente.',
      [{ text: 'OK' }]
    );
  }, []);

  const showHelp = useCallback(() => {
    Alert.alert(
      'Como usar',
      '1. Conceda permissão de contatos quando solicitado\n2. Selecione os contatos que deseja exportar\n3. Toque em "Exportar" para gerar um arquivo Excel\n4. Compartilhe ou salve o arquivo usando as opções do seu dispositivo\n\nO arquivo Excel conterá todas as informações disponíveis dos contatos, incluindo nomes e telefones.',
      [{ text: 'OK' }]
    );
  }, []);

  const handleRateApp = useCallback(() => {
    Alert.alert(
      'Avaliar App',
      'Obrigado pelo seu interesse em ontribuir com nosso app! Toda opinião é bem vinda!\nSe quiser me ajudar com qualquer valor para o meu café ☕, ficarei muito grato. \n\nEmail:ericdepaula.dev@gmail.com',
      [
        {
          text: 'Copiar Email',
          onPress: () => {
            try {
              // Clipboard API is available in react-native
              // If using Expo: import * as Clipboard from 'expo-clipboard'
              // Otherwise: import { Clipboard } from 'react-native'
              // Here, let's use Expo Clipboard for compatibility
              import('expo-clipboard').then(Clipboard => {
                Clipboard.setStringAsync('ericdepaula.dev@gmail.com');
                Alert.alert('Copiado!', 'Email copiado para a área de transferência.');
              });
            } catch {
              Alert.alert('Erro', 'Não foi possível copiar o email.');
            }
          }
        },
        { text: 'OK' }
      ]
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
        <Text style={styles.subtitle}>
          Informações do app e preferências
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={showAbout}>
            <View style={styles.settingIcon}>
              <Info size={20} color="#007AFF" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Sobre</Text>
              <Text style={styles.settingDescription}>
                Versão do app e informações
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={showPrivacyInfo}>
            <View style={styles.settingIcon}>
              <Shield size={20} color="#34C759" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Privacidade e Segurança</Text>
              <Text style={styles.settingDescription}>
                Como protegemos seus dados
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={showHelp}>
            <View style={styles.settingIcon}>
              <HelpCircle size={20} color="#FF9500" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Ajuda e Suporte</Text>
              <Text style={styles.settingDescription}>
                Como usar o aplicativo
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Funcionalidades</Text>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>📱 Acesso Nativo aos Contatos</Text>
            <Text style={styles.featureDescription}>
              Acesso direto aos contatos do seu dispositivo sem necessidade de exportação para a nuvem
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>📊 Exportação para Excel</Text>
            <Text style={styles.featureDescription}>
              Formato profissional .xlsx com colunas organizadas e formatação adequada
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>🔒 Privacidade em Primeiro Lugar</Text>
            <Text style={styles.featureDescription}>
              Todo o processamento acontece localmente no seu dispositivo - nenhum dado sai do seu celular
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>📤 Compartilhamento Fácil</Text>
            <Text style={styles.featureDescription}>
              Compartilhe por e-mail, armazenamento em nuvem ou salve no seu dispositivo
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suporte</Text>
          <Text style={styles.supportText}>
            Se você achou este app útil, compartilhe com seus amigos. Sua contribuição nos ajuda a melhorar o app e alcançar mais pessoas que precisam desta funcionalidade.
          </Text>
          
          <TouchableOpacity 
            style={styles.rateButton}
            onPress={handleRateApp}
          >
            <Star size={20} color="#FFD700" />
            <Text style={styles.rateButtonText}>Avaliar este App</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Exportador de Contatos v2.0.1
          </Text>
          <Text style={styles.footerSubtext}>
            Desenvolvido por Eric de Paula
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