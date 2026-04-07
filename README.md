# DVF Web Tools

Een React/Vite webapp met meerdere security- en utility-tools: wachtwoorden, tokens, GUID's en publiek IP-informatie via een backend endpoint op Vercel.

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

## Belangrijke context voor onderhoud

- Repositorynaam is gewijzigd van `pass-and-opaque-token-generator` naar `dvf-web-tools`.
- De tab Publiek IP gebruikt expliciet een eigen backend endpoint (`/api/my-ip`) en geen externe IP-websites.
- API-bestanden in `api/` moeten ESM-syntax gebruiken (`import`/`export default`) omdat `package.json` `"type": "module"` gebruikt.
- `lucide-react` draait op major v1; oude icon-export `Github` bestaat daar niet meer.

## Architectuur

- **Runtime**:
  - Browser SPA voor generators.
  - Vercel serverless API voor IP-informatie.
- **Entry points**:
  - `index.html` → `src/main.tsx`
  - `src/main.tsx` → `src/App.tsx`
- **Backend endpoint**:
  - `api/my-ip.js` → `GET /api/my-ip`
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
- Voor wachtwoorden/tokens/GUID's zijn er geen API-calls of server roundtrips nodig.
- Alleen de tab Publiek IP doet een backend call naar `/api/my-ip`.
- Clipboard-copy gebruikt de browser `navigator.clipboard` API.

## Build en scripts

`package.json` scripts:

- `npm run dev` → Vite dev server op poort `3000`.
- `npm run build` → productiebuild naar `dist/`.
- `npm run preview` → lokale preview van build output.
- `npm run lint` → TypeScript typecheck (`tsc --noEmit`).
- `npm run clean` → verwijdert `dist/` (cross-platform node script).

## Deploy (Vercel)

Dit project draait op Vercel met een frontend build + serverless API endpoint:

- Build command: `npm run build`
- Output directory: `dist`
- API route: `/api/my-ip` uit `api/my-ip.js`

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

## Troubleshooting

### Publiek IP tab toont geen data

Als de tab Publiek IP alleen `Onbekend` of een foutmelding toont:

1. Controleer of `GET /api/my-ip` direct JSON teruggeeft.
2. Controleer Vercel logs op runtime errors.

### Vercel ESM fout (`require is not defined`)

Dit project gebruikt `"type": "module"` in `package.json`. Daardoor worden bestanden in `api/` als ESM uitgevoerd.

- Gebruik in API-files `import` / `export default`.
- Gebruik geen `require(...)` of `module.exports` in `api/*.js`.

Voorbeeld goed:

```js
import net from 'node:net';

export default function handler(req, res) {
  res.status(200).json({ ok: true });
}
```

## Lokale setup

```bash
git clone https://github.com/derkveenhof/dvf-web-tools.git
cd dvf-web-tools
npm install
npm run dev
```
