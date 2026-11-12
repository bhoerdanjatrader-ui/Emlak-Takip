import React, { useState, useEffect, useMemo } from 'react';
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
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const normalizeText = (text) => {
  if (!text) return '';
  return text.toString().toLocaleLowerCase('tr-TR').trim();
};

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [girilenPin, setGirilenPin] = useState('');
  const [kayitliPin, setKayitliPin] = useState('1234');
  const [islemModu, setIslemModu] = useState('giris');
  const [yeniPinInput, setYeniPinInput] = useState('');

  // Tema Desteği ('dark' veya 'light')
  const [theme, setTheme] = useState('dark');
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('portfoy');

  // Kasa / Banka Hesapları
  const [hesaplar, setHesaplar] = useState([
    { id: '1', ad: 'Nakit Kasa', bakiye: 0 },
    { id: '2', ad: 'Ana Banka Hesabı', bakiye: 0 }
  ]);
  const [yeniHesapAd, setYeniHesapAd] = useState('');
  const [yeniHesapBakiye, setYeniHesapBakiye] = useState('');
  const [duzenlenenHesapId, setDuzenlenenHesapId] = useState(null);

  // Kredi ve Taksit Takip State'leri
  const [krediler, setKrediler] = useState([]);
  const [krediBanka, setKrediBanka] = useState('');
  const [krediTutar, setKrediTutar] = useState('');
  const [krediOdemeGunu, setKrediOdemeGunu] = useState('');
  const [krediGuncelTaksit, setKrediGuncelTaksit] = useState('');
  const [krediToplamTaksit, setKrediToplamTaksit] = useState('');

  const [islemTipi, setIslemTipi] = useState('gelir');
  const [tutar, setTutar] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [seciliHesap, setSeciliHesap] = useState('Nakit Kasa');
  const [islemGecmisi, setIslemGecmisi] = useState([]);

  const [portfoyler, setPortfoyler] = useState([]);
  const [pBaslik, setPBaslik] = useState('');
  const [pTip, setPTip] = useState('Satılık');
  const [pCategory, setPCategory] = useState('Konut');
  const [pFiyat, setPFiyat] = useState('');
  const [pKonum, setPKonum] = useState('');
  const [pAciklama, setPAciklama] = useState('');
  const [duzenlenenPortfoyId, setDuzenlenenPortfoyId] = useState(null);

  const [talepler, setTalepler] = useState([]);
  const [tMusteri, setTMusteri] = useState('');
  const [tTip, setTTip] = useState('Satılık');
  const [tCategory, setTCategory] = useState('Konut');
  const [tMaxFiyat, setTMaxFiyat] = useState('');
  const [tAranan, setTAranan] = useState('');
  const [tKonum, setTKonum] = useState('');
  const [duzenlenenTalepId, setDuzenlenenTalepId] = useState(null);

  const [pSearchQuery, setPSearchQuery] = useState('');
  const [pSelectedCategory, setPSelectedCategory] = useState('TÜMÜ');
  const [pSelectedStatus, setPSelectedStatus] = useState('TÜMÜ');

  const [tSearchQuery, setTSearchQuery] = useState('');
  const [tSelectedCategory, setTSelectedCategory] = useState('TÜMÜ');
  const [tSelectedStatus, setTSelectedStatus] = useState('TÜMÜ');

  const [bildirimler, setBildirimler] = useState([]);

  const parmakIziIleGiris = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) return;
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) return;
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'PATRON Uygulamasının Kilidini Aç',
        fallbackLabel: 'Şifre Kullan',
      });
      if (result.success) {
        setIsUnlocked(true);
      }
    } catch (e) {
      console.log('Biyometrik hata', e);
    }
  };

  // Veri Yükleme (Asla silinmeme garantili AsyncStorage anahtarları)
  useEffect(() => {
    const verileriYukle = async () => {
      try {
        const kayitliHesaplar = await AsyncStorage.getItem('@toco_hesaplar');
        const kayitliIslemler = await AsyncStorage.getItem('@toco_islemler');
        const kayitliPortfoyler = await AsyncStorage.getItem('@toco_portfoyler');
        const kayitliTalepler = await AsyncStorage.getItem('@toco_talepler');
        const kayitliKrediler = await AsyncStorage.getItem('@toco_krediler');
        const savedPin = await AsyncStorage.getItem('@toco_app_pin');
        const savedTheme = await AsyncStorage.getItem('@toco_app_theme');

        if (kayitliHesaplar) setHesaplar(JSON.parse(kayitliHesaplar));
        if (kayitliIslemler) setIslemGecmisi(JSON.parse(kayitliIslemler));
        if (kayitliPortfoyler) setPortfoyler(JSON.parse(kayitliPortfoyler));
        if (kayitliTalepler) setTalepler(JSON.parse(kayitliTalepler));
        if (kayitliKrediler) setKrediler(JSON.parse(kayitliKrediler));
        if (savedPin) setKayitliPin(savedPin);
        if (savedTheme) setTheme(savedTheme);

        parmakIziIleGiris();
      } catch (e) {
        console.log('Veri yükleme hatası', e);
      }
    };
    verileriYukle();
  }, []);

  useEffect(() => { AsyncStorage.setItem('@toco_hesaplar', JSON.stringify(hesaplar)); }, [hesaplar]);
  useEffect(() => { AsyncStorage.setItem('@toco_islemler', JSON.stringify(islemGecmisi)); }, [islemGecmisi]);
  useEffect(() => { AsyncStorage.setItem('@toco_portfoyler', JSON.stringify(portfoyler)); }, [portfoyler]);
  useEffect(() => { AsyncStorage.setItem('@toco_talepler', JSON.stringify(talepler)); }, [talepler]);
  useEffect(() => { AsyncStorage.setItem('@toco_krediler', JSON.stringify(krediler)); }, [krediler]);
  useEffect(() => { AsyncStorage.setItem('@toco_app_theme', theme); }, [theme]);

  useEffect(() => {
    let yeniEslesmeler = [];
    portfoyler.forEach(portfoy => {
      talepler.forEach(talep => {
        const pCat = normalizeText(portfoy.category || 'konut');
        const tCat = normalizeText(talep.category || 'konut');
        const kategoriUygun = pCat === tCat;
        const tipUygun = normalizeText(portfoy.tip) === normalizeText(talep.tip);
        const pKonumStr = normalizeText(portfoy.konum);
        const tKonumStr = normalizeText(talep.konum);
        const konumUygun = !tKonumStr || pKonumStr.includes(tKonumStr) || tKonumStr.includes(pKonumStr);
        const pFiyatNum = Number(portfoy.fiyat) || 0;
        const tMaxFiyatNum = Number(talep.maxFiyat) || 0;
        const fiyatUygun = portfoy.tip === 'Kat Karşılığı' || tMaxFiyatNum === 0 || pFiyatNum <= tMaxFiyatNum * 1.15;

        if (kategoriUygun && tipUygun && konumUygun && fiyatUygun) {
          yeniEslesmeler.push({
            id: `${portfoy.id}-${talep.id}`,
            mesaj: `🎯 Müşteri: ${talep.musteri} (${talep.aranan} - Max: ${tMaxFiyatNum.toLocaleString()} TL) ile Portföy: "${portfoy.baslik}" (${pFiyatNum.toLocaleString()} TL - ${portfoy.konum}) eşleşti!`
          });
        }
      });
    });
    setBildirimler(yeniEslesmeler);
  }, [portfoyler, talepler]);

  const filtrelenmisPortfoyler = useMemo(() => {
    return portfoyler.filter(p => {
      const query = normalizeText(pSearchQuery);
      const searchMatch = !query || 
        normalizeText(p.baslik).includes(query) || 
        normalizeText(p.konum).includes(query) || 
        normalizeText(p.aciklama).includes(query);

      const catMatch = pSelectedCategory === 'TÜMÜ' || normalizeText(p.category) === normalizeText(pSelectedCategory);
      const statusMatch = pSelectedStatus === 'TÜMÜ' || normalizeText(p.tip) === normalizeText(pSelectedStatus);

      return searchMatch && catMatch && statusMatch;
    });
  }, [portfoyler, pSearchQuery, pSelectedCategory, pSelectedStatus]);

  const filtrelenmisTalepler = useMemo(() => {
    return talepler.filter(t => {
      const query = normalizeText(tSearchQuery);
      const searchMatch = !query || 
        normalizeText(t.musteri).includes(query) || 
        normalizeText(t.aranan).includes(query) || 
        normalizeText(t.konum).includes(query);

      const catMatch = tSelectedCategory === 'TÜMÜ' || normalizeText(t.category) === normalizeText(tSelectedCategory);
      const statusMatch = tSelectedStatus === 'TÜMÜ' || normalizeText(t.tip) === normalizeText(tSelectedStatus);

      return searchMatch && catMatch && statusMatch;
    });
  }, [talepler, tSearchQuery, tSelectedCategory, tSelectedStatus]);

  const toplamVarlik = hesaplar.reduce((toplam, h) => toplam + h.bakiye, 0);
  const toplamKrediBorcu = krediler.reduce((toplam, k) => toplam + Number(k.tutar || 0), 0);
  const hesaplarBaslangicToplami = hesaplar.reduce((t, h) => t + h.bakiye, 0);
  const islemGelirToplami = islemGecmisi.filter(i => i.tip === 'gelir').reduce((t, i) => t + i.tutar, 0);
  const toplamGelir = Math.max(0, hesaplarBaslangicToplami) + islemGelirToplami;
  const toplamGider = islemGecmisi.filter(i => i.tip === 'gider').reduce((t, i) => t + i.tutar, 0);

  const pinleGirisYap = () => {
    if (girilenPin === kayitliPin) {
      setIsUnlocked(true);
      setGirilenPin('');
    } else {
      Alert.alert('Hata', 'Hatalı şifre girdiniz!');
      setGirilenPin('');
    }
  };

  const yeniPinKaydet = async () => {
    if (yeniPinInput.length < 4) {
      return Alert.alert('Hata', 'Şifre en az 4 haneli olmalıdır.');
    }
    setKayitliPin(yeniPinInput);
    await AsyncStorage.setItem('@toco_app_pin', yeniPinInput);
    setYeniPinInput('');
    setIslemModu('giris');
    Alert.alert('Başarılı', 'Uygulama şifreniz güncellendi.');
  };

  const hesapKaydet = () => {
    if (!yeniHesapAd) return Alert.alert('Hata', 'Hesap adı giriniz.');
    const bakiyeNum = Number(yeniHesapBakiye) || 0;
    if (duzenlenenHesapId) {
      setHesaplar(hesaplar.map(h => h.id === duzenlenenHesapId ? { ...h, ad: yeniHesapAd, bakiye: bakiyeNum } : h));
      setDuzenlenenHesapId(null);
    } else {
      setHesaplar([...hesaplar, { id: Date.now().toString(), ad: yeniHesapAd, bakiye: bakiyeNum }]);
    }
    setYeniHesapAd(''); setYeniHesapBakiye('');
  };

  const hesapSil = (id) => setHesaplar(hesaplar.filter(h => h.id !== id));
  const hesapDuzenleBaslat = (hesap) => {
    setDuzenlenenHesapId(hesap.id);
    setYeniHesapAd(hesap.ad);
    setYeniHesapBakiye(hesap.bakiye.toString());
  };

  const krediKaydet = () => {
    if (!krediBanka || !krediTutar || !krediOdemeGunu) return Alert.alert('Hata', 'Banka adı, tutar ve ödeme günü zorunludur.');
    const yeniKredi = {
      id: Date.now().toString(),
      banka: krediBanka,
      tutar: Number(krediTutar) || 0,
      odemeGunu: krediOdemeGunu,
      guncelTaksit: krediGuncelTaksit || '1',
      toplamTaksit: krediToplamTaksit || '1'
    };
    setKrediler([yeniKredi, ...krediler]);
    setKrediBanka(''); setKrediTutar(''); setKrediOdemeGunu(''); setKrediGuncelTaksit(''); setKrediToplamTaksit('');
  };

  const krediErkenKapat = (id) => {
    Alert.alert(
      'Krediyi Kapat',
      'Bu krediyi erken kapatarak borç yükümlülüğünden kaldırmak istiyor musunuz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Evet, Kapat', onPress: () => setKrediler(krediler.filter(k => k.id !== id)) }
      ]
    );
  };

  const islemKaydet = () => {
    if (!tutar || !aciklama) return Alert.alert('Hata', 'Tutar ve açıklama zorunludur.');
    const sayiTutar = Number(tutar);
    setHesaplar(hesaplar.map(h => {
      if (h.ad === seciliHesap) {
        const yeniBakiye = islemTipi === 'gelir' ? h.bakiye + sayiTutar : h.bakiye - sayiTutar;
        return { ...h, bakiye: yeniBakiye };
      }
      return h;
    }));
    const yeniIslem = {
      id: Date.now().toString(),
      tip: islemTipi,
      tutar: sayiTutar,
      aciklama,
      hesap: seciliHesap,
      tarih: new Date().toLocaleDateString('tr-TR')
    };
    setIslemGecmisi([yeniIslem, ...islemGecmisi]);
    setTutar(''); setAciklama('');
  };

  const islemSil = (id, tip, tutarVal, hesapAdi) => {
    setHesaplar(hesaplar.map(h => {
      if (h.ad === hesapAdi) {
        const geriBakiye = tip === 'gelir' ? h.bakiye - tutarVal : h.bakiye + tutarVal;
        return { ...h, bakiye: geriBakiye };
      }
      return h;
    }));
    setIslemGecmisi(islemGecmisi.filter(i => i.id !== id));
  };

  const portfoyKaydet = () => {
    if (!pBaslik || !pFiyat || !pKonum) return Alert.alert('Hata', 'Başlık, fiyat ve konum zorunludur.');
    const fiyatNum = Number(pFiyat);
    if (duzenlenenPortfoyId) {
      setPortfoyler(portfoyler.map(p => p.id === duzenlenenPortfoyId ? { ...p, baslik: pBaslik, tip: pTip, category: pCategory, fiyat: fiyatNum, konum: pKonum, aciklama: pAciklama } : p));
      setDuzenlenenPortfoyId(null);
    } else {
      const yeniP = { id: Date.now().toString(), baslik: pBaslik, tip: pTip, category: pCategory, fiyat: fiyatNum, konum: pKonum, aciklama: pAciklama };
      setPortfoyler([yeniP, ...portfoyler]);
    }
    setPBaslik(''); setPFiyat(''); setPKonum(''); setPAciklama('');
  };

  const portfoySil = (id) => setPortfoyler(portfoyler.filter(p => p.id !== id));
  const portfoyDuzenleBaslat = (p) => {
    setDuzenlenenPortfoyId(p.id);
    setPBaslik(p.baslik); setPTip(p.tip); setPCategory(p.category || 'Konut'); setPFiyat(p.fiyat.toString()); setPKonum(p.konum); setPAciklama(p.aciklama);
  };

  const talepKaydet = () => {
    if (!tMusteri || !tMaxFiyat || !tKonum) return Alert.alert('Hata', 'Müşteri, bütçe ve bölge zorunludur.');
    const busteriMax = Number(tMaxFiyat);
    if (duzenlenenTalepId) {
      setTalepler(talepler.map(t => t.id === duzenlenenTalepId ? { ...t, musteri: tMusteri, tip: tTip, category: tCategory, maxFiyat: busteriMax, aranan: tAranan, konum: tKonum } : t));
      setDuzenlenenTalepId(null);
    } else {
      const yeniT = { id: Date.now().toString(), musteri: tMusteri, tip: tTip, category: tCategory, maxFiyat: busteriMax, aranan: tAranan, konum: tKonum };
      setTalepler([yeniT, ...talepler]);
    }
    setTMusteri(''); setTMaxFiyat(''); setTAranan(''); setTKonum('');
  };

  const talepSil = (id) => setTalepler(talepler.filter(t => t.id !== id));
  const talepDuzenleBaslat = (t) => {
    setDuzenlenenTalepId(t.id);
    setTMusteri(t.musteri); setTTip(t.tip); setTCategory(t.category || 'Konut'); setTMaxFiyat(t.maxFiyat.toString()); setTAranan(t.aranan); setTKonum(t.konum);
  };

  const dynStyles = getDynamicStyles(isDark);

  if (!isUnlocked) {
    return (
      <SafeAreaView style={dynStyles.lockContainer}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#121214' : '#f3f4f6'} />
        <View style={dynStyles.lockCard}>
          <View style={styles.titleBox}>
            <Text style={styles.headerTitle}>PATRON</Text>
          </View>
          <Text style={dynStyles.lockSubText}>TOCO Ticaret Ofisi Güvenli Giriş</Text>

          <TouchableOpacity style={dynStyles.biometricBtn} onPress={parmakIziIleGiris}>
            <Text style={dynStyles.biometricText}>👆 Parmak İzi ile Aç</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={dynStyles.line} />
            <Text style={dynStyles.orText}>VEYA ŞİFRE GİRİN</Text>
            <View style={dynStyles.line} />
          </View>

          <TextInput
            style={dynStyles.lockInput}
            placeholder="Uygulama Şifresi (PIN)"
            placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
            secureTextEntry
            keyboardType="numeric"
            value={girilenPin}
            onChangeText={setGirilenPin}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={pinleGirisYap}>
            <Text style={styles.saveBtnText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynStyles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#0b0f19' : '#e5e7eb'} />
      
      <View style={dynStyles.header}>
        <View style={styles.titleBox}>
          <Text style={styles.headerTitle}>PATRON</Text>
        </View>
      </View>

      {/* Sekmeler (Ayarlar sekmesi eklendi) */}
      <View style={dynStyles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'portfoy' && dynStyles.activeTab]} onPress={() => setActiveTab('portfoy')}>
          <Text style={[dynStyles.tabText, activeTab === 'portfoy' && dynStyles.activeTabText]}>Portföy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'talepler' && dynStyles.activeTab]} onPress={() => setActiveTab('talepler')}>
          <Text style={[dynStyles.tabText, activeTab === 'talepler' && dynStyles.activeTabText]}>Talepler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'eslesme' && dynStyles.activeTab]} onPress={() => setActiveTab('eslesme')}>
          <Text style={[dynStyles.tabText, activeTab === 'eslesme' && dynStyles.activeTabText]}>
            Eşleşme {bildirimler.length > 0 ? `(${bildirimler.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'kasa' && dynStyles.activeTab]} onPress={() => setActiveTab('kasa')}>
          <Text style={[dynStyles.tabText, activeTab === 'kasa' && dynStyles.activeTabText]}>Kasa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'ayarlar' && dynStyles.activeTab]} onPress={() => setActiveTab('ayarlar')}>
          <Text style={[dynStyles.tabText, activeTab === 'ayarlar' && dynStyles.activeTabText]}>Ayarlar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* PORTFÖY SEKMESİ */}
        {activeTab === 'portfoy' && (
          <View>
            <View style={dynStyles.formCard}>
              <Text style={dynStyles.cardTitle}>{duzenlenenPortfoyId ? 'Portföy Düzenle' : 'Portföy Ekle'}</Text>
              <TextInput style={dynStyles.input} placeholder="Portföy Başlığı" placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'} value={pBaslik} onChangeText={setPBaslik} />
              
              <Text style={dynStyles.labelSub}>Kategori:</Text>
              <View style={styles.gridSelector}>
                {['Konut', 'Arsa', 'İş Yeri', 'Zeytinlik/Tarla'].map(cat => (
                  <TouchableOpacity key={cat} onPress={() => setPCategory(cat)} style={[dynStyles.gridBtn, pCategory === cat && dynStyles.gridBtnActive]}>
                    <Text style={[dynStyles.gridBtnText, pCategory === cat && dynStyles.gridBtnTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={dynStyles.labelSub}>İşlem Tipi:</Text>
              <View style={styles.tipRow}>
                {['Satılık', 'Kiralık', 'Kat Karşılığı'].map(st => (
                  <TouchableOpacity key={st} style={[dynStyles.tipBtn, pTip === st && dynStyles.gelirActive]} onPress={() => setPTip(st)}>
                    <Text style={dynStyles.tipText}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput style={dynStyles.input} placeholder="Fiyat (TL)" placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'} keyboardType="default" value={pFiyat} onChangeText={setPFiyat} />
              <TextInput style={dynStyles.input} placeholder="Konum / Bölge" placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'} value={pKonum} onChangeText={setPKonum} />
              <TextInput style={[dynStyles.input, { height: 70 }]} placeholder="Açıklama" placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'} multiline value={pAciklama} onChangeText={setPAciklama} />
              
              <TouchableOpacity style={styles.saveBtn} onPress={portfoyKaydet}>
                <Text style={styles.saveBtnText}>{duzenlenenPortfoyId ? 'Güncelle' : 'Kaydet'}</Text>
              </TouchableOpacity>
              {duzenlenenPortfoyId && (
                <TouchableOpacity style={[styles.saveBtn, {backgroundColor: '#374151', marginTop: 8}]} onPress={() => { setDuzenlenenPortfoyId(null); setPBaslik(''); setPFiyat(''); setPKonum(''); setPAciklama(''); }}>
                  <Text style={styles.saveBtnText}>İptal</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={dynStyles.filterCard}>
              <TextInput 
                style={dynStyles.searchInput} 
                placeholder="🔍 Portföy ara (Başlık, bölge)..." 
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={pSearchQuery}
                onChangeText={setPSearchQuery}
              />
              <Text style={dynStyles.filterLabelHeader}>Kategoriye Göre Filtrele:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {['TÜMÜ', 'Konut', 'Arsa', 'İş Yeri', 'Zeytinlik/Tarla'].map(cat => (
                  <TouchableOpacity key={cat} onPress={() => setPSelectedCategory(cat)} style={[dynStyles.chip, pSelectedCategory === cat && dynStyles.chipActive]}>
                    <Text style={[dynStyles.chipText, pSelectedCategory === cat && dynStyles.chipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={dynStyles.filterLabelHeader}>İşlem Tipine Göre:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {['TÜMÜ', 'Satılık', 'Kiralık', 'Kat Karşılığı'].map(st => (
                  <TouchableOpacity key={st} onPress={() => setPSelectedStatus(st)} style={[dynStyles.subChip, pSelectedStatus === st && dynStyles.subChipActive]}>
                    <Text style={[dynStyles.subChipText, pSelectedStatus === st && dynStyles.subChipTextActive]}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={dynStyles.sectionTitle}>Portföyler ({filtrelenmisPortfoyler.length} / {portfoyler.length})</Text>
            {filtrelenmisPortfoyler.length === 0 ? (
              <View style={dynStyles.emptyCard}><Text style={dynStyles.emptyText}>Kayıtlı portföy bulunamadı.</Text></View>
            ) : (
              filtrelenmisPortfoyler.map(p => (
                <View key={p.id} style={dynStyles.listItem}>
                  <View style={{flex: 1}}>
                    <View style={styles.listHeader}>
                      <Text style={dynStyles.listTitle}>{p.baslik}</Text>
                      <View style={{flexDirection: 'row', gap: 4}}>
                        <Text style={styles.listBadge}>{p.category || 'Konut'}</Text>
                        <Text style={[styles.listBadge, {backgroundColor: '#6A1B29'}]}>{p.tip}</Text>
                      </View>
                    </View>
                    <Text style={dynStyles.listSub}>📍 {p.konum} | 💰 {p.fiyat.toLocaleString()} TL</Text>
                    {p.aciklama ? <Text style={dynStyles.listDesc}>{p.aciklama}</Text> : null}
                  </View>
                  <View style={styles.actionColumn}>
                    <TouchableOpacity style={styles.iconBtnEdit} onPress={() => portfoyDuzenleBaslat(p)}>
                      <Text style={styles.iconText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtnDel} onPress={() => portfoySil(p.id)}>
                      <Text style={styles.iconText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TALEPLER SEKMESİ */}
        {activeTab === 'talepler' && (
          <View>
            <View style={dynStyles.formCard}>
              <Text style={dynStyles.cardTitle}>{duzenlenenTalepId ? 'Talep Düzenle' : 'Talep Ekle'}</Text>
              <TextInput style={dynStyles.input} placeholder="Müşteri Adı" placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'} value={tMusteri} onChangeText={setTMusteri} />
              
              <Text style={dynStyles.labelSub}>Kategori:</Text>
              <View style={styles.gridSelector}>
                {['Konut', 'Arsa', 'İş Yeri', 'Zeytinlik/Tarla'].map(cat => (
                  <TouchableOpacity key={cat} onPress={() => setTCategory(cat)} style={[dynStyles.gridBtn, tCategory === cat && dynStyles.gridBtnActive]}>
                    <Text style={[dynStyles.gridBtnText, tCategory === cat && dynStyles.gridBtnTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={dynStyles.labelSub}>İşlem Tipi:</Text>
              <View style={styles.tipRow}>
                {['Satılık', 'Kiralık', 'Kat Karşılığı'].map(st => (
                  <TouchableOpacity key={st} style={[styles.tipBtn, tTip === st && dynStyles.gelirActive]} onPress={() => setTTip(st)}>
                    <Text style={styles.tipText}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput style={dynStyles.input} placeholder="Max Bütçe (TL)" placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'} keyboardType="default" value={tMaxFiyat} onChangeText={setTMaxFiyat} />
              <TextInput style={dynStyles.input} placeholder="Aranan Gayrimenkul" placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'} value={tAranan} onChangeText={setTAranan} />
              <TextInput style={dynStyles.input} placeholder="Bölge" placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'} value={tKonum} onChangeText={setTKonum} />

              <TouchableOpacity style={styles.saveBtn} onPress={talepKaydet}>
                <Text style={styles.saveBtnText}>{duzenlenenTalepId ? 'Güncelle' : 'Kaydet'}</Text>
              </TouchableOpacity>
              {duzenlenenTalepId && (
                <TouchableOpacity style={[styles.saveBtn, {backgroundColor: '#374151', marginTop: 8}]} onPress={() => { setDuzenlenenTalepId(null); setTMusteri(''); setTMaxFiyat(''); setTAranan(''); setTKonum(''); }}>
                  <Text style={styles.saveBtnText}>İptal</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={dynStyles.filterCard}>
              <TextInput 
                style={dynStyles.searchInput} 
                placeholder="🔍 Talep ara (Müşteri, bölge)..." 
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={tSearchQuery}
                onChangeText={setTSearchQuery}
              />
              <Text style={dynStyles.filterLabelHeader}>Kategoriye Göre Filtrele:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {['TÜMÜ', 'Konut', 'Arsa', 'İş Yeri', 'Zeytinlik/Tarla'].map(cat => (
                  <TouchableOpacity key={cat} onPress={() => setTSelectedCategory(cat)} style={[styles.chip, tSelectedCategory === cat && styles.chipActive]}>
                    <Text style={[styles.chipText, tSelectedCategory === cat && styles.chipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={dynStyles.filterLabelHeader}>İşlem Tipine Göre:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {['TÜMÜ', 'Satılık', 'Kiralık', 'Kat Karşılığı'].map(st => (
                  <TouchableOpacity key={st} onPress={() => setTSelectedStatus(st)} style={[styles.subChip, tSelectedStatus === st && styles.subChipActive]}>
                    <Text style={[styles.subChipText, tSelectedStatus === st && styles.subChipTextActive]}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={dynStyles.sectionTitle}>Talepler ({filtrelenmisTalepler.length} / {talepler.length})</Text>
            {filtrelenmisTalepler.length === 0 ? (
              <View style={dynStyles.emptyCard}><Text style={dynStyles.emptyText}>Kayıtlı talep bulunmuyor.</Text></View>
            ) : (
              filtrelenmisTalepler.map(talep => (
                <View key={talep.id} style={dynStyles.listItem}>
                  <View style={{flex: 1}}>
                    <View style={styles.listHeader}>
                      <Text style={dynStyles.listTitle}>{talep.musteri}</Text>
                      <View style={{flexDirection: 'row', gap: 4}}>
                        <Text style={styles.listBadge}>{talep.category || 'Konut'}</Text>
                        <Text style={[styles.listBadge, {backgroundColor: '#6A1B29'}]}>{talep.tip}</Text>
                      </View>
                    </View>
                    <Text style={dynStyles.listSub}>🔍 {talep.aranan} | 📍 {talep.konum}</Text>
                    <Text style={dynStyles.listDesc}>Max Bütçe: {talep.maxFiyat.toLocaleString()} TL</Text>
                  </View>
                  <View style={styles.actionColumn}>
                    <TouchableOpacity style={styles.iconBtnEdit} onPress={() => talepDuzenleBaslat(talep)}><Text style={styles.iconText}>✏️</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtnDel} onPress={() => talepSil(talep.id)}><Text style={styles.iconText}>🗑️</Text></TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* EŞLEŞMELER SEKMESİ */}
        {activeTab === 'eslesme' && (
          <View>
            <Text style={dynStyles.sectionTitle}>Nokta Atışı Eşleşmeler</Text>
            {bildirimler.length === 0 ? (
              <View style={dynStyles.emptyCard}>
                <Text style={dynStyles.emptyText}>Aktif eşleşme bulunmuyor.</Text>
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

        {/* KASA SEKMESİ */}
        {activeTab === 'kasa' && (
          <View>
            <View style={styles.bakiyeCard}>
              <Text style={styles.bakiyeLabel}>Toplam Net Varlık</Text>
              <Text style={styles.bakiyeValue}>{(toplamVarlik - toplamKrediBorcu).toLocaleString()} TL</Text>
              <Text style={styles.bakiyeSubText}>Brüt: {toplamVarlik.toLocaleString()} TL | Kredi Borçları: -{toplamKrediBorcu.toLocaleString()} TL</Text>
            </View>

            <View style={dynStyles.formCard}>
              <Text style={dynStyles.cardTitle}>Finansal Durum Özeti</Text>
              <View style={styles.summaryCardRow}>
                <View style={styles.summaryCardGelir}>
                  <Text style={styles.summaryLabel}>Toplam Gelir</Text>
                  <Text style={styles.summaryVal}>+{toplamGelir.toLocaleString()} TL</Text>
                </View>
                <View style={styles.summaryCardGider}>
                  <Text style={styles.summaryLabel}>Toplam Gider</Text>
                  <Text style={styles.summaryVal}>-{toplamGider.toLocaleString()} TL</Text>
                </View>
              </View>
            </View>

            <Text style={dynStyles.sectionTitle}>💳 Banka Kredileri & Taksit Takibi</Text>
            {krediler.length === 0 ? (
              <View style={dynStyles.emptyCard}><Text style={dynStyles.emptyText}>Kayıtlı kredi borcu bulunmuyor.</Text></View>
            ) : (
              krediler.map(k => (
                <View key={k.id} style={dynStyles.creditItem}>
                  <View style={{flex: 1}}>
                    <Text style={dynStyles.listTitle}>{k.banka}</Text>
                    <Text style={styles.creditAmount}>Kalan Borç: {k.tutar.toLocaleString()} TL</Text>
                    <Text style={styles.creditDate}>📅 Ödeme Günü: Her ayın {k.odemeGunu}. günü | Taksit: {k.guncelTaksit} / {k.toplamTaksit}</Text>
                  </View>
                  <TouchableOpacity style={styles.erkenKapatBtn} onPress={() => krediErkenKapat(k.id)}>
                    <Text style={styles.erkenKapatText}>Erken Kapat</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}

            <View style={dynStyles.formCard}>
              <Text style={dynStyles.cardTitle}>Yeni Kredi / Borç Ekle</Text>
              <TextInput style={dynStyles.input} placeholder="Banka Adı / Kredi Türü" placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'} value={krediBanka} onChangeText={setKrediBanka} />
              <TextInput style={dynStyles.input} placeholder="Kalan Toplam Borç (TL)" placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'} keyboardType="default" value={krediTutar} onChangeText={setKrediTutar} />
              <TextInput style={dynStyles.input} placeholder="Ödeme Günü (Örn: 15)" placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'} keyboardType="default" value={krediOdemeGunu} onChangeText={setKrediOdemeGunu} />
              <View style={{flexDirection: 'row', gap: 10}}>
                <TextInput style={[dynStyles.input, {flex: 1}]} placeholder="Kaçıncı Taksit (Örn: 5)" placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'} keyboardType="default" value={krediGuncelTaksit} onChangeText={setKrediGuncelTaksit} />
                <TextInput style={[dynStyles.input, {flex: 1}]} placeholder="Toplam Taksit (Örn: 36)" placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'} keyboardType="default" value={krediToplamTaksit} onChangeText={setKrediToplamTaksit} />
              </View>
              <TouchableOpacity style={styles.saveBtn} onPress={krediKaydet}>
                <Text style={styles.saveBtnText}>Krediyi Kaydet</Text>
              </TouchableOpacity>
            </View>

            <Text style={dynStyles.sectionTitle}>Kasa ve Banka Hesapları</Text>
            {hesaplar.map(h => (
              <View key={h.id} style={dynStyles.listItem}>
                <View>
                  <Text style={dynStyles.listTitle}>{h.ad}</Text>
                  <Text style={[dynStyles.listSub, h.bakiye < 0 && { color: '#f87171' }]}>{h.bakiye.toLocaleString()} TL</Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.iconBtnEdit} onPress={() => hesapDuzenleBaslat(h)}><Text style={styles.iconText}>✏️</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtnDel} onPress={() => hesapSil(h.id)}><Text style={styles.iconText}>🗑️</Text></TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={dynStyles.formCard}>
              <Text style={dynStyles.cardTitle}>{duzenlenenHesapId ? 'Hesap Düzenle' : 'Yeni Hesap Ekle'}</Text>
              <TextInput style={dynStyles.input} placeholder="Hesap Adı" placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'} value={yeniHesapAd} onChangeText={setYeniHesapAd} />
              <TextInput style={dynStyles.input} placeholder="Başlangıç Bakiyesi (Örn: -500 veya 1000)" placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'} keyboardType="default" value={yeniHesapBakiye} onChangeText={setYeniHesapBakiye} />
              <TouchableOpacity style={styles.saveBtn} onPress={hesapKaydet}>
                <Text style={styles.saveBtnText}>{duzenlenenHesapId ? 'Güncelle' : 'Kaydet'}</Text>
              </TouchableOpacity>
            </View>

            <View style={dynStyles.formCard}>
              <Text style={dynStyles.cardTitle}>Gelir / Gider Ekle</Text>
              <View style={styles.tipRow}>
                <TouchableOpacity style={[styles.tipBtn, islemTipi === 'gelir' && dynStyles.gelirActive]} onPress={() => setIslemTipi('gelir')}><Text style={styles.tipText}>Gelir</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.tipBtn, islemTipi === 'gider' && dynStyles.giderActive]} onPress={() => setIslemTipi('gider')}><Text style={styles.tipText}>Gider</Text></TouchableOpacity>
              </View>
              <TextInput style={dynStyles.input} placeholder="Tutar (TL)" placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'} keyboardType="default" value={tutar} onChangeText={setTutar} />
              <TextInput style={dynStyles.input} placeholder="Açıklama" placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'} value={aciklama} onChangeText={setAciklama} />
              <TouchableOpacity style={styles.saveBtn} onPress={islemKaydet}>
                <Text style={styles.saveBtnText}>Kaydet</Text>
              </TouchableOpacity>
            </View>

            <Text style={dynStyles.sectionTitle}>Finansal Hareketler</Text>
            {islemGecmisi.length === 0 ? (
              <View style={dynStyles.emptyCard}><Text style={dynStyles.emptyText}>Henüz finansal hareket yok.</Text></View>
            ) : (
              islemGecmisi.map(item => (
                <View key={item.id} style={dynStyles.historyItem}>
                  <View>
                    <Text style={dynStyles.historyDesc}>{item.aciklama}</Text>
                    <Text style={dynStyles.historyDate}>{item.hesap} • {item.tarih}</Text>
                  </View>
                  <View style={{alignItems: 'flex-end'}}>
                    <Text style={[styles.historyAmount, item.tip === 'gelir' ? styles.textGelir : styles.textGider]}>
                      {item.tip === 'gelir' ? '+' : '-'}{item.tutar.toLocaleString()} TL
                    </Text>
                    <TouchableOpacity onPress={() => islemSil(item.id, item.tip, item.tutar, item.hesap)}>
                      <Text style={{color: '#f87171', fontSize: 12, marginTop: 4}}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* AYARLAR SEKMESİ (Güvenlik, Şifre ve Tema) */}
        {activeTab === 'ayarlar' && (
          <View>
            <Text style={dynStyles.sectionTitle}>⚙️ Uygulama Ayarları</Text>
            
            <View style={dynStyles.formCard}>
              <Text style={dynStyles.cardTitle}>🎨 Görünüm & Tema</Text>
              <Text style={dynStyles.labelSub}>Uygulama Tema Modu:</Text>
              <View style={styles.tipRow}>
                <TouchableOpacity style={[styles.tipBtn, isDark && dynStyles.gelirActive]} onPress={() => setTheme('dark')}>
                  <Text style={styles.tipText}>Karanlık Mod 🌙</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tipBtn, !isDark && dynStyles.gelirActive]} onPress={() => setTheme('light')}>
                  <Text style={styles.tipText}>Aydınlık Mod ☀️</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={dynStyles.formCard}>
              <Text style={dynStyles.cardTitle}>🔒 Güvenlik & Şifre Yönetimi</Text>
              {islemModu === 'pinBelirle' ? (
                <View>
                  <TextInput
                    style={dynStyles.input}
                    placeholder="Yeni 4 Haneli PIN Şifre"
                    placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                    secureTextEntry
                    keyboardType="numeric"
                    value={yeniPinInput}
                    onChangeText={setYeniPinInput}
                  />
                  <TouchableOpacity style={styles.saveBtn} onPress={yeniPinKaydet}>
                    <Text style={styles.saveBtnText}>Yeni Şifreyi Kaydet</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.saveBtn, {backgroundColor: '#374151', marginTop: 8}]} onPress={() => setIslemModu('giris')}>
                    <Text style={styles.saveBtnText}>İptal</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={[styles.saveBtn, {backgroundColor: '#6A1B29'}]} onPress={() => setIslemModu('pinBelirle')}>
                  <Text style={styles.saveBtnText}>Uygulama Şifresini (PIN) Değiştir</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View style={dynStyles.footerContainer}>
          <Text style={dynStyles.footerText}>TOCO Ticaret Ofisi tarafından geliştirilmiştir</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Tema Bazlı Dinamik Stil Üreteci
const getDynamicStyles = (isDark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? '#121214' : '#f3f4f6' },
  lockContainer: { flex: 1, backgroundColor: isDark ? '#121214' : '#f3f4f6', justifyContent: 'center', alignItems: 'center', padding: 20 },
  lockCard: { width: '100%', maxWidth: 360, backgroundColor: isDark ? '#18181b' : '#ffffff', padding: 24, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: isDark ? '#27272a' : '#e5e7eb' },
  lockSubText: { color: isDark ? '#a1a1aa' : '#4b5563', fontSize: 13, marginVertical: 15 },
  biometricBtn: { backgroundColor: isDark ? '#27272a' : '#e5e7eb', width: '100%', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: isDark ? '#3f3f46' : '#d1d5db' },
  biometricText: { color: isDark ? '#ffffff' : '#1f2937', fontWeight: 'bold', fontSize: 14 },
  line: { flex: 1, height: 1, backgroundColor: isDark ? '#27272a' : '#e5e7eb' },
  orText: { color: isDark ? '#71717a' : '#9ca3af', fontSize: 11, marginHorizontal: 10, fontWeight: 'bold' },
  lockInput: { backgroundColor: isDark ? '#121214' : '#f9fafb', color: isDark ? '#ffffff' : '#111827', width: '100%', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: isDark ? '#27272a' : '#d1d5db', textAlign: 'center', fontSize: 16 },
  header: { backgroundColor: isDark ? '#18181b' : '#ffffff', padding: 14, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: isDark ? '#27272a' : '#e5e7eb' },
  tabContainer: { flexDirection: 'row', backgroundColor: isDark ? '#18181b' : '#ffffff', borderBottomWidth: 1, borderBottomColor: isDark ? '#27272a' : '#e5e7eb' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#6A1B29', backgroundColor: isDark ? '#27272a' : '#e5e7eb' },
  tabText: { color: isDark ? '#a1a1aa' : '#4b5563', fontSize: 11, fontWeight: '600' },
  activeTabText: { color: isDark ? '#ffffff' : '#111827', fontWeight: 'bold' },
  formCard: { backgroundColor: isDark ? '#18181b' : '#ffffff', padding: 16, borderRadius: 14, marginBottom: 15, borderWidth: 1, borderColor: isDark ? '#27272a' : '#e5e7eb' },
  filterCard: { backgroundColor: isDark ? '#1f1f23' : '#ffffff', padding: 14, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: isDark ? '#27272a' : '#e5e7eb' },
  searchInput: { backgroundColor: isDark ? '#121214' : '#f9fafb', color: isDark ? '#ffffff' : '#111827', padding: 11, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: isDark ? '#27272a' : '#d1d5db', fontSize: 13 },
  cardTitle: { color: isDark ? '#ffffff' : '#111827', fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  labelSub: { color: isDark ? '#d4d4d8' : '#374151', fontSize: 12, marginBottom: 6, fontWeight: '600' },
  filterLabelHeader: { color: isDark ? '#d4d4d8' : '#374151', fontSize: 11, marginBottom: 4, marginTop: 6, fontWeight: '600' },
  gridBtn: { width: '48%', paddingVertical: 10, backgroundColor: isDark ? '#27272a' : '#f3f4f6', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#3f3f46' : '#d1d5db' },
  gridBtnActive: { backgroundColor: '#6A1B29', borderColor: '#8E2437' },
  gridBtnText: { color: isDark ? '#d4d4d8' : '#374151', fontSize: 12, fontWeight: '600' },
  gridBtnTextActive: { color: '#ffffff', fontWeight: 'bold' },
  tipBtn: { flex: 1, padding: 10, backgroundColor: isDark ? '#27272a' : '#f3f4f6', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#3f3f46' : '#d1d5db' },
  gelirActive: { backgroundColor: '#6A1B29', borderColor: '#8E2437' },
  input: { backgroundColor: isDark ? '#121214' : '#f9fafb', color: isDark ? '#ffffff' : '#111827', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: isDark ? '#27272a' : '#d1d5db', fontSize: 14 },
  sectionTitle: { color: isDark ? '#ffffff' : '#111827', fontSize: 15, fontWeight: 'bold', marginVertical: 10 },
  historyItem: { backgroundColor: isDark ? '#18181b' : '#ffffff', padding: 14, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: isDark ? '#27272a' : '#e5e7eb' },
  historyDesc: { color: isDark ? '#ffffff' : '#111827', fontWeight: '600', fontSize: 13 },
  historyDate: { color: isDark ? '#a1a1aa' : '#6b7280', fontSize: 11, marginTop: 2 },
  listItem: { backgroundColor: isDark ? '#18181b' : '#ffffff', padding: 14, borderRadius: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: isDark ? '#27272a' : '#e5e7eb' },
  creditItem: { backgroundColor: isDark ? '#18181b' : '#ffffff', padding: 14, borderRadius: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#7f1d1d' },
  listTitle: { color: isDark ? '#ffffff' : '#111827', fontSize: 14, fontWeight: 'bold' },
  listBadge: { backgroundColor: isDark ? '#27272a' : '#e5e7eb', color: isDark ? '#ffffff' : '#111827', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, fontSize: 10, fontWeight: 'bold' },
  listSub: { color: isDark ? '#d4d4d8' : '#4b5563', fontSize: 12, marginBottom: 2 },
  listDesc: { color: isDark ? '#a1a1aa' : '#6b7280', fontSize: 12, fontStyle: 'italic' },
  emptyCard: { backgroundColor: isDark ? '#18181b' : '#ffffff', padding: 20, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: isDark ? '#27272a' : '#e5e7eb' },
  emptyText: { color: isDark ? '#a1a1aa' : '#6b7280', textAlign: 'center', fontSize: 13 },
  footerContainer: { marginTop: 25, alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: isDark ? '#27272a' : '#e5e7eb' },
  footerText: { color: isDark ? '#71717a' : '#9ca3af', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: isDark ? '#27272a' : '#e5e7eb', marginRight: 6, borderWidth: 1, borderColor: isDark ? '#3f3f46' : '#d1d5db' },
  chipActive: { backgroundColor: '#6A1B29', borderColor: '#8E2437' },
  chipText: { color: isDark ? '#d4d4d8' : '#374151', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#ffffff' },
  subChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: isDark ? '#121214' : '#f3f4f6', marginRight: 6, borderWidth: 1, borderColor: isDark ? '#27272a' : '#d1d5db' },
  subChipActive: { backgroundColor: '#6A1B29', borderColor: '#6A1B29' },
  subChipText: { color: isDark ? '#d4d4d8' : '#374151', fontSize: 11 },
  subChipTextActive: { color: '#ffffff', fontWeight: 'bold' }
});

const styles = StyleSheet.create({
  titleBox: { backgroundColor: '#6A1B29', paddingVertical: 8, paddingHorizontal: 25, borderRadius: 10, borderWidth: 1.5, borderColor: '#8E2437' },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  content: { padding: 15, paddingBottom: 50 },
  bakiyeCard: { backgroundColor: '#6A1B29', padding: 20, borderRadius: 14, alignItems: 'center', marginBottom: 15 },
  bakiyeLabel: { color: '#f3f4f6', fontSize: 13, fontWeight: '600' },
  bakiyeValue: { color: '#ffffff', fontSize: 26, fontWeight: 'bold', marginTop: 4 },
  bakiyeSubText: { color: '#e5e7eb', fontSize: 11, marginTop: 6 },
  summaryCardRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  summaryCardGelir: { flex: 1, backgroundColor: '#064e3b', padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#047857' },
  summaryCardGider: { flex: 1, backgroundColor: '#7f1d1d', padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#991b1b' },
  summaryLabel: { color: '#e2e8f0', fontSize: 12, fontWeight: '600' },
  summaryVal: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginTop: 4 },
  gridSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tipRow: { flexDirection: 'row', marginBottom: 12, gap: 6 },
  tipText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#6A1B29', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  creditAmount: { color: '#f87171', fontSize: 13, fontWeight: 'bold', marginTop: 2 },
  creditDate: { color: '#fbbf24', fontSize: 12, marginTop: 2, fontWeight: '600' },
  erkenKapatBtn: { backgroundColor: '#047857', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  erkenKapatText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  actionColumn: { justifyContent: 'center', alignItems: 'flex-end', marginLeft: 10 },
  actionRow: { flexDirection: 'row', gap: 6 },
  iconBtnEdit: { backgroundColor: '#27272a', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, marginBottom: 4, alignItems: 'center', borderWidth: 1, borderColor: '#3f3f46' },
  iconBtnDel: { backgroundColor: '#7f1d1d', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
  iconText: { fontSize: 14 },
  alertCard: { backgroundColor: '#065f46', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#047857' },
  alertText: { color: '#d1fae5', fontSize: 13, fontWeight: '600', lineHeight: 18 },
  chipRow: { flexDirection: 'row', marginBottom: 8 }
});
