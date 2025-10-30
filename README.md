# Satış ve Envanter Paneli

Bu proje, Next.js ile oluşturulmuş basit bir satış ve envanter yönetimi paneli uygulamasıdır. Gelir, kâr, en çok satan ürünler ve son işlemler gibi verileri görselleştirir.

## ✨ Temel Özellikler

- **Gösterge Paneli:** Satışlar, iadeler ve net gelir hakkında genel bir bakış sunar.
- **Envanter Yönetimi:** Ürün ekleme, düzenleme ve silme işlemleri.
- **Satış ve İade Takibi:** Kolayca satış ve iade işlemleri yapma.
- **Veri Kalıcılığı:** Tüm veriler, herhangi bir sunucuya ihtiyaç duymadan doğrudan tarayıcınızın yerel deposunda (`localStorage`) saklanır.
- **Otomatik Yayınlama:** Proje, `main` branch'ine yapılan her değişiklikte GitHub Actions kullanılarak GitHub Pages'e otomatik olarak yayınlanır.

## 🚀 Yerel Geliştirme Ortamında Çalıştırma

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

1.  **Projeyi Klonlayın:**
    ```bash
    git clone https://github.com/kullanici-adiniz/proje-adiniz.git
    cd proje-adiniz
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Geliştirme Sunucusunu Başlatın:**
    ```bash
    npm run dev
    ```

    Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışacaktır.

## 📝 Önemli Notlar

- **Veri Depolama:** Bu uygulama bir veritabanı kullanmaz. Tüm veriler (`ürünler` ve `işlemler`) tarayıcınızın `localStorage`'ında saklanır. Bu, verilerin yalnızca o bilgisayar ve o tarayıcı için kalıcı olacağı anlamına gelir. Tarayıcı verilerini temizlerseniz veya farklı bir cihaz kullanırsanız, veriler kaybolacaktır.

- **GitHub Pages'de Yayınlama:** Bu proje, `main` branch'ine yapılan her `push` işleminden sonra GitHub Actions aracılığıyla otomatik olarak derlenir ve GitHub Pages'e dağıtılır. Yayınlama ayarlarını yapmak için repository'nizin "Settings" > "Pages" bölümüne gidip, kaynak olarak "GitHub Actions"ı seçtiğinizden emin olun.
