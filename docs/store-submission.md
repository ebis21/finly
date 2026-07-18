# Finly w sklepach — Google Play i Apple App Store

Ten dokument prowadzi krok po kroku przez wypuszczenie Finly (PWA) do sklepów.
Kod jest już przygotowany (manifest, ikony, service worker, Digital Asset Links).
Samego wysłania nie da się zrobić z poziomu repo — wymaga Twoich kont
deweloperskich, opłat i (dla iOS) Maca z Xcode.

## Co jest już gotowe w kodzie
- **Manifest** `/manifest.webmanifest` — nazwa, kolory, `display: standalone`,
  kategorie, skróty (app shortcuts), `id`.
- **Ikony** — `public/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`.
- **Service worker** `public/sw.js` — instalowalność + tryb offline.
- **Digital Asset Links** — szablon `public/.well-known/assetlinks.json`
  (do uzupełnienia odciskiem klucza — patrz Google Play niżej).

## Czego potrzebujesz zanim zaczniesz
1. **Stała domena produkcyjna z HTTPS** (nie adres podglądu Vercel). Najlepiej
   własna domena, np. `finly.app`, podpięta w Vercel. Sklepy wiążą aplikację
   z konkretnym adresem.
2. **Polityka prywatności** pod publicznym URL — **wymagana przez oba sklepy**
   (Finly to appka finansowa). Mogę wygenerować prostą stronę `/prywatnosc` —
   powiedz, to dorobię.
3. **Zrzuty ekranu** aplikacji (telefon) do listingu — Play i App Store ich
   wymagają. Zrób je z działającej apki (np. pulpit, cele, dodawanie).
4. **Konta deweloperskie:**
   - Google Play Console — **jednorazowo 25 USD**.
   - Apple Developer Program — **99 USD/rok**.

---

## Google Play (Android) — przez TWA
Android pakuje PWA jako **Trusted Web Activity** (natywna otoczka pokazująca
Twoją stronę bez paska przeglądarki). Najprościej narzędziem **PWABuilder**
albo **Bubblewrap**.

### Wariant A — PWABuilder (najprościej, w przeglądarce)
1. Wejdź na https://www.pwabuilder.com i wpisz swój **produkcyjny URL**.
2. Sprawdź raport (manifest/SW/ikony powinny być na zielono).
3. **Package For Stores → Android → Generate**. Pobierzesz:
   - plik `.aab` (do wysłania do Play),
   - podpowiedziany `assetlinks.json`.
4. Uzupełnij `public/.well-known/assetlinks.json` w repo:
   - `package_name` — nazwa pakietu, którą podałeś w PWABuilder
     (np. `app.finly.twa`),
   - `sha256_cert_fingerprints` — odcisk SHA-256. Jeśli używasz **Play App
     Signing** (zalecane), odcisk znajdziesz w Play Console → Twoja apka →
     *Setup → App integrity → App signing key certificate*.
   - Zacommituj i wdroż — plik musi być dostępny pod
     `https://twojadomena/.well-known/assetlinks.json`.
5. W **Play Console**: utwórz aplikację, wgraj `.aab`, wypełnij listing
   (ikona, opis, zrzuty, kategoria „Finanse", polityka prywatności),
   wypełnij ankiety (Data safety, treści) i wyślij do sprawdzenia.

### Wariant B — Bubblewrap (CLI, więcej kontroli)
```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://twojadomena/manifest.webmanifest
bubblewrap build          # tworzy .aab i pokazuje odcisk SHA-256 do assetlinks
```
Dalej jak w kroku 4–5 wyżej.

> Ważne: dopóki `assetlinks.json` nie zgadza się z kluczem podpisującym,
> aplikacja pokaże pasek adresu przeglądarki. Po poprawnym powiązaniu —
> pełny ekran jak natywna apka.

---

## Apple App Store (iOS)
Apple nie przyjmuje PWA bezpośrednio — trzeba **otoczki natywnej** (WKWebView).
Najprościej wygenerować projekt **PWABuilderem**, potem zbudować go w Xcode.

### Kroki
1. Potrzebujesz **Maca z Xcode** oraz konta **Apple Developer**.
2. PWABuilder → Twój URL → **Package For Stores → iOS → Generate**. Dostaniesz
   projekt Xcode (Swift, owija Twoją stronę).
3. Otwórz projekt w Xcode: ustaw **Bundle Identifier**, zespół/podpisywanie,
   ikonę, ekran startowy.
4. Zbuduj i wyślij przez Xcode (Archive → Distribute) lub **Transporter** do
   App Store Connect.
5. W **App Store Connect**: metadane, zrzuty (dla kilku rozmiarów), polityka
   prywatności, „App Privacy" (jakie dane zbierasz), wyślij do recenzji.

### ⚠️ Ryzyko odrzucenia (bądź świadomy)
Apple ma wytyczną **4.2 (minimum functionality)** — potrafi odrzucić apki, które
są „tylko opakowaną stroną". Na naszą korzyść działa: tryb offline, instalowalny
wygląd bez chrome przeglądarki, własny, dopracowany UI. Mimo to bywa loteria.
Jeśli recenzja odrzuci wrapper, alternatywą jest przepakowanie w **Capacitor**
i dodanie choć jednej natywnej funkcji (np. powiadomienia, biometryczny lock) —
to osobny, większy krok.

---

## Kolejność, którą polecam
1. Podepnij **własną domenę** w Vercel (produkcja).
2. Dorób **politykę prywatności** (mogę wygenerować `/prywatnosc`).
3. Zrób **zrzuty ekranu**.
4. Najpierw **Google Play** (tańsze, łatwiejsze, TWA rzadko bywa odrzucane).
5. Potem **App Store** (droższe, ryzyko 4.2) — jeśli chcesz obecności na iOS.

Gdy będziesz miał domenę i odcisk klucza z PWABuilder/Play, wróć do mnie —
uzupełnię `assetlinks.json` i dopnę szczegóły.
