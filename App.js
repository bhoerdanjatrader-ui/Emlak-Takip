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

const normalizeText = (text) => {
  if (!text) return '';
  return text.toString().toLocaleLowerCase('tr-TR').trim();
};

export default function App() {
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

  // Veri Yükleme (AsyncStorage - Kesin Koruma)
  useEffect(() => {
    const verileriYukle = async () => {
      try {
        const kayitliHesaplar = await AsyncStorage.getItem('@toco_hesaplar');
        const kayitliIslemler = await AsyncStorage.getItem('@toco_islemler');
        const kayitliPortfoyler = await AsyncStorage.getItem('@toco_portfoyler');
        const kayitliTalepler = await AsyncStorage.getItem('@toco_talepler');
        const kayitliKrediler = await AsyncStorage.getItem('@toco_krediler');

        if (kayitliHesaplar) setHesaplar(JSON.parse(kayitliHesaplar));
        if (kayitliIslemler) setIslemGecmisi(JSON.parse(kayitliIslemler));
        if (kayitliPortfoyler) setPortfoyler(JSON.parse(kayitliPortfoyler));
        if (kayitliTalepler) setTalepler(JSON.parse(kayitliTalepler));
        if (kayitliKrediler) setKrediler(JSON.parse(kayitliKrediler));
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0f19" />
      
      <View style={styles.header}>
        <View style={styles.titleBox}>
          <Text style={styles.headerTitle}>PATRON</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'portfoy' && styles.activeTab]} onPress={() => setActiveTab('portfoy')}>
          <Text style={[styles.tabText, activeTab === 'portfoy' && styles.activeTabText]}>Portföy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'talepler' && styles.activeTab]} onPress={() => setActiveTab('talepler')}>
          <Text style={[styles.tabText, activeTab === 'talepler' && styles.activeTabText]}>Talepler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'eslesme' && styles.activeTab]} onPress={() => setActiveTab('eslesme')}>
          <Text style={[styles.tabText, activeTab === 'eslesme' && styles.activeTabText]}>
            Eşleşmeler {bildirimler.length > 0 ? `(${bildirimler.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'kasa' && styles.activeTab]} onPress={() => setActiveTab('kasa')}>
          <Text style={[styles.tabText, activeTab === 'kasa' && styles.activeTabText]}>Kasa & Banka</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* PORTFÖY SEKMESİ */}
        {activeTab === 'portfoy' && (
          <View>
            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>{duzenlenenPortfoyId ? 'Portföy Düzenle' : 'Portföy Ekle'}</Text>
              <TextInput style={styles.input} placeholder="Portföy Başlığı" placeholderTextColor="#9ca3af" value={pBaslik} onChangeText={setPBaslik} />
              
              <Text style={styles.labelSub}>Kategori:</Text>
              <View style={styles.gridSelector}>
                {['Konut', 'Arsa', 'İş Yeri', 'Zeytinlik/Tarla'].map(cat => (
                  <TouchableOpacity key={cat} onPress={() => setPCategory(cat)} style={[styles.gridBtn, pCategory === cat && styles.gridBtnActive]}>
                    <Text style={[styles.gridBtnText, pCategory === cat && styles.gridBtnTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.labelSub}>İşlem Tipi:</Text>
              <View style={styles.tipRow}>
                {['Satılık', 'Kiralık', 'Kat Karşılığı'].map(st => (
                  <TouchableOpacity key={st} style={[styles.tipBtn, pTip === st && styles.gelirActive]} onPress={() => setPTip(st)}>
                    <Text style={styles.tipText}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput style={styles.input} placeholder="Fiyat (TL)" placeholderTextColor="#9ca3af" keyboardType="default" value={pFiyat} onChangeText={setPFiyat} />
              <TextInput style={styles.input} placeholder="Konum / Bölge" placeholderTextColor="#9ca3af" value={pKonum} onChangeText={setPKonum} />
              <TextInput style={[styles.input, { height: 70 }]} placeholder="Açıklama" placeholderTextColor="#9ca3af" multiline value={pAciklama} onChangeText={setPAciklama} />
              
              <TouchableOpacity style={styles.saveBtn} onPress={portfoyKaydet}>
                <Text style={styles.saveBtnText}>{duzenlenenPortfoyId ? 'Güncelle' : 'Kaydet'}</Text>
              </TouchableOpacity>
              {duzenlenenPortfoyId && (
                <TouchableOpacity style={[styles.saveBtn, {backgroundColor: '#374151', marginTop: 8}]} onPress={() => { setDuzenlenenPortfoyId(null); setPBaslik(''); setPFiyat(''); setPKonum(''); setPAciklama(''); }}>
                  <Text style={styles.saveBtnText}>İptal</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.filterCard}>
              <TextInput 
                style={styles.searchInput} 
                placeholder="🔍 Portföy ara (Başlık, bölge)..." 
                placeholderTextColor="#9ca3af"
                value={pSearchQuery}
                onChangeText={setPSearchQuery}
              />
              <Text style={styles.filterLabelHeader}>Kategoriye Göre Filtrele:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {['TÜMÜ', 'Konut', 'Arsa', 'İş Yeri', 'Zeytinlik/Tarla'].map(cat => (
                  <TouchableOpacity key={cat} onPress={() => setPSelectedCategory(cat)} style={[styles.chip, pSelectedCategory === cat && styles.chipActive]}>
                    <Text style={[styles.chipText, pSelectedCategory === cat && styles.chipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.filterLabelHeader}>İşlem Tipine Göre:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {['TÜMÜ', 'Satılık', 'Kiralık', 'Kat Karşılığı'].map(st => (
                  <TouchableOpacity key={st} onPress={() => setPSelectedStatus(st)} style={[styles.subChip, pSelectedStatus === st && styles.subChipActive]}>
                    <Text style={[styles.subChipText, pSelectedStatus === st && styles.subChipTextActive]}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.sectionTitle}>Portföyler ({filtrelenmisPortfoyler.length} / {portfoyler.length})</Text>
            {filtrelenmisPortfoyler.length === 0 ? (
              <View style={styles.emptyCard}><Text style={styles.emptyText}>Kayıtlı portföy bulunamadı.</Text></View>
            ) : (
              filtrelenmisPortfoyler.map(p => (
                <View key={p.id} style={styles.listItem}>
                  <View style={{flex: 1}}>
                    <View style={styles.listHeader}>
                      <Text style={styles.listTitle}>{p.baslik}</Text>
                      <View style={{flexDirection: 'row', gap: 4}}>
                        <Text style={styles.listBadge}>{p.category || 'Konut'}</Text>
                        <Text style={[styles.listBadge, {backgroundColor: '#6A1B29'}]}>{p.tip}</Text>
                      </View>
                    </View>
                    <Text style={styles.listSub}>📍 {p.konum} | 💰 {p.fiyat.toLocaleString()} TL</Text>
                    {p.aciklama ? <Text style={styles.listDesc}>{p.aciklama}</Text> : null}
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
            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>{duzenlenenTalepId ? 'Talep Düzenle' : 'Talep Ekle'}</Text>
              <TextInput style={styles.input} placeholder="Müşteri Adı" placeholderTextColor="#9ca3af" value={tMusteri} onChangeText={setTMusteri} />
              
              <Text style={styles.labelSub}>Kategori:</Text>
              <View style={styles.gridSelector}>
                {['Konut', 'Arsa', 'İş Yeri', 'Zeytinlik/Tarla'].map(cat => (
                  <TouchableOpacity key={cat} onPress={() => setTCategory(cat)} style={[styles.gridBtn, tCategory === cat && styles.gridBtnActive]}>
                    <Text style={[styles.gridBtnText, tCategory === cat && styles.gridBtnTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.labelSub}>İşlem Tipi:</Text>
              <View style={styles.tipRow}>
                {['Satılık', 'Kiralık', 'Kat Karşılığı'].map(st => (
                  <TouchableOpacity key={st} style={[styles.tipBtn, tTip === st && styles.gelirActive]} onPress={() => setTTip(st)}>
                    <Text style={styles.tipText}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput style={styles.input} placeholder="Max Bütçe (TL)" placeholderTextColor="#9ca3af" keyboardType="default" value={tMaxFiyat} onChangeText={setTMaxFiyat} />
              <TextInput style={styles.input} placeholder="Aranan Gayrimenkul" placeholderTextColor="#9ca3af" value={tAranan} onChangeText={setTAranan} />
              <TextInput style={styles.input} placeholder="Bölge" placeholderTextColor="#9ca3af" value={tKonum} onChangeText={setTKonum} />

              <TouchableOpacity style={styles.saveBtn} onPress={talepKaydet}>
                <Text style={styles.saveBtnText}>{duzenlenenTalepId ? 'Güncelle' : 'Kaydet'}</Text>
              </TouchableOpacity>
              {duzenlenenTalepId && (
                <TouchableOpacity style={[styles.saveBtn, {backgroundColor: '#374151', marginTop: 8}]} onPress={() => { setDuzenlenenTalepId(null); setTMusteri(''); setTMaxFiyat(''); setTAranan(''); setTKonum(''); }}>
                  <Text style={styles.saveBtnText}>İptal</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.filterCard}>
              <TextInput 
                style={styles.searchInput} 
                placeholder="🔍 Talep ara (Müşteri, bölge)..." 
                placeholderTextColor="#9ca3af"
                value={tSearchQuery}
                onChangeText={setTSearchQuery}
              />
              <Text style={styles.filterLabelHeader}>Kategoriye Göre Filtrele:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {['TÜMÜ', 'Konut', 'Arsa', 'İş Yeri', 'Zeytinlik/Tarla'].map(cat => (
                  <TouchableOpacity key={cat} onPress={() => setTSelectedCategory(cat)} style={[styles.chip, tSelectedCategory === cat && styles.chipActive]}>
                    <Text style={[styles.chipText, tSelectedCategory === cat && styles.chipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.filterLabelHeader}>İşlem Tipine Göre:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {['TÜMÜ', 'Satılık', 'Kiralık', 'Kat Karşılığı'].map(st => (
                  <TouchableOpacity key={st} onPress={() => setTSelectedStatus(st)} style={[styles.subChip, tSelectedStatus === st && styles.subChipActive]}>
                    <Text style={[styles.subChipText, tSelectedStatus === st && styles.subChipTextActive]}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.sectionTitle}>Talepler ({filtrelenmisTalepler.length} / {talepler.length})</Text>
            {filtrelenmisTalepler.length === 0 ? (
              <View style={styles.emptyCard}><Text style={styles.emptyText}>Kayıtlı talep bulunmuyor.</Text></View>
            ) : (
              filtrelenmisTalepler.map(talep => (
                <View key={talep.id} style={styles.listItem}>
                  <View style={{flex: 1}}>
                    <View style={styles.listHeader}>
                      <Text style={styles.listTitle}>{talep.musteri}</Text>
                      <View style={{flexDirection: 'row', gap: 4}}>
                        <Text style={styles.listBadge}>{talep.category || 'Konut'}</Text>
                        <Text style={[styles.listBadge, {backgroundColor: '#6A1B29'}]}>{talep.tip}</Text>
                      </View>
                    </View>
                    <Text style={styles.listSub}>🔍 {talep.aranan} | 📍 {talep.konum}</Text>
                    <Text style={styles.listDesc}>Max Bütçe: {talep.maxFiyat.toLocaleString()} TL</Text>
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
            <Text style={styles.sectionTitle}>Nokta Atışı Eşleşmeler</Text>
            {bildirimler.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Aktif eşleşme bulunmuyor.</Text>
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

        {/* KASA & BANKA SEKMESİ (EN SON SEKME) */}
        {activeTab === 'kasa' && (
          <View>
            <View style={styles.bakiyeCard}>
              <Text style={styles.bakiyeLabel}>Toplam Net Varlık</Text>
              <Text style={styles.bakiyeValue}>{(toplamVarlik - toplamKrediBorcu).toLocaleString()} TL</Text>
              <Text style={styles.bakiyeSubText}>Brüt: {toplamVarlik.toLocaleString()} TL | Kredi Borçları: -{toplamKrediBorcu.toLocaleString()} TL</Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>Finansal Durum Özeti</Text>
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

            {/* BANKA KREDİLERİ & TAKSİT VE ERKEN KAPATMA */}
            <Text style={styles.sectionTitle}>💳 Banka Kredileri & Taksit Takibi</Text>
            {krediler.length === 0 ? (
              <View style={styles.emptyCard}><Text style={styles.emptyText}>Kayıtlı kredi borcu bulunmuyor.</Text></View>
            ) : (
              krediler.map(k => (
                <View key={k.id} style={styles.creditItem}>
                  <View style={{flex: 1}}>
                    <Text style={styles.listTitle}>{k.banka}</Text>
                    <Text style={styles.creditAmount}>Kalan Borç: {k.tutar.toLocaleString()} TL</Text>
                    <Text style={styles.creditDate}>📅 Ödeme Günü: Her ayın {k.odemeGunu}. günü | Taksit: {k.guncelTaksit} / {k.toplamTaksit}</Text>
                  </View>
                  <TouchableOpacity style={styles.erkenKapatBtn} onPress={() => krediErkenKapat(k.id)}>
                    <Text style={styles.erkenKapatText}>Erken Kapat</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}

            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>Yeni Kredi / Borç Ekle</Text>
              <TextInput style={styles.input} placeholder="Banka Adı / Kredi Türü" placeholderTextColor="#9ca3af" value={krediBanka} onChangeText={setKrediBanka} />
              <TextInput style={styles.input} placeholder="Kalan Toplam Borç (TL)" placeholderTextColor="#9ca3af" keyboardType="default" value={krediTutar} onChangeText={setKrediTutar} />
              <TextInput style={styles.input} placeholder="Ödeme Günü (Örn: 15)" placeholderTextColor="#9ca3af" keyboardType="default" value={krediOdemeGunu} onChangeText={setKrediOdemeGunu} />
              <View style={{flexDirection: 'row', gap: 10}}>
                <TextInput style={[styles.input, {flex: 1}]} placeholder="Kaçıncı Taksit (Örn: 5)" placeholderTextColor="#9ca3af" keyboardType="default" value={krediGuncelTaksit} onChangeText={setKrediGuncelTaksit} />
                <TextInput style={[styles.input, {flex: 1}]} placeholder="Toplam Taksit (Örn: 36)" placeholderTextColor="#9ca3af" keyboardType="default" value={krediToplamTaksit} onChangeText={setKrediToplamTaksit} />
              </View>
              <TouchableOpacity style={styles.saveBtn} onPress={krediKaydet}>
                <Text style={styles.saveBtnText}>Krediyi Kaydet</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Kasa ve Banka Hesapları</Text>
            {hesaplar.map(h => (
              <View key={h.id} style={styles.listItem}>
                <View>
                  <Text style={styles.listTitle}>{h.ad}</Text>
                  <Text style={[styles.listSub, h.bakiye < 0 && { color: '#f87171' }]}>{h.bakiye.toLocaleString()} TL</Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.iconBtnEdit} onPress={() => hesapDuzenleBaslat(h)}><Text style={styles.iconText}>✏️</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtnDel} onPress={() => hesapSil(h.id)}><Text style={styles.iconText}>🗑️</Text></TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>{duzenlenenHesapId ? 'Hesap Düzenle' : 'Yeni Hesap Ekle'}</Text>
              <TextInput style={styles.input} placeholder="Hesap Adı" placeholderTextColor="#9ca3af" value={yeniHesapAd} onChangeText={setYeniHesapAd} />
              <TextInput style={styles.input} placeholder="Başlangıç Bakiyesi (Örn: -500 veya 1000)" placeholderTextColor="#9ca3af" keyboardType="default" value={yeniHesapBakiye} onChangeText={setYeniHesapBakiye} />
              <TouchableOpacity style={styles.saveBtn} onPress={hesapKaydet}>
                <Text style={styles.saveBtnText}>{duzenlenenHesapId ? 'Güncelle' : 'Kaydet'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>Gelir / Gider Ekle</Text>
              <View style={styles.tipRow}>
                <TouchableOpacity style={[styles.tipBtn, islemTipi === 'gelir' && styles.gelirActive]} onPress={() => setIslemTipi('gelir')}><Text style={styles.tipText}>Gelir</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.tipBtn, islemTipi === 'gider' && styles.giderActive]} onPress={() => setIslemTipi('gider')}><Text style={styles.tipText}>Gider</Text></TouchableOpacity>
              </View>
              <TextInput style={styles.input} placeholder="Tutar (TL)" placeholderTextColor="#9ca3af" keyboardType="default" value={tutar} onChangeText={setTutar} />
              <TextInput style={styles.input} placeholder="Açıklama" placeholderTextColor="#9ca3af" value={aciklama} onChangeText={setAciklama} />
              <TouchableOpacity style={styles.saveBtn} onPress={islemKaydet}>
                <Text style={styles.saveBtnText}>Kaydet</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Finansal Hareketler</Text>
            {islemGecmisi.length === 0 ? (
              <View style={styles.emptyCard}><Text style={styles.emptyText}>Henüz finansal hareket yok.</Text></View>
            ) : (
              islemGecmisi.map(item => (
                <View key={item.id} style={styles.historyItem}>
                  <View>
                    <Text style={styles.historyDesc}>{item.aciklama}</Text>
                    <Text style={styles.historyDate}>{item.hesap} • {item.tarih}</Text>
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

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>TOCO Ticaret Ofisi tarafından geliştirilmiştir</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121214', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { backgroundColor: '#18181b', padding: 14, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#27272a' },
  titleBox: { backgroundColor: '#6A1B29', paddingVertical: 8, paddingHorizontal: 25, borderRadius: 10, borderWidth: 1.5, borderColor: '#8E2437' },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#18181b', borderBottomWidth: 1, borderBottomColor: '#27272a' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#ffffff', backgroundColor: '#27272a' },
  tabText: { color: '#a1a1aa', fontSize: 11, fontWeight: '600' },
  activeTabText: { color: '#ffffff', fontWeight: 'bold' },
  content: { padding: 15, paddingBottom: 50 },
  bakiyeCard: { backgroundColor: '#6A1B29', padding: 20, borderRadius: 14, alignItems: 'center', marginBottom: 15 },
  bakiyeLabel: { color: '#f3f4f6', fontSize: 13, fontWeight: '600' },
  bakiyeValue: { color: '#ffffff', fontSize: 26, fontWeight: 'bold', marginTop: 4 },
  bakiyeSubText: { color: '#e5e7eb', fontSize: 11, marginTop: 6 },
  formCard: { backgroundColor: '#18181b', padding: 16, borderRadius: 14, marginBottom: 15, borderWidth: 1, borderColor: '#27272a' },
  filterCard: { backgroundColor: '#1f1f23', padding: 14, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#27272a' },
  searchInput: { backgroundColor: '#121214', color: '#ffffff', padding: 11, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#27272a', fontSize: 13 },
  cardTitle: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  labelSub: { color: '#d4d4d8', fontSize: 12, marginBottom: 6, fontWeight: '600' },
  filterLabelHeader: { color: '#d4d4d8', fontSize: 11, marginBottom: 4, marginTop: 6, fontWeight: '600' },
  summaryCardRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  summaryCardGelir: { flex: 1, backgroundColor: '#064e3b', padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#047857' },
  summaryCardGider: { flex: 1, backgroundColor: '#7f1d1d', padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#991b1b' },
  summaryLabel: { color: '#e2e8f0', fontSize: 12, fontWeight: '600' },
  summaryVal: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginTop: 4 },
  gridSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  gridBtn: { width: '48%', paddingVertical: 10, backgroundColor: '#27272a', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#3f3f46' },
  gridBtnActive: { backgroundColor: '#6A1B29', borderColor: '#8E2437' },
  gridBtnText: { color: '#d4d4d8', fontSize: 12, fontWeight: '600' },
  gridBtnTextActive: { color: '#ffffff', fontWeight: 'bold' },
  tipRow: { flexDirection: 'row', marginBottom: 12, gap: 6 },
  tipBtn: { flex: 1, padding: 10, backgroundColor: '#27272a', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#3f3f46' },
  gelirActive: { backgroundColor: '#6A1B29', borderColor: '#8E2437' },
  giderActive: { backgroundColor: '#6A1B29', borderColor: '#8E2437' },
  tipText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  input: { backgroundColor: '#121214', color: '#ffffff', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#27272a', fontSize: 14 },
  saveBtn: { backgroundColor: '#6A1B29', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  sectionTitle: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginVertical: 10 },
  historyItem: { backgroundColor: '#18181b', padding: 14, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#27272a' },
  historyDesc: { color: '#ffffff', fontWeight: '600', fontSize: 13 },
  historyDate: { color: '#a1a1aa', fontSize: 11, marginTop: 2 },
  historyAmount: { fontSize: 14, fontWeight: 'bold' },
  textGelir: { color: '#4ade80' },
  textGider: { color: '#f87171' },
  listItem: { backgroundColor: '#18181b', padding: 14, borderRadius: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#27272a' },
  creditItem: { backgroundColor: '#18181b', padding: 14, borderRadius: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#7f1d1d' },
  creditAmount: { color: '#f87171', fontSize: 13, fontWeight: 'bold', marginTop: 2 },
  creditDate: { color: '#fbbf24', fontSize: 12, marginTop: 2, fontWeight: '600' },
  erkenKapatBtn: { backgroundColor: '#047857', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  erkenKapatText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  listTitle: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  listBadge: { backgroundColor: '#27272a', color: '#ffffff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, fontSize: 10, fontWeight: 'bold' },
  listSub: { color: '#d4d4d8', fontSize: 12, marginBottom: 2 },
  listDesc: { color: '#a1a1aa', fontSize: 12, fontStyle: 'italic' },
  actionColumn: { justifyContent: 'center', alignItems: 'flex-end', marginLeft: 10 },
  actionRow: { flexDirection: 'row', gap: 6 },
  iconBtnEdit: { backgroundColor: '#27272a', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, marginBottom: 4, alignItems: 'center', borderWidth: 1, borderColor: '#3f3f46' },
  iconBtnDel: { backgroundColor: '#7f1d1d', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
  iconText: { fontSize: 14 },
  emptyCard: { backgroundColor: '#18181b', padding: 20, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#27272a' },
  emptyText: { color: '#a1a1aa', textAlign: 'center', fontSize: 13 },
  alertCard: { backgroundColor: '#065f46', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#047857' },
  alertText: { color: '#d1fae5', fontSize: 13, fontWeight: '600', lineHeight: 18 },
  footerContainer: { marginTop: 25, alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#27272a' },
  footerText: { color: '#71717a', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  chipRow: { flexDirection: 'row', marginBottom: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#27272a', marginRight: 6, borderWidth: 1, borderColor: '#3f3f46' },
  chipActive: { backgroundColor: '#6A1B29', borderColor: '#8E2437' },
  chipText: { color: '#d4d4d8', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#ffffff' },
  subChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: '#121214', marginRight: 6, borderWidth: 1, borderColor: '#27272a' },
  subChipActive: { backgroundColor: '#ffffff', borderColor: '#ffffff' },
  subChipText: { color: '#d4d4d8', fontSize: 11 },
  subChipTextActive: { color: '#121214', fontWeight: 'bold' }
});
