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

## İkinci deneyim — GT Studio

İlk deneyim kök adreste korunmuştur. Yeni bölüm `studio/` adresindedir. Ana sayfadaki “02 · GT Studio” bağlantısıyla açılır; Studio içindeki “İlk deneyim” bağlantısıyla geri dönülür.

Studio: siyah/gümüş/kırmızı 3D boya seçimi, sürükleme ve iki parmakla yakınlaşma, klavyeyle 360° inceleme, jant/far/kapı detayları, far kontrolü, kokpit konseptine mor/mavi/amber ambiyans efekti, kişisel PNG indirme, TR/EN seslendirme, destekleyen tarayıcılarda tam ekran ve yerel paylaşım/bağlantı kopyalama. Kokpit ambiyansı sabit konsept görseline uygulanan bir efekttir; fiziksel aracın doğrulanmış donanım simülasyonu değildir.

Telefon genişliğinde veya 4 GB ve altı bildirilen cihaz belleğinde 2.03 MB, 361.617 üçgenli hafif model seçilir; gölgeler ve zemin yansıması azaltılır. Diğer cihazlarda ilk model kullanılır. Modelin referans geometri sayımı 930.300 üçgendir; sadeleştirme öncesi weld işlemi sonrası 930.262 olur. Fiziksel telefon kare hızı ölçülmedi.

WebGL2 yoksa altı görsellik yedek hikâye açılır. Boya, far ve 360° kontrolleri bu modda kapatılır; kokpit ambiyansı, detay açıklamaları ve görsel indirme kullanılabilir. Yedek mod indirmesi açıkça görsel önizleme olarak etiketlenir.

Studio kontrolü: 393×852 iframe görünümünde yatay taşma yok; Türkçe/İngilizce sesler, detay açıklaması, ambiyans ve PNG indirme tarayıcıda doğrulandı. Orijinal ve hafif modellerin her birinde 274 geometri/ses/akış kontrolü geçti. WebGL kapalı test tarayıcısı nedeniyle 3D renk/aydınlatma ve fiziksel telefonda dokunmatik performans görsel olarak doğrulanamadı.

Modeli yeniden sadeleştirmek için `node tools/prepare-mobile.mjs`, hafif modeli doğrulamak için `node tools/check.mjs assets/car-mobile.glb` kullanılır. Sosyal paylaşım kapağı `assets/share-cover.jpg` dosyasındadır.

### Studio geçiş düzeltmeleri

Detay seçimi sayfanın gerçek kaydırma konumuyla eşitlenir; sonraki kaydırma seçilen sahneden devam eder. Mod değiştirirken sürükleme/parmak takibi temizlenir. Sürüş atmosferi gerçek kaydırma hızını izler ve durunca sakinleşir. Model yüklenirken 3D kontroller kapalı kalır; destek durumu yükleme tamamlanınca gösterilir. Jant detayına geçişte sayfa ilerlemesi 0.5900, görsel yedek modda sıfırlama sonrası 0.1400 olarak tarayıcıda doğrulandı. Sonraki doğal kaydırma 0.2734 değerine ilerledi.
