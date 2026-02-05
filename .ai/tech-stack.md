# Tech Stack - Wod Result

## Platforma
- **Typ aplikacji:** Progressive Web App (PWA)
- **Urządzenia docelowe:** Mobilne i desktopowe

## Frontend
- **Framework:** React
- **Bundler:** Vite
- **PWA:** vite-plugin-pwa (automatyczna generacja service worker, manifest)

## Backend
- **Runtime:** Node.js
- **Framework:** Express
- **ORM:** Drizzle ORM (type-safe, lekki, migracje)
- **Process Manager:** PM2 (auto-restart, logi, monitoring)

## Baza danych
- **System:** PostgreSQL (współdzielony)
- **Hosting:** mikr.us
- **Dostęp:** Publiczna lista workoutów (bez uwierzytelniania)

## Infrastruktura
- **Serwer:** mikr.us VPS (Helsinki, Finlandia)
- **Koszt:** ~75 PLN/rok (Mikrus 2.1) - serwer + baza w cenie
- **Dostępność:** 24/7 bez auto-pauzowania

## Przechowywanie lokalne
- **Mechanizm:** LocalStorage (przeglądarka)
- **Zastosowanie:** Lista "moje workouty", identyfikacja własnych wyników

## Wymagania PWA
- Możliwość instalacji na urządzeniach mobilnych i desktopowych
- Responsywność (od 320px szerokości)
- Tryb standalone (bez paska adresu przeglądarki)
- Własna ikona i nazwa "Wod Result"

## Wspierane przeglądarki
- Chrome
- Firefox
- Safari
- Edge

## Wspierane systemy mobilne
- iOS
- Android

## Uzasadnienie wyboru

### Dlaczego mikr.us zamiast BaaS (Supabase/Firebase)?
- **Brak auto-pauzowania** - Supabase Free pauzuje projekty po 7 dniach nieaktywności
- **Istniejąca infrastruktura** - serwer i baza już opłacone
- **Pełna kontrola** - root access, własna konfiguracja
- **Niższy koszt** - ~6€/rok vs 25$/miesiąc (Supabase Pro)

### Dlaczego Drizzle ORM?
- Type-safe queries (TypeScript)
- Lżejszy niż Prisma (~7x mniejszy bundle)
- Wbudowane migracje
- Ochrona przed SQL injection

### Dlaczego PM2?
- Auto-restart przy crashu
- Zarządzanie logami
- Monitoring zasobów
- Zero-downtime reload
