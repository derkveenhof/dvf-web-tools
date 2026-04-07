# DVF Pass

Een statische React/Vite webapp voor lokale generatie van wachtwoorden, tokens en GUID's.

> [!IMPORTANT]
> **AI-gegenereerd en AI-doorontwikkeld**
> Deze applicatie is initieel opgezet met AI (Google AI Studio) en daarna verder ontwikkeld met AI-assistentie (Copilot in VS Code). Zowel de functionele opzet als een groot deel van de implementatie en refactors zijn met AI tot stand gekomen.

## Doel en scope

DVF Pass genereert client-side:

- wachtwoorden (configureerbare charset + lengte),
- OpenSSL-achtige Base64 tokens,
- GUID's voor unieke identificatie,
- publiek IP-overzicht via eigen backend endpoint.

Voor de tab Publiek IP wordt een backend endpoint gebruikt.

## Architectuur

- **Runtime**: Browser-only, single-page app.
- **Entry points**:
  - `index.html` → `src/main.tsx`
  - `src/main.tsx` → `src/App.tsx`
- **Styling**: Tailwind CSS 4 via Vite plugin + utility classes in JSX.
- **Assets**:
  - `public/images/patroon.png` (achtergrond)
  - `public/favicon.ico` (favicon)

## Cryptografie en generatiegedrag

### Wachtwoordmodus

- RNG: `window.crypto.getRandomValues()`.
- Charset is samengesteld uit geselecteerde groepen:
  - A-Z, a-z, 0-9, symbolen.
- Lengte: 8-32 (standaard 32).

### Tokenmodus

- RNG: `window.crypto.getRandomValues(new Uint8Array(32))`.
- 32 bytes worden omgezet naar Base64.
- Optioneel Base64URL-normalisatie:
  - `+` → `-`
  - `/` → `_`
  - trailing `=` verwijderd.
- Praktisch equivalent aan `openssl rand -base64 32`.

### GUID-modus

- Generator: `window.crypto.randomUUID()`.
- Standaard output: RFC4122-vorm (bijv. `3ffddc0e-00a8-46b6-b947-2464b9fa0ab7`).
- Extra opties in UI:
  - `To Upper`
  - `Zonder hyphens`
- **Belangrijk**: GUID's zijn voor identificatie, niet voor secrets/wachtwoorden/tokens.

## Security-notes

- Generatie draait volledig lokaal in de browser.
- Geen API-calls of server roundtrips voor gegenereerde waarden.
- Clipboard-copy gebruikt de browser `navigator.clipboard` API.

## Build en scripts

`package.json` scripts:

- `npm run dev` → Vite dev server op poort `3000`.
- `npm run build` → productiebuild naar `dist/`.
- `npm run preview` → lokale preview van build output.
- `npm run lint` → TypeScript typecheck (`tsc --noEmit`).
- `npm run clean` → verwijdert `dist/` (cross-platform node script).

## Deploy (Vercel)

Dit project is een standaard statische Vite-app en werkt direct op Vercel met:

- Build command: `npm run build`
- Output directory: `dist`

Er zijn momenteel geen runtime secrets/environment variabelen vereist voor productie.

## Publiek IP endpoint

- Endpoint: `GET /api/my-ip`
- Runtime: Vercel serverless function
- Gebruikte headers/bronvolgorde:
  - `x-forwarded-for` (eerste valide IP)
  - `x-real-ip`
  - `remoteAddress`
- Response bevat:
  - `ip`
  - `source`
  - `forwardedFor`
  - `userAgent`
  - `timestampUtc`
  - `vercel.country`, `vercel.region`, `vercel.city`

De app gebruikt hiervoor geen externe publieke IP-websites.

## Lokale setup

```bash
git clone https://github.com/derkveenhof/pass-and-opaque-token-generator.git
cd pass-and-opaque-token-generator
npm install
npm run dev
```
