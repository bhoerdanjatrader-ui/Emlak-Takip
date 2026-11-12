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
  Alert
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
