# Yeni siyah AMG deneyimi — model kabul aşaması

Hedef: siyah Mercedes-AMG GT 63 S E PERFORMANCE Coupé (C192), gerçek 3D iç mekân, kapıdan içeri giren kamera ve açılan bagaj. Mevcut iki deneyim korunur. Bu klasör bir bitmiş site veya yeni araç modeli içermez.

## Mevcut dosyadaki bulgular

- Kullanılan modelin kaynağı GT S 2016. C192 olarak yeniden etiketlenemez.
- Studio kokpit modu `03_kokpit.webp` görseli kullanıyor. Bu, istenen gerçek 3D iç mekân geçişini sağlamıyor.
- Mevcut hazırlanmış modelde bagaj pivotu bulunmuyor. Adı belli bir iç mekân grubu da yok; bu ad kontrolü tek başına geometri yokluğu kanıtı değildir. İç yüzeyler görsel olarak ayrıca incelenmeli.
- Gövdeye bağlı `マテリアル.300` malzemesi turuncu/altın renginde kalmış. Siyah renk kontrolü bu malzemeyi kapsamıyor.
- Birçok malzemede `clearcoatFactor` değeri 1'in üzerinde. Khronos şemasında geçerli aralık 0–1. Bu, ışıkta aşırı parlamaya katkıda bulunabilecek bir veri hatası; ekran görüntüsündeki bütün görünüm sorunlarının tek başına açıklaması değildir.
- Yapısal testlerin geçmesi fotogerçekçi görünüm veya fiziksel telefon performansı anlamına gelmez.

İki gerçek GLB dosyası Draco çözülerek envanterlendi: [current-model-inventory.json](./current-model-inventory.json). Tekrarlama komutu:

```sh
node tools/audit-vehicle.mjs assets/car-rig.glb assets/car-mobile.glb
```

## Edinilecek modelin şartları

1. Aynı C192 varyantına ait dış gövde ve iç mekân; camdan görünen düşük detaylı bir kabuk yeterli değil.
2. Ayrı sürücü kapısı, camı, aynası, kapı iç döşemesi ve eşik. Menteşe noktası ayarlanabilmeli.
3. Direksiyon, gösterge paneli, merkez ekran, konsol, koltuklar, taban ve tavanın gerçek geometrisi.
4. Ayrı bagaj kapağı/arka cam, kapak iç yüzeyi, bagaj eşiği, yan döşemeler ve taban. Kapağı kaldırınca kapalı bir yüzey veya boşluk görünmemeli.
5. Boya, cam, lastik, krom, deri ve aydınlatmalar için ayrı malzemeler; siyah boya malzemelerinin eksiksiz listesi.
6. `.blend` veya `.fbx` ve tüm dokular; ayrılmış parçaları koruyan `.glb` de kabul edilir. İşlem öncesi kaynak dosya korunur.
7. Herkese açık etkileşimli web gösterimi için uygun kullanım izni. Satın alınan kaynak dosya doğrudan herkese açık GitHub deposuna yüklenmez.

## Bulunan aday — dosya henüz edinilmedi

[HKV Studios / 2025 Mercedes-AMG GT 63 S E Performance Coupe — CGTrader](https://www.cgtrader.com/3d-models/car/sport-car/2025-mercedes-amg-gt-63-s-e-performance-coupe)

27 Ekim 2026 kontrolünde ilan fiyatı 169 ABD doları. Satıcı ayrıntılı iç mekân, ayrı parçalar, açılabilen kapı/bagaj/kaput ve GLB/Blender/FBX seçenekleri belirtiyor. GLB paketinde düşük/orta/yüksek sürümler ve 1K/2K/4K dokular açıklanıyor. Bunlar satıcı beyanıdır; model dosyasının projede denenmiş olduğu anlamına gelmez. Kaynak paket doğrudan telefona gönderilmeyecek; geometri ve dokular ayrıca optimize edilecek.

İlanda `Royalty Free License (no AI)` yazıyor. [CGTrader koşulları](https://www.cgtrader.com/pages/terms-and-conditions), özellikle 21A.2–21A.3, ham dosyanın dağıtımı ve kullanıcı erişimi hakkında koşullar içeriyor. Herkese açık WebGL kullanımının izin kapsamı satın almadan önce netleştirilmeli. Aynı ürünün TurboSquid ilanı `Editorial Uses Only` olarak listeleniyor; otomatik olarak bir reklam projesine uygun kabul edilmedi. Satın alma veya satıcıya mesaj gönderme yapılmadı.

## İlk kabul görüntüleri

Model edinildiğinde aynı gerçek modelden üç kontrol görüntüsü alınacak:

- Siyah dış gövde: büyük kadraj, nötr beyaz ışık, boya detayları ve jantlar net.
- Sürücü koltuğu: direksiyon, ekranlar, konsol ve kapı iç döşemesi net.
- Açık bagaj: gerçek taban, yan yüzeyler ve kapak içi net.

Satıcı renderları ve üretilmiş konsept görselleri bu kontrolün yerine geçmez. Şu anda bu üç proje görüntüsü mevcut değil.

## Uygulama sırası

1. Far çizgileri ve siyah gövdenin ışıkla ortaya çıkışı.
2. Aracın çevresinde yakın dış kamera hareketi.
3. Jant, lastik ve gövde malzemesi yakın planı.
4. Sürücü kapısının doğru menteşeden açılması.
5. Kameranın kapı açıklığından kesintisiz içeri girmesi.
6. Sürücü konumunda dokunarak gerçek iç mekânı inceleme.
7. Gerçek iç mekân ışık şeritlerinde ambiyans değişimi.
8. Kameranın dışarı çıkıp arkaya geçmesi, kapının kapanması.
9. Bagajın açılması ve kameranın içini göstermesi.
10. Dış final, serbest inceleme ve paylaşım.

Kamera yolu modelin gerçek ölçüleri görülmeden sabitlenmez. Kontroller küçük bir menüye taşınır; araç üzerinde yalnızca ilgili sahnenin küçük işaretleri görünür. TR/EN metin ve sesler sahneyle eşleşir. Scroll her iki yönde geri alınabilir. Telefon testi, gerçek model yüklendikten sonra yapılır ve fiziksel cihaz sonucu ayrıca belirtilir.

Şu anki bağımlılık: uygun model dosyası ve web kullanım izni. Yeni C192 deneyimi hazırlanmış veya yayımlanmış olarak sunulamaz.

## Teknik kaynak

[Khronos clearcoat şeması](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_clearcoat/schema/material.KHR_materials_clearcoat.schema.json)
