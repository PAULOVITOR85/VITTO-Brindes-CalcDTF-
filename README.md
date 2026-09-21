# VITTO Brindes CalcDTF

Aplicativo Android offline para calcular o aproveitamento de folhas DTF.

## Recursos

- DTF Têxtil e DTF Rígido
- Folhas 20×28, 28×40, 28×100 e 57×100 cm
- Sangria de 0,03 cm, 0,05 cm ou 0,08 cm
- Descontos de 0%, 3%, 5%, 10%, 15%, 20% e 30%
- Cálculo de artes por folha, custo por arte e quantidade de folhas
- Rotação automática de 90°
- Comparação entre os tamanhos de folha
- Carrossel DTF Têxtil / DTF Rígido
- Tema claro e escuro
- Funcionamento offline dentro de WebView

## Nome do aplicativo

**VITTO Brindes CalcDTF**

## Android

- Application ID: `com.vittobrindes.calcdtf`
- minSdk: Android 7.0 / API 24
- targetSdk: API 35
- versionName: 1.0
- Java 17

## Gerar APK pelo GitHub

O repositório possui o workflow:

`.github/workflows/build-apk.yml`

Abra **Actions > Build Android APK > Run workflow**.

Quando a compilação terminar, baixe o artefato:

**VITTO-Brindes-CalcDTF-APK**

O arquivo gerado será `app-debug.apk`.

## Gerar pelo Android Studio

Abra este repositório como projeto Android e use:

**Build > Build APK(s)**

O APK ficará em:

`app/build/outputs/apk/debug/app-debug.apk`

## Estrutura principal

- `app/src/main/assets/index.html`
- `app/src/main/assets/styles.css`
- `app/src/main/assets/app.js`
- `app/src/main/assets/assets/`
- `app/src/main/java/com/vittobrindes/calcdtf/MainActivity.java`

A calculadora é empacotada junto do APK e não depende de internet para funcionar.
