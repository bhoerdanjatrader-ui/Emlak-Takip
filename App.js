import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal
} from 'react-native';

export default function App() {
  const [lang, setLang] = useState('tr'); // 'tr' veya 'en'
  const [activeTab, setActiveTab] = useState('kasa'); // 'kasa', 'portfoy', 'talepler', 'eslesme'

  // Kasa State'leri
  const [bakiye, setBakiye] = useState(12500);
  const [islemTipi, setIslemTipi] = useState('gelir');
  const [tutar, setTutar] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [islemGecmisi, setIslemGecmisi] = useState([
    { id: '1', tip: 'gelir', tutar: 15000, aciklama: 'Satış Komisyonu - Villa', tarih: '10.11.2026' },
    { id: '2', tip: 'gider', tutar: 2500, aciklama: 'Ofis Kirası', tarih: '01.11.2026' },
  ]);

  // Portföy State'leri
  const [portfoyler, setPortfoyler] = useState([
    { id: '1', baslik: 'Ören 3+1 Daire', tip: 'Satılık', fiyat: 3200000, konum: 'Burhaniye/Ören', aciklama: 'Denize sıfır, kombili, önü kapanmaz manzaralı.' },
    { id: '2', baslik: 'Bahçelievler Villa', tip: 'Kiralık', fiyat: 25000, konum: 'Burhaniye Merkez', aciklama: 'Müstakil bahçeli, eşyalı lüks villa.' }
  ]);
  const [pBaslik, setPBaslik] = useState('');
  const [pTip, setPTip] = useState('Satılık');
  const [pFiyat, setPFiyat] = useState('');
  const [pKonum, setPKonum] = useState('');
  const [pAciklama, setPAciklama] = useState('');

  // Talep State'leri (Alıcı/Kiralayıcı Talepleri)
  const [talepler, setTalepler] = useState([
    { id: '1', musteri: 'Ahmet Bey', tip: 'Satılık', maxFiyat: 3500000, aranan: '3+1 Daire', konum: 'Ören' }
  ]);
  const [tMusteri, setTMusteri] = useState('');
  const [tTip, setTTip] = useState('Satılık');
  const [tMaxFiyat, setTMaxFiyat] = useState('');
  const [tAranan, setTAranan] = useState('');
  const [tKonum, setTKonum] = useState('');

  // Eşleşme Bildirimleri
  const [bildirimler, setBildirimler] = useState([]);

  // Dil Metinleri
  const t = {
    tr: {
      title: 'Patron | Esnaf & Emlak Kasa',
      kasa: 'Kasa',
      portfoy: 'Portföy',
      talepler: 'Talepler',
      eslesme: 'Eşleşmeler',
      bakiye: 'Kasa Bakiyesi',
      yeniIslem: 'Gelir / Gider Ekle',
      tutar: 'Tutar (TL)',
      islemAciklama: 'İşlem Açıklaması',
      kaydet: 'Kaydet',
      gelir: 'Gelir',
      gider: 'Gider',
      gecmis: 'İşlem Geçmişi',
      portfoyEkle: 'Yeni Portföy Ekle',
      pBaslik: 'Portföy Başlığı (Örn: Ören Daire)',
      pTip: 'Tür (Satılık/Kiralık)',
      pFiyat: 'Fiyat (TL)',
      pKonum: 'Konum',
      pAciklama: 'Portföy Detay Açıklaması',
      talepEkle: 'Müşteri Talebi Ekle',
      tMusteri: 'Müşteri Adı Soyadı',
      tMaxFiyat: 'Maksimum Bütçe (TL)',
      tAranan: 'Aranan Özellik / Gayrimenkul',
      tKonum: 'İstenilen Bölge',
      eslesmeBaslik: 'Portföy - Talep Eşleşmeleri',
      bildirimYok: 'Şu an aktif eşleşen portföy bulunmuyor.'
    },
    en: {
      title: 'Patron | Broker & Cashier',
      kasa: 'Cashier',
      portfoy: 'Portfolio',
      talepler: 'Requests',
      eslesme: 'Matches',
      bakiye: 'Current Balance',
      yeniIslem: 'Add Income / Expense',
      tutar: 'Amount (TL)',
      islemAciklama: 'Transaction Description',
      kaydet: 'Save',
      gelir: 'Income',
      gider: 'Expense',
      gecmis: 'Transaction History',
      portfoyEkle: 'Add New Portfolio',
      pBaslik: 'Title (e.g. Oren Apartment)',
      pTip: 'Type (Sale/Rent)',
      pFiyat: 'Price (TL)',
      pKonum: 'Location',
      pAciklama: 'Detailed Description',
      talepEkle: 'Add Client Request',
      tMusteri: 'Client Name',
      tMaxFiyat: 'Max Budget (TL)',
      tAranan: 'Desired Property Type',
      tKonum: 'Target Location',
      eslesmeBaslik: 'Portfolio & Request Matches',
      bildirimYok: 'No matching portfolios found at the moment.'
    }
  };

  const text = t[lang];

  // Portföy ve Talepleri Otomatik Eşleştirme Kontrolü
  useEffect(() => {
    let yeniEslesmeler = [];
    portfoyler.forEach(portfoy => {
      talepler.forEach(talep => {
        // Tip uyuşuyorsa, fiyat bütçenin altında/eşitse ve konum eşleşiyorsa bildirim üret
        const fiyatUygun = portfoy.fiyat <= Number(talep.maxFiyat);
        const tipUygun = portfoy.tip.toLowerCase() === talep.tip.toLowerCase();
        const konumUygun = portfoy.konum.toLowerCase().includes(talep.konum.toLowerCase());

        if (fiyatUygun && tipUygun && konumUygun) {
          yeniEslesmeler.push({
            id: `${portfoy.id}-${talep.id}`,
            mesaj: `🎯 Eşleşme Bulundu! ${talep.musteri} adlı müşterinin talebi (${talep.aranan} - max ${talep.maxFiyat} TL) ile "${portfoy.baslik}" (${portfoy.fiyat} TL) portföyü uyuşuyor!`
          });
        }
      });
    });
    setBildirimler(yeniEslesmeler);
  }, [portfoyler, talepler]);

  // Kasa İşlemi Ekle
  const islemEkle = () => {
    if (!tutar || !aciklama) {
      Alert.alert('Hata', 'Lütfen tutar ve açıklama giriniz.');
      return;
    }
    const sayiTutar = Number(tutar);
    const yeniBakiye = islemTipi === 'gelir' ? bakiye + sayiTutar : bakiye - sayiTutar;
    setBakiye(yeniBakiye);

    const yeniIslemObj = {
      id: Date.now().toString(),
      tip: islemTipi,
      tutar: sayiTutar,
      aciklama: aciklama,
      tarih: new Date().toLocaleDateString('tr-TR')
    };

    setIslemGecmisi([yeniIslemObj, ...islemGecmisi]);
    setTutar('');
    setAciklama('');
    Alert.alert('Başarılı', 'İşlem kasaya işlendi.');
  };

  // Portföy Ekle
  const portfoyEkle = () => {
    if (!pBaslik || !pFiyat || !pKonum) {
      Alert.alert('Hata', 'Başlık, fiyat ve konum alanları zorunludur.');
      return;
    }
    const yeniP = {
      id: Date.now().toString(),
      baslik: pBaslik,
      tip: pTip,
      fiyat: Number(pFiyat),
      konum: pKonum,
      aciklama: pAciklama
    };
    setPortfoyler([yeniP, ...portfoyler]);
    setPBaslik('');
    setPFiyat('');
    setPKonum('');
    setPAciklama('');
    Alert.alert('Başarılı', 'Portföy başarıyla eklendi ve eşleşmeler tarandı!');
  };

  // Talep Ekle
  const talepEkle = () => {
    if (!tMusteri || !tMaxFiyat || !tKonum) {
      Alert.alert('Hata', 'Müşteri adı, maksimum bütçe ve bölge zorunludur.');
      return;
    }
    const yeniT = {
      id: Date.now().toString(),
      musteri: tMusteri,
      tip: tTip,
      maxFiyat: Number(tMaxFiyat),
      aranan: tAranan,
      konum: tKonum
    };
    setTalepler([yeniT, ...talepler]);
    setTMusteri('');
    setTMaxFiyat('');
    setTAranan('');
    setTKonum('');
    Alert.alert('Başarılı', 'Talep eklendi ve uygun portföylerle eşleştirildi!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      
      {/* Üst Başlık ve Dil Seçimi */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{text.title}</Text>
        <TouchableOpacity style={styles.langBtn} onPress={() => setLang(lang === 'tr' ? 'en' : 'tr')}>
          <Text style={styles.langText}>{lang === 'tr' ? 'EN 🇬🇧' : 'TR 🇹🇷'}</Text>
        </TouchableOpacity>
      </View>

      {/* Sekmeler / Menü */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'kasa' && styles.activeTab]} onPress={() => setActiveTab('kasa')}>
          <Text style={[styles.tabText, activeTab === 'kasa' && styles.activeTabText]}>{text.kasa}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'portfoy' && styles.activeTab]} onPress={() => setActiveTab('portfoy')}>
          <Text style={[styles.tabText, activeTab === 'portfoy' && styles.activeTabText]}>{text.portfoy}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'talepler' && styles.activeTab]} onPress={() => setActiveTab('talepler')}>
          <Text style={[styles.tabText, activeTab === 'talepler' && styles.activeTabText]}>{text.talepler}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'eslesme' && styles.activeTab]} onPress={() => setActiveTab('eslesme')}>
          <Text style={[styles.tabText, activeTab === 'eslesme' && styles.activeTabText]}>
            {text.eslesme} {bildirimler.length > 0 ? `(${bildirimler.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* KASA SEKMESİ */}
        {activeTab === 'kasa' && (
          <View>
            <View style={styles.bakiyeCard}>
              <Text style={styles.bakiyeLabel}>{text.bakiye}</Text>
              <Text style={styles.bakiyeValue}>{bakiye.toLocaleString()} TL</Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>{text.yeniIslem}</Text>
              <View style={styles.tipRow}>
                <TouchableOpacity 
                  style={[styles.tipBtn, islemTipi === 'gelir' && styles.gelirActive]} 
                  onPress={() => setIslemTipi('gelir')}
                >
                  <Text style={styles.tipText}>{text.gelir}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tipBtn, islemTipi === 'gider' && styles.giderActive]} 
                  onPress={() => setIslemTipi('gider')}
                >
                  <Text style={styles.tipText}>{text.gider}</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder={text.tutar}
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={tutar}
                onChangeText={setTutar}
              />
              <TextInput
                style={styles.input}
                placeholder={text.islemAciklama}
                placeholderTextColor="#94a3b8"
                value={aciklama}
                onChangeText={setAciklama}
              />
              <TouchableOpacity style={styles.saveBtn} onPress={islemEkle}>
                <Text style={styles.saveBtnText}>{text.kaydet}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>{text.gecmis}</Text>
            {islemGecmisi.map(item => (
              <View key={item.id} style={styles.historyItem}>
                <View>
                  <Text style={styles.historyDesc}>{item.aciklama}</Text>
                  <Text style={styles.historyDate}>{item.tarih}</Text>
                </View>
                <Text style={[styles.historyAmount, item.tip === 'gelir' ? styles.textGelir : styles.textGider]}>
                  {item.tip === 'gelir' ? '+' : '-'}{item.tutar.toLocaleString()} TL
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* PORTFÖY SEKMESİ */}
        {activeTab === 'portfoy' && (
          <View>
            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>{text.portfoyEkle}</Text>
              <TextInput style={styles.input} placeholder={text.pBaslik} placeholderTextColor="#94a3b8" value={pBaslik} onChangeText={setPBaslik} />
              
              <View style={styles.tipRow}>
                <TouchableOpacity style={[styles.tipBtn, pTip === 'Satılık' && styles.gelirActive]} onPress={() => setPTip('Satılık')}>
                  <Text style={styles.tipText}>Satılık</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tipBtn, pTip === 'Kiralık' && styles.giderActive]} onPress={() => setPTip('Kiralık')}>
                  <Text style={styles.tipText}>Kiralık</Text>
                </TouchableOpacity>
              </View>

              <TextInput style={styles.input} placeholder={text.pFiyat} placeholderTextColor="#94a3b8" keyboardType="numeric" value={pFiyat} onChangeText={setPFiyat} />
              <TextInput style={styles.input} placeholder={text.pKonum} placeholderTextColor="#94a3b8" value={pKonum} onChangeText={setPKonum} />
              <TextInput style={[styles.input, { height: 70 }]} placeholder={text.pAciklama} placeholderTextColor="#94a3b8" multiline value={pAciklama} onChangeText={setPAciklama} />
              
              <TouchableOpacity style={styles.saveBtn} onPress={portfoyEkle}>
                <Text style={styles.saveBtnText}>{text.kaydet}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Aktif Portföyler ({portfoyler.length})</Text>
            {portfoyler.map(p => (
              <View key={p.id} style={styles.listItem}>
                <View style={styles.listHeader}>
                  <Text style={styles.listTitle}>{p.baslik}</Text>
                  <Text style={styles.listBadge}>{p.tip}</Text>
                </View>
                <Text style={styles.listSub}>📍 {p.konum} | 💰 {p.fiyat.toLocaleString()} TL</Text>
                {p.aciklama ? <Text style={styles.listDesc}>{p.aciklama}</Text> : null}
              </View>
            ))}
          </View>
        )}

        {/* TALEPLER SEKMESİ */}
        {activeTab === 'talepler' && (
          <View>
            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>{text.talepEkle}</Text>
              <TextInput style={styles.input} placeholder={text.tMusteri} placeholderTextColor="#94a3b8" value={tMusteri} onChangeText={setTMusteri} />
              
              <View style={styles.tipRow}>
                <TouchableOpacity style={[styles.tipBtn, tTip === 'Satılık' && styles.gelirActive]} onPress={() => setTTip('Satılık')}>
                  <Text style={styles.tipText}>Satılık</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tipBtn, tTip === 'Kiralık' && styles.giderActive]} onPress={() => setTTip('Kiralık')}>
                  <Text style={styles.tipText}>Kiralık</Text>
                </TouchableOpacity>
              </View>

              <TextInput style={styles.input} placeholder={text.tMaxFiyat} placeholderTextColor="#94a3b8" keyboardType="numeric" value={tMaxFiyat} onChangeText={setTMaxFiyat} />
              <TextInput style={styles.input} placeholder={text.tAranan} placeholderTextColor="#94a3b8" value={tAranan} onChangeText={setTAranan} />
              <TextInput style={styles.input} placeholder={text.tKonum} placeholderTextColor="#94a3b8" value={tKonum} onChangeText={setTKonum} />

              <TouchableOpacity style={styles.saveBtn} onPress={talepEkle}>
                <Text style={styles.saveBtnText}>{text.kaydet}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Müşteri Talepleri ({talepler.length})</Text>
            {talepler.map(talep => (
              <View key={talep.id} style={styles.listItem}>
                <View style={styles.listHeader}>
                  <Text style={styles.listTitle}>{talep.musteri}</Text>
                  <Text style={styles.listBadge}>{talep.tip}</Text>
                </View>
                <Text style={styles.listSub}>🔍 {talep.aranan} | 📍 {talep.konum}</Text>
                <Text style={styles.listDesc}>Max Bütçe: {talep.maxFiyat.toLocaleString()} TL</Text>
              </View>
            ))}
          </View>
        )}

        {/* EŞLEŞMELER SEKMESİ */}
        {activeTab === 'eslesme' && (
          <View>
            <Text style={styles.sectionTitle}>{text.eslesmeBaslik}</Text>
            {bildirimler.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>{text.bildirimYok}</Text>
              </View>
            ) : (
              bildirimler.map(b => (
                <View key={b.id} style={styles.alertCard}>
                  <Text style={styles.alertText}>{b.mesaj}</Text>
                </View>
              ))
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { backgroundColor: '#1e293b', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold' },
  langBtn: { backgroundColor: '#334155', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  langText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#38bdf8' },
  tabText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  activeTabText: { color: '#38bdf8' },
  content: { padding: 15 },
  bakiyeCard: { backgroundColor: '#0284c7', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  bakiyeLabel: { color: '#e0f2fe', fontSize: 14, fontWeight: '600' },
  bakiyeValue: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginTop: 5 },
  formCard: { backgroundColor: '#1e293b', padding: 15, borderRadius: 12, marginBottom: 20 },
  cardTitle: { color: '#f8fafc', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  tipRow: { flexDirection: 'row', marginBottom: 12 },
  tipBtn: { flex: 1, padding: 10, backgroundColor: '#334155', alignItems: 'center', borderRadius: 8, marginHorizontal: 4 },
  gelirActive: { backgroundColor: '#16a34a' },
  giderActive: { backgroundColor: '#dc2626' },
  tipText: { color: '#fff', fontWeight: 'bold' },
  input: { backgroundColor: '#0f172a', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  saveBtn: { backgroundColor: '#0284c7', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  sectionTitle: { color: '#f8fafc', fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 5 },
  historyItem: { backgroundColor: '#1e293b', padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  historyDesc: { color: '#f8fafc', fontWeight: '600', fontSize: 14 },
  historyDate: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  historyAmount: { fontSize: 15, fontWeight: 'bold' },
  textGelir: { color: '#4ade80' },
  textGider: { color: '#f87171' },
  listItem: { backgroundColor: '#1e293b', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  listTitle: { color: '#f8fafc', fontSize: 15, fontWeight: 'bold' },
  listBadge: { backgroundColor: '#0369a1', color: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, fontSize: 11, fontWeight: 'bold' },
  listSub: { color: '#38bdf8', fontSize: 13, marginBottom: 4 },
  listDesc: { color: '#94a3b8', fontSize: 13, marginTop: 4, fontStyle: 'italic' },
  emptyCard: { backgroundColor: '#1e293b', padding: 25, borderRadius: 10, alignItems: 'center' },
  emptyText: { color: '#94a3b8', textAlign: 'center' },
  alertCard: { backgroundColor: '#065f46', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#047857' },
  alertText: { color: '#d1fae5', fontSize: 14, fontWeight: '600', lineHeight: 20 }
});
