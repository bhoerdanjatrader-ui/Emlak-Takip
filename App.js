import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';

export default function App() {
  const [aktifSekme, setAktifSekme] = useState('portfoy');

  // Portföy
  const [portfoy, setPortfoy] = useState([
    { id: '1', baslik: 'Ören Havuzlu Villa', kategori: 'Villa', islem: 'Satılık', muhit: 'Ören', fiyat: 8500000 },
    { id: '2', baslik: 'Bahçelievler 3+1 Daire', kategori: 'Daire', islem: 'Satılık', muhit: 'Bahçelievler', fiyat: 3200000 },
  ]);

  // Müşteri Talepleri
  const [talepler, setTalepler] = useState([
    { id: 't1', musteri: 'Ahmet Yılmaz', arananKategori: 'Villa', arananMuhit: 'Ören', maxButce: 10000000 },
  ]);

  // İlan Form State'leri
  const [duzenleId, setDuzenleId] = useState(null);
  const [yeniBaslik, setYeniBaslik] = useState('');
  const [yeniKategori, setYeniKategori] = useState('Villa');
  const [yeniMuhit, setYeniMuhit] = useState('');
  const [yeniFiyat, setYeniFiyat] = useState('');

  // Talep Form State'leri
  const [talepDuzenleId, setTalepDuzenleId] = useState(null);
  const [musteriAdi, setMusteriAdi] = useState('');
  const [talepKategori, setTalepKategori] = useState('Villa');
  const [talepMuhit, setTalepMuhit] = useState('');
  const [talepButce, setTalepButce] = useState('');

  // Arama Filtresi
  const [aramaMuhit, setAramaMuhit] = useState('');

  // --- İLAN EKLEME / GÜNCELLEME ---
  const ilanKaydet = () => {
    if (!yeniBaslik || !yeniMuhit || !yeniFiyat) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (duzenleId) {
      setPortfoy(portfoy.map(item => item.id === duzenleId ? {
        ...item,
        baslik: yeniBaslik,
        kategori: yeniKategori,
        muhit: yeniMuhit,
        fiyat: Number(yeniFiyat)
      } : item));
      setDuzenleId(null);
      Alert.alert('Başarılı', 'İlan güncellendi!');
    } else {
      const yeniKayit = {
        id: Date.now().toString(),
        baslik: yeniBaslik,
        kategori: yeniKategori,
        islem: 'Satılık',
        muhit: yeniMuhit,
        fiyat: Number(yeniFiyat),
      };
      setPortfoy([yeniKayit, ...portfoy]);
      Alert.alert('Başarılı', 'Portföye eklendi!');
    }

    setYeniBaslik('');
    setYeniMuhit('');
    setYeniFiyat('');
    setAktifSekme('portfoy');
  };

  const ilanSil = (id) => {
    setPortfoy(portfoy.filter(item => item.id !== id));
  };

  const ilanDuzenleBaslat = (item) => {
    setDuzenleId(item.id);
    setYeniBaslik(item.baslik);
    setYeniKategori(item.kategori);
    setYeniMuhit(item.muhit);
    setYeniFiyat(item.fiyat.toString());
    setAktifSekme('ilanEkle');
  };

  // --- TALEP EKLEME / GÜNCELLEME ---
  const talepKaydet = () => {
    if (!musteriAdi || !talepMuhit || !talepButce) {
      Alert.alert('Hata', 'Lütfen müşteri bilgilerini eksiksiz girin.');
      return;
    }

    if (talepDuzenleId) {
      setTalepler(talepler.map(t => t.id === talepDuzenleId ? {
        ...t,
        musteri: musteriAdi,
        arananKategori: talepKategori,
        arananMuhit: talepMuhit,
        maxButce: Number(talepButce)
      } : t));
      setTalepDuzenleId(null);
      Alert.alert('Başarılı', 'Talep güncellendi!');
    } else {
      const yeniTalep = {
        id: Date.now().toString(),
        musteri: musteriAdi,
        arananKategori: talepKategori,
        arananMuhit: talepMuhit,
        maxButce: Number(talepButce),
      };
      setTalepler([yeniTalep, ...talepler]);
      Alert.alert('Başarılı', 'Talep kaydedildi!');
    }

    setMusteriAdi('');
    setTalepMuhit('');
    setTalepButce('');
  };

  const talepSil = (id) => {
    setTalepler(talepler.filter(t => t.id !== id));
  };

  const talepDuzenleBaslat = (t) => {
    setTalepDuzenleId(t.id);
    setMusteriAdi(t.musteri);
    setTalepKategori(t.arananKategori);
    setTalepMuhit(t.arananMuhit);
    setTalepButce(t.maxButce.toString());
  };

  const filtrelenmisPortfoy = portfoy.filter(item => 
    item.muhit.toLowerCase().includes(aramaMuhit.toLowerCase()) ||
    item.baslik.toLowerCase().includes(aramaMuhit.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>🏠 Emlak Takip & CRM</Text>

      {/* ÜST MENÜ */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, aktifSekme === 'portfoy' && styles.activeTab]} onPress={() => setAktifSekme('portfoy')}>
          <Text style={[styles.tabText, aktifSekme === 'portfoy' && styles.activeTabText]}>Portföy ({portfoy.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, aktifSekme === 'ilanEkle' && styles.activeTab]} onPress={() => { setDuzenleId(null); setYeniBaslik(''); setYeniMuhit(''); setYeniFiyat(''); setAktifSekme('ilanEkle'); }}>
          <Text style={[styles.tabText, aktifSekme === 'ilanEkle' && styles.activeTabText]}>+ İlan Ekle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, aktifSekme === 'talepler' && styles.activeTab]} onPress={() => setAktifSekme('talepler')}>
          <Text style={[styles.tabText, aktifSekme === 'talepler' && styles.activeTabText]}>Talepler ({talepler.length})</Text>
        </TouchableOpacity>
      </View>

      {/* 1. PORTFÖY LİSTESİ */}
      {aktifSekme === 'portfoy' && (
        <View>
          <View style={styles.card}>
            <TextInput style={styles.input} placeholder="🔍 Hızlı Muhit / İlan Ara..." value={aramaMuhit} onChangeText={setAramaMuhit} />
          </View>

          {filtrelenmisPortfoy.map(item => (
            <View key={item.id} style={styles.ilanCard}>
              <Text style={styles.ilanBaslik}>{item.baslik}</Text>
              <Text style={styles.ilanDetay}>{item.kategori} | Muhit: {item.muhit}</Text>
              <Text style={styles.fiyat}>{item.fiyat.toLocaleString('tr-TR')} TL</Text>
              
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.editBtn} onPress={() => ilanDuzenleBaslat(item)}>
                  <Text style={styles.btnTextWhite}>Düzenle</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => ilanSil(item.id)}>
                  <Text style={styles.btnTextWhite}>Sil</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 2. İLAN EKLEME / DÜZENLEME FORMU */}
      {aktifSekme === 'ilanEkle' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{duzenleId ? '✏️ İlanı Düzenle' : '➕ Yeni Mülk Ekle'}</Text>
          
          <Text style={styles.label}>İlan Başlığı</Text>
          <TextInput style={styles.input} placeholder="Örn: Denize Sıfır Villa" value={yeniBaslik} onChangeText={setYeniBaslik} />

          <Text style={styles.label}>Kategori</Text>
          <View style={styles.row}>
            {['Villa', 'Daire', 'Arsa'].map(kat => (
              <TouchableOpacity key={kat} style={[styles.smallBtn, yeniKategori === kat && styles.activeSmallBtn]} onPress={() => setYeniKategori(kat)}>
                <Text style={yeniKategori === kat ? styles.activeText : styles.text}>{kat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Muhit</Text>
          <TextInput style={styles.input} placeholder="Örn: Ören" value={yeniMuhit} onChangeText={setYeniMuhit} />

          <Text style={styles.label}>Fiyat (TL)</Text>
          <TextInput style={styles.input} placeholder="Örn: 5000000" keyboardType="numeric" value={yeniFiyat} onChangeText={setYeniFiyat} />

          <TouchableOpacity style={styles.submitBtn} onPress={ilanKaydet}>
            <Text style={styles.submitBtnText}>{duzenleId ? 'Değişiklikleri Kaydet' : 'Portföye Ekle'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 3. MÜŞTERİ TALEPLERİ */}
      {aktifSekme === 'talepler' && (
        <View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{talepDuzenleId ? '✏️ Talebi Düzenle' : '👤 Yeni Alıcı Talebi Ekle'}</Text>
            
            <TextInput style={styles.input} placeholder="Müşteri Adı Soyadı" value={musteriAdi} onChangeText={setMusteriAdi} />
            <TextInput style={styles.input} placeholder="Aradığı Muhit (Örn: Ören)" value={talepMuhit} onChangeText={setTalepMuhit} />
            <TextInput style={styles.input} placeholder="Maksimum Bütçe (TL)" keyboardType="numeric" value={talepButce} onChangeText={setTalepButce} />

            <TouchableOpacity style={styles.submitBtn} onPress={talepKaydet}>
              <Text style={styles.submitBtnText}>{talepDuzenleId ? 'Talebi Güncelle' : 'Talebi Kaydet'}</Text>
            </TouchableOpacity>
          </View>

          {talepler.map(t => (
            <View key={t.id} style={styles.talepCard}>
              <Text style={styles.ilanBaslik}>👤 {t.musteri}</Text>
              <Text style={styles.ilanDetay}>Aradığı: {t.arananKategori} | Bölge: {t.arananMuhit}</Text>
              <Text style={styles.fiyat}>Max Bütçe: {t.maxButce.toLocaleString('tr-TR')} TL</Text>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.editBtn} onPress={() => talepDuzenleBaslat(t)}>
                  <Text style={styles.btnTextWhite}>Düzenle</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => talepSil(t.id)}>
                  <Text style={styles.btnTextWhite}>Sil</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 🚀 GELİŞTİRİCİ İMZASI */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>TOCO Ticaret Ofisi tarafından geliştirilmiştir</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f4f6f9', marginTop: 30 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#1a202c', marginBottom: 15 },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, backgroundColor: '#e2e8f0', borderRadius: 8, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  activeTab: { backgroundColor: '#2b6cb0' },
  tabText: { fontWeight: 'bold', color: '#4a5568', fontSize: 13 },
  activeTabText: { color: '#fff' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 10, backgroundColor: '#fff' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#4a5568', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  smallBtn: { flex: 1, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, marginHorizontal: 2 },
  activeSmallBtn: { backgroundColor: '#2b6cb0', borderColor: '#2b6cb0' },
  text: { color: '#4a5568' },
  activeText: { color: '#fff', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#38a169', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  ilanCard: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#2b6cb0', elevation: 1 },
  talepCard: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#d69e2e', elevation: 1 },
  ilanBaslik: { fontWeight: 'bold', fontSize: 15 },
  ilanDetay: { color: '#718096', fontSize: 12, marginVertical: 4 },
  fiyat: { color: '#2b6cb0', fontWeight: 'bold', marginBottom: 8 },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#edf2f7', paddingTop: 8, marginTop: 4 },
  editBtn: { backgroundColor: '#d69e2e', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginRight: 8 },
  deleteBtn: { backgroundColor: '#e53e3e', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  btnTextWhite: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  footerContainer: { padding: 20, alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 30 },
  footerText: { fontSize: 12, color: '#a0aec0', fontWeight: '600' }
});
