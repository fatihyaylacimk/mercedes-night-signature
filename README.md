# Mercedes-AMG GT — Gecenin İmzası

Fatih Yaylacı tarafından hazırlanan bağımsız etkileşimli reklam konsepti. Aşama 02: çalışan mobil web prototipi.

## Kullanım

Sayfayı kaydırın. Kamera otomobilin etrafında dolaşır, sürücü kapısı açılır, jantlar döner ve tünel sahnesine geçilir. Yukarı kaydırma görsel hareketi aynı yoldan geri götürür. TR / EN dil seçimi, kullanıcı kontrollü ses ve altı sahnelik menü bulunur. Ses başlangıçta kapalıdır.

3D desteklenmediğinde altı üretilmiş görselden oluşan sinematik yedek akış otomatik açılır. Bu modda gerçek 3D kapı/kamera hareketleri yerine görsel geçişler gösterilir. Konsept hakkında penceresi etkin görüntüleme türünü belirtir.

## Kapsam

- Three.js ile gerçek 3D model; ön menteşeli kapı, cam, ayna ve ayrı tekerlek grupları.
- Fren kaliperleri gövdeye bağlı kalır; jant ve fren diski döner.
- 12 statik MP3: altı Türkçe ve altı İngilizce kısa seslendirme.
- Web Audio ile sentezlenmiş geçiş, hava ve sürüş atmosferi. Sentez sesler, gerçek otomobilden alınmış kayıtlar olarak sunulmaz.
- HTML/CSS/ES modülleri; çalışma anında harici JavaScript veya ses servisi gerektirmez.
- Telefon kadrajı, klavye kontrolleri, azaltılmış hareket tercihi ve güvenli ekran kenarları.

## Yerel çalıştırma

Önceden hazırlanmış web dosyalarıyla Python sunucusu yeterlidir:

```powershell
py -m http.server 8080
```

Ardından http://localhost:8080 adresini açın. Görsellerin ve seslerin yüklenmesi için dosyayı çift tıklayarak açmak yerine HTTP sunucusu kullanın.

Geliştirme ve doğrulama:

```sh
npm ci
npm run build
npm run check
```

`webgl-source.js` 3D renderer kaynağıdır. Diğer uygulama kaynakları depo kökündeki modüllerdir. Hazır model pakete dahildir; normal derlemede modelin yeniden hazırlanması gerekmez.

## Model ve görsel sınırlar

Kullanılabilen hareket kaynağı Mercedes-AMG GT S 2016 modelidir. Storyboard ve yüksek detaylı kokpit görseli ayrı hazırlanmış reklam konsepti kareleridir; 2016 modelinin mühendislik ölçülerine sadık renderları değildir. Bu prototip, güncel C192 modelinin resmî konfigüratörü olarak sunulmaz.

## Doğrulama

274 kontrol geçti: GLB çözümleme, kapının gerçek geometri hareketi, sabit menteşe, dört ayrı tekerlek, sabit kaliperler, ters hareketin başlangıç pozuna dönmesi, altı sahne ve 12 ses dosyası. 393 × 852 iframe görünümünde yatay taşma, sahne menüsü, kaydırma, tekrar başlatma ve TR/EN ses oynatımı kontrol edildi.

Kontrol tarayıcısında WebGL devre dışıdır. Bu nedenle tarayıcıdaki görsel kontrol yedek modda yapıldı; 3D geometri ayrıca CPU ile kapı kapalı/açık olarak işlendi. WebGL ışıklandırması ve gerçek fiziksel telefondaki kare hızı henüz ölçülmedi.

## Kaynaklar

3D kaynak: https://github.com/GabrielPedroza/Mercedes-AMG-GT-S-2016 — kaynak README'si MIT lisansı belirtir. Kaynak commit: c7fef03252288ba6b858da2078e6e69a364930a1.

Düzenlemeler: siyah boya, kapı/cam/ayna menteşesi, ayrı jant ve disk grupları, küçültülmüş WebP dokular, Draco yeniden sıkıştırması. Kaynak ve değişiklik bilgileri `assets/model-provenance.json` içindedir. Üçüncü taraf bildirimleri için THIRD_PARTY_NOTICES.md dosyasına bakın.
