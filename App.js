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
  const [lang, setLang] = useState('tr');
  const [activeTab, setActiveTab] = useState('kasa');

  const [hesaplar, setHesaplar] = useState([
    { id: '1', ad: 'Nakit Kasa', bakiye: 0 },
    { id: '2', ad: 'Ana Banka Hesabı', bakiye: 0 }
  ]);
  const [yeniHesapAd, setYeniHesapAd] = useState('');
  const [yeniHesapBakiye, setYeniHesapBakiye] = useState('');
  const [duzenlenenHesapId, setDuzenlenenHesapId] = useState(null);

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

  // Uygulama açıldığında kaydedilmiş verileri yükle
  useEffect(() => {
    const verileriYukle = async () => {
      try {
        const kayitliHesaplar = await AsyncStorage.getItem('@toco_hesaplar');
        const kayitliIslemler = await AsyncStorage.getItem('@toco_islemler');
        const kayitliPortfoyler = await AsyncStorage.getItem('@toco_portfoyler');
        const kayitliTalepler = await AsyncStorage.getItem('@toco_talepler');

        if (kayitliHesaplar) setHesaplar(JSON.parse(kayitliHesaplar));
        if (kayitliIslemler) setIslemGecmisi(JSON.parse(kayitliIslemler));
        if (kayitliPortfoyler) setPortfoyler(JSON.parse(kayitliPortfoyler));
        if (kayitliTalepler) setTalepler(JSON.parse(kayitliTalepler));
      } catch (e) {
        console.log('Veri yüklenirken hata oluştu', e);
      }
    };
    verileriYukle();
  }, []);

  // Veriler değiştiğinde telefona kalıcı olarak kaydet
  useEffect(() => {
    AsyncStorage.setItem('@toco_hesaplar', JSON.stringify(hesaplar));
  }, [hesaplar]);

  useEffect(() => {
    AsyncStorage.setItem('@toco_islemler', JSON.stringify(islemGecmisi));
  }, [islemGecmisi]);

  useEffect(() => {
    AsyncStorage.setItem('@toco_portfoyler', JSON.stringify(portfoyler));
  }, [portfoyler]);

  useEffect(() => {
    AsyncStorage.setItem('@toco_talepler', JSON.stringify(talepler));
  }, [talepler]);

  const t = {
    tr: {
      kasa: 'Kasa & Banka',
      portfoy: 'Portföy',
      talepler: 'Talepler',
      eslesme: 'Eşleşmeler',
      toplamVarlik: 'Toplam Varlıklar',
      hesaplarim: 'Kasa ve Banka Hesapları',
      yeniHesap: 'Yeni Hesap Ekle',
      hesapAdi: 'Hesap Adı',
      ilkBakiye: 'Başlangıç Bakiyesi (TL)',
      ekleKaydet: 'Kaydet',
      guncelle: 'Güncelle',
      iptal: 'İptal',
      yeniIslem: 'Gelir / Gider Ekle',
      tutar: 'Tutar (TL)',
      islemAciklama: 'Açıklama',
      gelir: 'Gelir',
      gider: 'Gider',
      islemGecmisi: 'Finansal Hareketler',
      grafikBaslik: 'Finansal Özet',
      portfoyEkle: 'Portföy Ekle',
      pBaslik: 'Portföy Başlığı',
      pFiyat: 'Fiyat (TL)',
      pKonum: 'Konum / Bölge',
      pAciklama: 'Açıklama',
      talepEkle: 'Talep Ekle',
      tMusteri: 'Müşteri Adı',
      tMaxFiyat: 'Max Bütçe (TL)',
      tAranan: 'Aranan Gayrimenkul',
      tKonum: 'Bölge',
      eslesmeBaslik: 'Nokta Atışı Eşleşmeler',
      bildirimYok: 'Aktif eşleşme bulunmuyor.',
      footerText: 'TOCO Ticaret Ofisi tarafından geliştirilmiştir'
    }
  };

  const text = t[lang];

  const toplamVarlik = hesaplar.reduce((toplam, h) => toplam + h.bakiye, 0);
  const hesaplarBaslangicToplami = hesaplar.reduce((t, h) => t + h.bakiye, 0);
  const islemGelirToplami = islemGecmisi.filter(i => i.tip === 'gelir').reduce((t, i) => t + i.tutar, 0);
  const toplamGelir = Math.max(0, hesaplarBaslangicToplami) + islemGelirToplami;
  const toplamGider = islemGecmisi.filter(i => i.tip === 'gider').reduce((t, i) => t + i.tutar, 0);

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
        <TouchableOpacity style={styles.langBtn} onPress={() => setLang(lang === 'tr' ? 'en' : 'tr')}>
          <Text style={styles.langText}>{lang === 'tr' ? 'EN 🇬🇧' : 'TR 🇹🇷'}</Text>
        </TouchableOpacity>
      </View>

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
        {activeTab === 'kasa' && (
          <View>
            <View style={styles.bakiyeCard}>
              <Text style={styles.bakiyeLabel}>{text.toplamVarlik}</Text>
              <Text style={styles.bakiyeValue}>{toplamVarlik.toLocaleString()} TL</Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>{text.grafikBaslik}</Text>
              <View style={styles.grafikRow}>
                <View style={styles.grafikBoxGelir}>
                  <Text style={styles.grafikLabel}>Toplam Gelir</Text>
                  <Text style={styles.grafikVal}>+{toplamGelir.toLocaleString()} TL</Text>
                </View>
                <View style={styles.grafikBoxGider}>
                  <Text style={styles.grafikLabel}>Toplam Gider</Text>
                  <Text style={styles.grafikVal}>-{toplamGider.toLocaleString()} TL</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>{text.hesaplarim}</Text>
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
              <Text style={styles.cardTitle}>{duzenlenenHesapId ? 'Hesap Düzenle' : text.yeniHesap}</Text>
              <TextInput style={styles.input} placeholder={text.hesapAdi} placeholderTextColor="#64748b" value={yeniHesapAd} onChangeText={setYeniHesapAd} />
              <TextInput style={styles.input} placeholder={text.ilkBakiye} placeholderTextColor="#64748b" keyboardType="numeric" value={yeniHesapBakiye} onChangeText={setYeniHesapBakiye} />
              <TouchableOpacity style={styles.saveBtn} onPress={hesapKaydet}>
                <Text style={styles.saveBtnText}>{duzenlenenHesapId ? text.guncelle : text.ekleKaydet}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>{text.yeniIslem}</Text>
              <View style={styles.tipRow}>
                <TouchableOpacity style={[styles.tipBtn, islemTipi === 'gelir' && styles.gelirActive]} onPress={() => setIslemTipi('gelir')}><Text style={styles.tipText}>{text.gelir}</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.tipBtn, islemTipi === 'gider' && styles.giderActive]} onPress={() => setIslemTipi('gider')}><Text style={styles.tipText}>{text.gider}</Text></TouchableOpacity>
              </View>
              <TextInput style={styles.input} placeholder={text.tutar} placeholderTextColor="#64748b" keyboardType="numeric" value={tutar} onChangeText={setTutar} />
              <TextInput style={styles.input} placeholder={text.islemAciklama} placeholderTextColor="#64748b" value={aciklama} onChangeText={setAciklama} />
              <TouchableOpacity style={styles.saveBtn} onPress={islemKaydet}>
                <Text style={styles.saveBtnText}>{text.ekleKaydet}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'portfoy' && (
          <View>
            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>{duzenlenenPortfoyId ? 'Portföy Düzenle' : text.portfoyEkle}</Text>
              <TextInput style={styles.input} placeholder={text.pBaslik} placeholderTextColor="#64748b" value={pBaslik} onChangeText={setPBaslik} />
              
              <Text style={styles.labelSub}>Kategori:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {['Konut', 'Arsa', 'İş Yeri', 'Zeytinlik/Tarla'].map(cat => (
                  <TouchableOpacity key={cat} onPress={() => setPCategory(cat)} style={[styles.chip, pCategory === cat && styles.chipActive]}>
                    <Text style={[styles.chipText, pCategory === cat && styles.chipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.labelSub}>İşlem Tipi:</Text>
              <View style={styles.tipRow}>
                {['Satılık', 'Kiralık', 'Kat Karşılığı'].map(st => (
                  <TouchableOpacity key={st} style={[styles.tipBtn, pTip === st && styles.gelirActive]} onPress={() => setPTip(st)}>
                    <Text style={styles.tipText}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput style={styles.input} placeholder={text.pFiyat} placeholderTextColor="#64748b" keyboardType="numeric" value={pFiyat} onChangeText={setPFiyat} />
              <TextInput style={styles.input} placeholder={text.pKonum} placeholderTextColor="#64748b" value={pKonum} onChangeText={setPKonum} />
              <TextInput style={[styles.input, { height: 70 }]} placeholder={text.pAciklama} placeholderTextColor="#64748b" multiline value={pAciklama} onChangeText={setPAciklama} />
              
              <TouchableOpacity style={styles.saveBtn} onPress={portfoyKaydet}>
                <Text style={styles.saveBtnText}>{duzenlenenPortfoyId ? text.guncelle : text.ekleKaydet}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterCard}>
              <TextInput 
                style={styles.searchInput} 
                placeholder="🔍 Portföy ara..." 
                placeholderTextColor="#64748b"
                value={pSearchQuery}
                onChangeText={setPSearchQuery}
              />
            </View>

            <Text style={styles.sectionTitle}>Portföyler ({filtrelenmisPortfoyler.length})</Text>
            {filtrelenmisPortfoyler.map(p => (
              <View key={p.id} style={styles.listItem}>
                <View style={{flex: 1}}>
                  <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>{p.baslik}</Text>
                    <Text style={styles.listBadge}>{p.tip}</Text>
                  </View>
                  <Text style={styles.listSub}>📍 {p.konum} | 💰 {p.fiyat.toLocaleString()} TL</Text>
                </View>
                <TouchableOpacity onPress={() => portfoySil(p.id)}><Text style={{color: '#f87171'}}>🗑️</Text></TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'talepler' && (
          <View>
            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>{duzenlenenTalepId ? 'Talep Düzenle' : text.talepEkle}</Text>
              <TextInput style={styles.input} placeholder={text.tMusteri} placeholderTextColor="#64748b" value={tMusteri} onChangeText={setTMusteri} />
              <TextInput style={styles.input} placeholder={text.tMaxFiyat} placeholderTextColor="#64748b" keyboardType="numeric" value={tMaxFiyat} onChangeText={setTMaxFiyat} />
              <TextInput style={styles.input} placeholder={text.tAranan} placeholderTextColor="#64748b" value={tAranan} onChangeText={setTAranan} />
              <TextInput style={styles.input} placeholder={text.tKonum} placeholderTextColor="#64748b" value={tKonum} onChangeText={setTKonum} />
              <TouchableOpacity style={styles.saveBtn} onPress={talepKaydet}>
                <Text style={styles.saveBtnText}>{text.ekleKaydet}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Talepler ({filtrelenmisTalepler.length})</Text>
            {filtrelenmisTalepler.map(talep => (
              <View key={talep.id} style={styles.listItem}>
                <View style={{flex: 1}}>
                  <Text style={styles.listTitle}>{talep.musteri}</Text>
                  <Text style={styles.listSub}>🔍 {talep.aranan} | 📍 {talep.konum}</Text>
                </View>
                <TouchableOpacity onPress={() => talepSil(talep.id)}><Text style={{color: '#f87171'}}>🗑️</Text></TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'eslesme' && (
          <View>
            <Text style={styles.sectionTitle}>{text.eslesmeBaslik}</Text>
            {bildirimler.length === 0 ? (
              <View style={styles.emptyCard}><Text style={styles.emptyText}>{text.bildirimYok}</Text></View>
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
  container: { flex: 1, backgroundColor: '#090d16', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { backgroundColor: '#111827', padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleBox: { backgroundColor: '#4a1525', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#701a2c' },
  headerTitle: { color: '#f3f4f6', fontSize: 19, fontWeight: '900', letterSpacing: 2 },
  langBtn: { backgroundColor: '#1f2937', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  langText: { color: '#fff', fontSize: 13 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#111827' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#38bdf8', backgroundColor: '#1f2937' },
  tabText: { color: '#94a3b8', fontSize: 12 },
  activeTabText: { color: '#38bdf8', fontWeight: 'bold' },
  content: { padding: 15 },
  bakiyeCard: { backgroundColor: '#0284c7', padding: 20, borderRadius: 14, alignItems: 'center', marginBottom: 15 },
  bakiyeLabel: { color: '#e0f2fe', fontSize: 13 },
  bakiyeValue: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginTop: 4 },
  formCard: { backgroundColor: '#111827', padding: 16, borderRadius: 14, marginBottom: 15 },
  filterCard: { backgroundColor: '#161e2e', padding: 12, borderRadius: 12, marginBottom: 12 },
  searchInput: { backgroundColor: '#090d16', color: '#fff', padding: 10, borderRadius: 8 },
  cardTitle: { color: '#f8fafc', fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  labelSub: { color: '#94a3b8', fontSize: 12, marginBottom: 6 },
  grafikRow: { flexDirection: 'row', justifyContent: 'space-between' },
  grafikBoxGelir: { flex: 1, backgroundColor: '#064e3b', padding: 10, borderRadius: 8, marginRight: 5, alignItems: 'center' },
  grafikBoxGider: { flex: 1, backgroundColor: '#7f1d1d', padding: 10, borderRadius: 8, marginLeft: 5, alignItems: 'center' },
  grafikLabel: { color: '#e2e8f0', fontSize: 11 },
  grafikVal: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  tipRow: { flexDirection: 'row', marginBottom: 12, gap: 4 },
  tipBtn: { flex: 1, padding: 8, backgroundColor: '#1f2937', alignItems: 'center', borderRadius: 8 },
  gelirActive: { backgroundColor: '#4a1525' },
  tipText: { color: '#fff', fontSize: 12 },
  input: { backgroundColor: '#090d16', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 10 },
  saveBtn: { backgroundColor: '#0284c7', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  sectionTitle: { color: '#f8fafc', fontSize: 15, fontWeight: 'bold', marginVertical: 10 },
  listItem: { backgroundColor: '#111827', padding: 14, borderRadius: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listTitle: { color: '#f8fafc', fontSize: 14, fontWeight: 'bold' },
  listBadge: { backgroundColor: '#0284c7', color: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, fontSize: 10 },
  listSub: { color: '#38bdf8', fontSize: 12 },
  emptyCard: { backgroundColor: '#111827', padding: 20, borderRadius: 10, alignItems: 'center' },
  emptyText: { color: '#94a3b8' },
  alertCard: { backgroundColor: '#065f46', padding: 14, borderRadius: 10, marginBottom: 8 },
  alertText: { color: '#d1fae5', fontSize: 13 }
});
