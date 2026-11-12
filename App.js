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
  Platform
} from 'react-native';

export default function App() {
  const [lang, setLang] = useState('tr');
  const [activeTab, setActiveTab] = useState('kasa');

  // Kasa / Banka Hesapları State'leri
  const [hesaplar, setHesaplar] = useState([
    { id: '1', ad: 'Nakit Kasa', bakiye: 15000 },
    { id: '2', ad: 'Ziraat Bankası', bakiye: 45000 },
    { id: '3', ad: 'Garanti BBVA', bakiye: 12500 }
  ]);
  const [yeniHesapAd, setYeniHesapAd] = useState('');
  const [yeniHesapBakiye, setYeniHesapBakiye] = useState('');
  const [duzenlenenHesapId, setDuzenlenenHesapId] = useState(null);

  // Gelir / Gider İşlem State'leri
  const [islemTipi, setIslemTipi] = useState('gelir');
  const [tutar, setTutar] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [seciliHesap, setSeciliHesap] = useState('Nakit Kasa');
  const [islemGecmisi, setIslemGecmisi] = useState([
    { id: '1', tip: 'gelir', tutar: 15000, aciklama: 'Satış Komisyonu - Villa', hesap: 'Ziraat Bankası', tarih: '10.11.2026' },
    { id: '2', tip: 'gider', tutar: 2500, aciklama: 'Ofis Kirası', hesap: 'Nakit Kasa', tarih: '01.11.2026' },
  ]);

  // Portföy State'leri
  const [portfoyler, setPortfoyler] = useState([
    { id: '1', baslik: 'Ören 3+1 Daire', tip: 'Satılık', fiyat: 3200000, konum: 'Burhaniye/Ören', aciklama: 'Denize sıfır, kombili.' }
  ]);
  const [pBaslik, setPBaslik] = useState('');
  const [pTip, setPTip] = useState('Satılık');
  const [pFiyat, setPFiyat] = useState('');
  const [pKonum, setPKonum] = useState('');
  const [pAciklama, setPAciklama] = useState('');
  const [duzenlenenPortfoyId, setDuzenlenenPortfoyId] = useState(null);

  // Talep State'leri
  const [talepler, setTalepler] = useState([
    { id: '1', musteri: 'Ahmet Bey', tip: 'Satılık', maxFiyat: 3500000, aranan: '3+1 Daire', konum: 'Ören' }
  ]);
  const [tMusteri, setTMusteri] = useState('');
  const [tTip, setTTip] = useState('Satılık');
  const [tMaxFiyat, setTMaxFiyat] = useState('');
  const [tAranan, setTAranan] = useState('');
  const [tKonum, setTKonum] = useState('');
  const [duzenlenenTalepId, setDuzenlenenTalepId] = useState(null);

  // Bildirimler
  const [bildirimler, setBildirimler] = useState([]);

  // Dil Sözlüğü
  const t = {
    tr: {
      title: 'Patron | Esnaf & Emlak Kasa',
      kasa: 'Kasa & Banka',
      portfoy: 'Portföy',
      talepler: 'Talepler',
      eslesme: 'Eşleşmeler',
      toplamVarlik: 'Toplam Varlıklar',
      hesaplarim: 'Kasa ve Banka Hesapları',
      yeniHesap: 'Yeni Hesap Ekle (Banka / Kasa)',
      hesapAdi: 'Hesap Adı (Örn: İş Bankası)',
      ilkBakiye: 'Başlangıç Bakiyesi (TL)',
      ekleKaydet: 'Ekle / Kaydet',
      guncelle: 'Güncelle',
      iptal: 'İptal',
      yeniIslem: 'Gelir / Gider İşlemi',
      tutar: 'Tutar (TL)',
      islemAciklama: 'Açıklama',
      gelir: 'Gelir',
      gider: 'Gider',
      islemGecmisi: 'Finansal Hareketler',
      grafikBaslik: 'Finansal Dağılım Özeti',
      portfoyEkle: 'Portföy İşlemleri',
      pBaslik: 'Portföy Başlığı',
      pFiyat: 'Fiyat (TL)',
      pKonum: 'Konum',
      pAciklama: 'Detaylı Açıklama',
      talepEkle: 'Müşteri Talebi İşlemleri',
      tMusteri: 'Müşteri Ad Soyad',
      tMaxFiyat: 'Max Bütçe (TL)',
      tAranan: 'Aranan Gayrimenkul',
      tKonum: 'İstenilen Bölge',
      eslesmeBaslik: 'Nokta Atışı Eşleşmeler',
      bildirimYok: 'Aktif eşleşme bulunmuyor.'
    },
    en: {
      title: 'Patron | Broker & Cashier',
      kasa: 'Cash & Banks',
      portfoy: 'Portfolio',
      talepler: 'Requests',
      eslesme: 'Matches',
      toplamVarlik: 'Total Assets',
      hesaplarim: 'Accounts & Banks',
      yeniHesap: 'Add Account / Bank',
      hesapAdi: 'Account Name',
      ilkBakiye: 'Initial Balance (TL)',
      ekleKaydet: 'Add / Save',
      guncelle: 'Update',
      iptal: 'Cancel',
      yeniIslem: 'Income / Expense',
      tutar: 'Amount (TL)',
      islemAciklama: 'Description',
      gelir: 'Income',
      gider: 'Expense',
      islemGecmisi: 'Transactions',
      grafikBaslik: 'Financial Summary',
      portfoyEkle: 'Portfolio Management',
      pBaslik: 'Title',
      pFiyat: 'Price (TL)',
      pKonum: 'Location',
      pAciklama: 'Description',
      talepEkle: 'Client Request Management',
      tMusteri: 'Client Name',
      tMaxFiyat: 'Max Budget (TL)',
      tAranan: 'Desired Property',
      tKonum: 'Target Location',
      eslesmeBaslik: 'Smart Matches',
      bildirimYok: 'No matches found.'
    }
  };

  const text = t[lang];

  const toplamVarlik = hesaplar.reduce((toplam, h) => toplam + h.bakiye, 0);
  const toplamGelir = islemGecmisi.filter(i => i.tip === 'gelir').reduce((t, i) => t + i.tutar, 0);
  const toplamGider = islemGecmisi.filter(i => i.tip === 'gider').reduce((t, i) => t + i.tutar, 0);

  useEffect(() => {
    let yeniEslesmeler = [];
    portfoyler.forEach(portfoy => {
      talepler.forEach(talep => {
        const fiyatUygun = portfoy.fiyat <= Number(talep.maxFiyat);
        const tipUygun = portfoy.tip.toLowerCase() === talep.tip.toLowerCase();
        const konumUygun = portfoy.konum.toLowerCase().includes(talep.konum.toLowerCase());

        if (fiyatUygun && tipUygun && konumUygun) {
          yeniEslesmeler.push({
            id: `${portfoy.id}-${talep.id}`,
            mesaj: `🎯 ${talep.musteri} (${talep.aranan} - max ${talep.maxFiyat.toLocaleString()} TL) ile "${portfoy.baslik}" (${portfoy.fiyat.toLocaleString()} TL) uyuşuyor!`
          });
        }
      });
    });
    setBildirimler(yeniEslesmeler);
  }, [portfoyler, talepler]);

  const hesapKaydet = () => {
    if (!yeniHesapAd) return Alert.alert('Hata', 'Hesap adı giriniz.');
    const bakiyeNum = Number(yeniHesapBakiye) || 0;

    if (duzenlenenHesapId) {
      setHesaplar(hesaplar.map(h => h.id === duzenlenenHesapId ? { ...h, ad: yeniHesapAd, bakiye: bakiyeNum } : h));
      setDuzenlenenHesapId(null);
    } else {
      setHesaplar([...hesaplar, { id: Date.now().toString(), ad: yeniHesapAd, bakiye: bakiyeNum }]);
    }
    setYeniHesapAd('');
    setYeniHesapBakiye('');
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
    setTutar('');
    setAciklama('');
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
      setPortfoyler(portfoyler.map(p => p.id === duzenlenenPortfoyId ? { ...p, baslik: pBaslik, tip: pTip, fiyat: fiyatNum, konum: pKonum, aciklama: pAciklama } : p));
      setDuzenlenenPortfoyId(null);
    } else {
      const yeniP = { id: Date.now().toString(), baslik: pBaslik, tip: pTip, fiyat: fiyatNum, konum: pKonum, aciklama: pAciklama };
      setPortfoyler([yeniP, ...portfoyler]);
    }
    setPBaslik(''); setPFiyat(''); setPKonum(''); setPAciklama('');
  };

  const portfoySil = (id) => setPortfoyler(portfoyler.filter(p => p.id !== id));
  const portfoyDuzenleBaslat = (p) => {
    setDuzenlenenPortfoyId(p.id);
    setPBaslik(p.baslik); setPTip(p.tip); setPFiyat(p.fiyat.toString()); setPKonum(p.konum); setPAciklama(p.aciklama);
  };

  const talepKaydet = () => {
    if (!tMusteri || !tMaxFiyat || !tKonum) return Alert.alert('Hata', 'Müşteri, bütçe ve bölge zorunludur.');
    const busteriMax = Number(tMaxFiyat);

    if (duzenlenenTalepId) {
      setTalepler(talepler.map(t => t.id === duzenlenenTalepId ? { ...t, musteri: tMusteri, tip: tTip, maxFiyat: busteriMax, aranan: tAranan, konum: tKonum } : t));
      setDuzenlenenTalepId(null);
    } else {
      const yeniT = { id: Date.now().toString(), musteri: tMusteri, tip: tTip, maxFiyat: busteriMax, aranan: tAranan, konum: tKonum };
      setTalepler([yeniT, ...talepler]);
    }
    setTMusteri(''); setTMaxFiyat(''); setTAranan(''); setTKonum('');
  };

  const talepSil = (id) => setTalepler(talepler.filter(t => t.id !== id));
  const talepDuzenleBaslat = (t) => {
    setDuzenlenenTalepId(t.id);
    setTMusteri(t.musteri); setTTip(t.tip); setTMaxFiyat(t.maxFiyat.toString()); setTAranan(t.aranan); setTKonum(t.konum);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      
      {/* Üst Başlık & Dil */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{text.title}</Text>
        <TouchableOpacity style={styles.langBtn} onPress={() => setLang(lang === 'tr' ? 'en' : 'tr')}>
          <Text style={styles.langText}>{lang === 'tr' ? 'EN 🇬🇧' : 'TR 🇹🇷'}</Text>
        </TouchableOpacity>
      </View>

      {/* Sekmeler */}
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
        
        {/* KASA & BANKA SEKMESİ */}
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
              <View style={styles.barContainer}>
                <View style={[styles.barGelir, { flex: toplamGelir || 1 }]} />
                <View style={[styles.barGider, { flex: toplamGider || 1 }]} />
              </View>
            </View>

            <Text style={styles.sectionTitle}>{text.hesaplarim}</Text>
            {hesaplar.map(h => (
              <View key={h.id} style={styles.listItem}>
                <View>
                  <Text style={styles.listTitle}>{h.ad}</Text>
                  <Text style={styles.listSub}>{h.bakiye.toLocaleString()} TL</Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.iconBtnEdit} onPress={() => hesapDuzenleBaslat(h)}><Text style={styles.iconText}>✏️</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtnDel} onPress={() => hesapSil(h.id)}><Text style={styles.iconText}>🗑️</Text></TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>{duzenlenenHesapId ? 'Hesap Düzenle' : text.yeniHesap}</Text>
              <TextInput style={styles.input} placeholder={text.hesapAdi} placeholderTextColor="#94a3b8" value={yeniHesapAd} onChangeText={setYeniHesapAd} />
              <TextInput style={styles.input} placeholder={text.ilkBakiye} placeholderTextColor="#94a3b8" keyboardType="numeric" value={yeniHesapBakiye} onChangeText={setYeniHesapBakiye} />
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
              <TextInput style={styles.input} placeholder={text.tutar} placeholderTextColor="#94a3b8" keyboardType="numeric" value={tutar} onChangeText={setTutar} />
              <TextInput style={styles.input} placeholder={text.islemAciklama} placeholderTextColor="#94a3b8" value={aciklama} onChangeText={setAciklama} />
              <TouchableOpacity style={styles.saveBtn} onPress={islemKaydet}>
                <Text style={styles.saveBtnText}>{text.ekleKaydet}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>{text.islemGecmisi}</Text>
            {islemGecmisi.map(item => (
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
            ))}
          </View>
        )}

        {/* PORTFÖY SEKMESİ */}
        {activeTab === 'portfoy' && (
          <View>
            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>{duzenlenenPortfoyId ? 'Portföy Düzenle' : text.portfoyEkle}</Text>
              <TextInput style={styles.input} placeholder={text.pBaslik} placeholderTextColor="#94a3b8" value={pBaslik} onChangeText={setPBaslik} />
              <View style={styles.tipRow}>
                <TouchableOpacity style={[styles.tipBtn, pTip === 'Satılık' && styles.gelirActive]} onPress={() => setPTip('Satılık')}><Text style={styles.tipText}>Satılık</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.tipBtn, pTip === 'Kiralık' && styles.giderActive]} onPress={() => setPTip('Kiralık')}><Text style={styles.tipText}>Kiralık</Text></TouchableOpacity>
              </View>
              <TextInput style={styles.input} placeholder={text.pFiyat} placeholderTextColor="#94a3b8" keyboardType="numeric" value={pFiyat} onChangeText={setPFiyat} />
              <TextInput style={styles.input} placeholder={text.pKonum} placeholderTextColor="#94a3b8" value={pKonum} onChangeText={setPKonum} />
              <TextInput style={[styles.input, { height: 70 }]} placeholder={text.pAciklama} placeholderTextColor="#94a3b8" multiline value={pAciklama} onChangeText={setPAciklama} />
              
              <TouchableOpacity style={styles.saveBtn} onPress={portfoyKaydet}>
                <Text style={styles.saveBtnText}>{duzenlenenPortfoyId ? text.guncelle : text.ekleKaydet}</Text>
              </TouchableOpacity>
              {duzenlenenPortfoyId && (
                <TouchableOpacity style={[styles.saveBtn, {backgroundColor: '#64748b', marginTop: 8}]} onPress={() => { setDuzenlenenPortfoyId(null); setPBaslik(''); setPFiyat(''); setPKonum(''); setPAciklama(''); }}>
                  <Text style={styles.saveBtnText}>{text.iptal}</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.sectionTitle}>Portföyler ({portfoyler.length})</Text>
            {portfoyler.map(p => (
              <View key={p.id} style={styles.listItem}>
                <View style={{flex: 1}}>
                  <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>{p.baslik}</Text>
                    <Text style={styles.listBadge}>{p.tip}</Text>
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
            ))}
          </View>
        )}

        {/* TALEPLER SEKMESİ */}
        {activeTab === 'talepler' && (
          <View>
            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>{duzenlenenTalepId ? 'Talep Düzenle' : text.talepEkle}</Text>
              <TextInput style={styles.input} placeholder={text.tMusteri} placeholderTextColor="#94a3b8" value={tMusteri} onChangeText={setTMusteri} />
              <View style={styles.tipRow}>
                <TouchableOpacity style={[styles.tipBtn, tTip === 'Satılık' && styles.gelirActive]} onPress={() => setTTip('Satılık')}><Text style={styles.tipText}>Satılık</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.tipBtn, tTip === 'Kiralık' && styles.giderActive]} onPress={() => setTTip('Kiralık')}><Text style={styles.tipText}>Kiralık</Text></TouchableOpacity>
              </View>
              <TextInput style={styles.input} placeholder={text.tMaxFiyat} placeholderTextColor="#94a3b8" keyboardType="numeric" value={tMaxFiyat} onChangeText={setTMaxFiyat} />
              <TextInput style={styles.input} placeholder={text.tAranan} placeholderTextColor="#94a3b8" value={tAranan} onChangeText={setTAranan} />
              <TextInput style={styles.input} placeholder={text.tKonum} placeholderTextColor="#94a3b8" value={tKonum} onChangeText={setTKonum} />

              <TouchableOpacity style={styles.saveBtn} onPress={talepKaydet}>
                <Text style={styles.saveBtnText}>{duzenlenenTalepId ? text.guncelle : text.ekleKaydet}</Text>
              </TouchableOpacity>
              {duzenlenenTalepId && (
                <TouchableOpacity style={[styles.saveBtn, {backgroundColor: '#64748b', marginTop: 8}]} onPress={() => { setDuzenlenenTalepId(null); setTMusteri(''); setTMaxFiyat(''); setTAranan(''); setTKonum(''); }}>
                  <Text style={styles.saveBtnText}>{text.iptal}</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.sectionTitle}>Talepler ({talepler.length})</Text>
            {talepler.map(talep => (
              <View key={talep.id} style={styles.listItem}>
                <View style={{flex: 1}}>
                  <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>{talep.musteri}</Text>
                    <Text style={styles.listBadge}>{talep.tip}</Text>
                  </View>
                  <Text style={styles.listSub}>🔍 {talep.aranan} | 📍 {talep.konum}</Text>
                  <Text style={styles.listDesc}>Max Bütçe: {talep.maxFiyat.toLocaleString()} TL</Text>
                </View>
                <View style={styles.actionColumn}>
                  <TouchableOpacity style={styles.iconBtnEdit} onPress={() => talepDuzenleBaslat(talep)}><Text style={styles.iconText}>✏️</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtnDel} onPress={() => talepSil(talep.id)}><Text style={styles.iconText}>🗑️</Text></TouchableOpacity>
                </View>
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
  container: { 
    flex: 1, 
    backgroundColor: '#0f172a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  header: { backgroundColor: '#1e293b', paddingHorizontal: 15, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#334155' },
  headerTitle: { color: '#f8fafc', fontSize: 16, fontWeight: 'bold' },
  langBtn: { backgroundColor: '#334155', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  langText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#38bdf8' },
  tabText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  activeTabText: { color: '#38bdf8' },
  content: { padding: 15, paddingBottom: 80 },
  bakiyeCard: { backgroundColor: '#0284c7', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  bakiyeLabel: { color: '#e0f2fe', fontSize: 13, fontWeight: '600' },
  bakiyeValue: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  formCard: { backgroundColor: '#1e293b', padding: 15, borderRadius: 12, marginBottom: 15 },
  cardTitle: { color: '#f8fafc', fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  grafikRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  grafikBoxGelir: { flex: 1, backgroundColor: '#064e3b', padding: 10, borderRadius: 8, marginRight: 5, alignItems: 'center' },
  grafikBoxGider: { flex: 1, backgroundColor: '#7f1d1d', padding: 10, borderRadius: 8, marginLeft: 5, alignItems: 'center' },
  grafikLabel: { color: '#e2e8f0', fontSize: 11 },
  grafikVal: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginTop: 2 },
  barContainer: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: '#334155' },
  barGelir: { backgroundColor: '#10b981', height: '100%' },
  barGider: { backgroundColor: '#ef4444', height: '100%' },
  tipRow: { flexDirection: 'row', marginBottom: 10 },
  tipBtn: { flex: 1, padding: 10, backgroundColor: '#334155', alignItems: 'center', borderRadius: 8, marginHorizontal: 3 },
  gelirActive: { backgroundColor: '#16a34a' },
  giderActive: { backgroundColor: '#dc2626' },
  tipText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  input: { backgroundColor: '#0f172a', color: '#fff', padding: 11, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#334155', fontSize: 14 },
  saveBtn: { backgroundColor: '#0284c7', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  sectionTitle: { color: '#f8fafc', fontSize: 15, fontWeight: 'bold', marginBottom: 8, marginTop: 10 },
  historyItem: { backgroundColor: '#1e293b', padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  historyDesc: { color: '#f8fafc', fontWeight: '600', fontSize: 13 },
  historyDate: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  historyAmount: { fontSize: 14, fontWeight: 'bold' },
  textGelir: { color: '#4ade80' },
  textGider: { color: '#f87171' },
  listItem: { backgroundColor: '#1e293b', padding: 12, borderRadius: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  listTitle: { color: '#f8fafc', fontSize: 14, fontWeight: 'bold' },
  listBadge: { backgroundColor: '#0369a1', color: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, fontSize: 10, fontWeight: 'bold' },
  listSub: { color: '#38bdf8', fontSize: 12, marginBottom: 2 },
  listDesc: { color: '#94a3b8', fontSize: 12, fontStyle: 'italic' },
  actionColumn: { justifyContent: 'center', alignItems: 'flex-end', marginLeft: 10 },
  actionRow: { flexDirection: 'row', gap: 6 },
  iconBtnEdit: { backgroundColor: '#0284c7', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, marginBottom: 4, alignItems: 'center' },
  iconBtnDel: { backgroundColor: '#dc2626', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
  iconText: { fontSize: 14 },
  emptyCard: { backgroundColor: '#1e293b', padding: 20, borderRadius: 10, alignItems: 'center' },
  emptyText: { color: '#94a3b8', textAlign: 'center' },
  alertCard: { backgroundColor: '#065f46', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#047857' },
  alertText: { color: '#d1fae5', fontSize: 13, fontWeight: '600', lineHeight: 18 }
});
