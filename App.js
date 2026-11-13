import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

export default function App() {

  // 1. Verileri JSON dosyası olarak dışa aktar (Mail atma / Cihaza kaydetme)
  const yedegiDisaAktar = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const results = await AsyncStorage.multiGet(keys);
      const dataStore = {};
      results.forEach(([key, value]) => {
        dataStore[key] = value ? JSON.parse(value) : null;
      });

      const jsonString = JSON.stringify(dataStore, null, 2);
      const filePath = FileSystem.documentDirectory + `patron_yedek_${new Date().toISOString().slice(0,10)}.json`;

      await FileSystem.writeAsStringAsync(filePath, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'PATRON Veri Yedeği',
          UTI: 'public.json',
        });
      } else {
        Alert.alert('Başarılı', `Yedek oluşturuldu: ${filePath}`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Yedek alınırken bir sorun oluştu.');
    }
  };

  // 2. Başka telefondan getirilen/mailden alınan JSON dosyasını içeri aktar
  const yedegiIceAktar = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      
      if (res.canceled) return;

      const fileUri = res.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const parsedData = JSON.parse(fileContent);

      // AsyncStorage'a toplu yazma
      const keyValuePairs = Object.entries(parsedData).map(([key, value]) => [key, JSON.stringify(value)]);
      await AsyncStorage.multiSet(keyValuePairs);

      Alert.alert('Başarılı', 'Yedek başarıyla yüklendi! Uygulama verileri güncellendi.');
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Yedek dosyası okunurken veya yüklenirken bir hata oluştu.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Uygulama Başlığı */}
        <View style={styles.headerContainer}>
          <Text style={styles.appTitle}>PATRON</Text>
          <Text style={styles.appSubtitle}>TOCO Ticaret Ofisi - Emlak Takip</Text>
        </View>

        {/* Yerel Yedekleme ve Bilgi Paneli */}
        <View style={styles.card}>
          <Text style={styles.baslik}>Veri Yedekleme ve Taşıma</Text>
          
          {/* Bilgilendirme (Info) Alanı */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>💡 Bu Özellik Nasıl Çalışır?</Text>
            <Text style={styles.infoText}>
              • <Text style={styles.bold}>Yedeği Dışa Aktar:</Text> Tüm verilerinizi telefonunuza küçük bir JSON dosyası olarak indirir. Bu dosyayı kendinize mail atabilir veya güvenli bir yerde saklayabilirsiniz.{'\n\n'}
              • <Text style={styles.bold}>Yedeği Yükle:</Text> Başka bir telefondan veya mailinizden aldığınız yedek dosyasını seçerek verilerinizi anında bu telefona aktarmanızı sağlar.
            </Text>
          </View>

          <TouchableOpacity style={styles.btnExport} onPress={yedegiDisaAktar}>
            <Text style={styles.btnText}>📲 Yedeği Dışa Aktar (Mail At / Kaydet)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnImport} onPress={yedegiIceAktar}>
            <Text style={styles.btnText}>📥 Başka Telefondan Yedeği Yükle</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7fafc' },
  container: { padding: 20 },
  headerContainer: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
  appTitle: { fontSize: 28, fontWeight: 'bold', color: '#1a202c', letterSpacing: 1 },
  appSubtitle: { fontSize: 14, color: '#4a5568', marginTop: 4 },
  card: { padding: 20, backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, marginBottom: 20 },
  baslik: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#2d3748' },
  infoBox: { backgroundColor: '#ebf8ff', borderColor: '#bee3f8', borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 15 },
  infoTitle: { fontSize: 14, fontWeight: 'bold', color: '#2b6cb0', marginBottom: 6 },
  infoText: { fontSize: 13, color: '#4a5568', lineHeight: 19 },
  bold: { fontWeight: '600', color: '#2d3748' },
  btnExport: { backgroundColor: '#2b6cb0', padding: 14, borderRadius: 8, marginBottom: 12, alignItems: 'center' },
  btnImport: { backgroundColor: '#2f855a', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 }
});
