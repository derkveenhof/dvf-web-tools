# SecurePass Generator

Een veilige, volledig client-side wachtwoord- en token-generator, ontworpen met de professionele stijl van **AFAS Software**.

> [!IMPORTANT]
> **AI-Gegenereerd Project**
> Deze applicatie is volledig ontworpen en gecodeerd door een AI-assistent (Google Gemini) in opdracht van de gebruiker. Van de cryptografische logica tot de AFAS-geïnspireerde styling: elk onderdeel is door de AI samengesteld om te voldoen aan specifieke veiligheids- en designwensen.

## 🚀 Kenmerken

- **100% Client-Side**: Alle wachtwoorden en tokens worden lokaal in je browser gegenereerd met de `Web Crypto API`. Er wordt geen data naar een server verzonden.
- **AFAS Look & Feel**: Een interface die naadloos aansluit bij de zakelijke uitstraling van AFAS (idp.afasonline.com), inclusief het herkenbare blauwe kleurenpalet en achtergrondpatroon.
- **Wachtwoord Modus**:
  - Instelbare lengte van 8 t/m 32 karakters (standaard 32).
  - Opties voor hoofdletters, kleine letters, cijfers en symbolen.
  - Real-time veiligheidsindicator met dynamische feedback.
- **OpenSSL Token Modus**:
  - Genereert cryptografisch sterke 32-byte (256-bit) tokens.
  - Vergelijkbaar met `openssl rand -base64 32`.
  - Ondersteuning voor **Base64URL** (URL-friendly) en standaard Base64.
- **Gebruiksvriendelijk**: Snel kopiëren naar klembord via iconen en intuïtieve bediening.

## 🛠️ Technologieën

- **React 19** & **TypeScript**
- **Tailwind CSS 4** (Styling)
- **Motion** (Animaties)
- **Lucide React** (Iconen)
- **Web Crypto API** (Veilige RNG)

## 📦 Lokale Installatie

Wil je dit project lokaal draaien? Volg deze stappen:

1. **Clone de repository**:
   ```bash
   git clone https://github.com/JOUW_GEBRUIKERSNAAM/securepass-generator.git
   cd securepass-generator
   ```

2. **Installeer afhankelijkheden**:
   ```bash
   npm install
   ```

3. **Start de development server**:
   ```bash
   npm run dev
   ```

4. **Bouw voor productie**:
   ```bash
   npm run build
   ```

## 🛡️ Veiligheid

Deze tool is gebouwd met privacy als hoogste prioriteit. Omdat de generatie plaatsvindt via `window.crypto.getRandomValues()`, ben je verzekerd van een cryptografisch sterke bron van willekeur die voldoet aan moderne standaarden voor wachtwoordbeheer.

---
*Gemaakt met behulp van AI-technologie.*
