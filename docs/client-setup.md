# Client einrichten

## Voraussetzungen

Der neue Entwicklerbereich unter https://foodzwerge.de/dev ist im Anwendungsbranch vorbereitet; seine öffentliche Bereitstellung ist noch nicht bestätigt. Nach Deployment kannst du dich registrieren, deine E-Mail bestätigen und einen persönlichen Leseschlüssel erzeugen. Checkout-Zugriff erfordert eine Projektfreigabe und einen dafür ausgestellten Schlüssel.

Bis zur Bereitstellung stellt der Betreiber einen aktivierten Testendpunkt und einen vereinbarten Zugang bereit.
Die öffentliche Adresse https://foodzwerge.de/mcp ist vorgesehen, ihre Bereitstellung ist noch nicht bestätigt.
Für lokale Tests ist beispielsweise https://justdeliver4.test/mcp geeignet, wenn dieser Host auf deinem Rechner eingerichtet ist.

Wähle einen MCP-Client mit Streamable HTTP und Unterstützung für einen manuell konfigurierten Authorization-Header.
Dieses Kit enthält keine plattformspezifische ChatGPT- oder Claude-Konfiguration: Die Kompatibilität muss zunächst mit dem jeweiligen Client geprüft werden.

## Allgemeine Einstellungen

- URL: dein aktivierter Endpunkt
- Transport: Streamable HTTP (JSON-Antworten)
- Header: Authorization: Bearer <dein Schlüssel>
- Protokoll: 2025-06-18

Es gibt keinen OAuth-Flow. Die geplante Registrierung läuft über /dev/registrieren, die Schlüsselverwaltung über /dev/dashboard; /dev/api-key existiert nicht.
Ein Client, der zwingend OAuth verlangt, kann diese Version nicht auf diesem Weg verbinden.
Keinen Betreiber-Schlüssel in Browsercode, öffentliche GPT-Anweisungen oder dieses Repository kopieren.

## Ablauf auf Protokollebene

1. POST initialize mit protocolVersion, capabilities und clientInfo.
2. Antwortversion prüfen.
3. POST notifications/initialized ohne id; erwartet wird HTTP 202.
4. POST tools/list.
5. POST tools/call mit name und arguments.

Jeder Request verwendet:

```text
Content-Type: application/json
Accept: application/json, text/event-stream
Authorization: Bearer <dein Schlüssel>
```

Nach initialize zusätzlich: MCP-Protocol-Version: 2025-06-18.
Der Server führt keine persistente MCP-Sitzung; es ist kein Mcp-Session-Id erforderlich.
GET /mcp liefert 405, weil dieser Server keinen SSE-Empfangsstream anbietet. Ein Browseraufruf allein ist kein Funktionstest.

Optional kann X-Agent-Session-Id mit einer selbst erzeugten UUID die Statistik über mehrere Aufrufe verbinden.
Diese Kennung ersetzt niemals die Authentifizierung.

## Fehler

| Ergebnis | Bedeutung |
|---|---|
| 404 | MCP deaktiviert; kann auch von Routing/Proxy stammen |
| 401 | Token fehlt oder ist falsch |
| 403 | Host oder mitgesendeter Origin nicht erlaubt; auch vorgeschaltete Sperren prüfen |
| 406 | Accept-Header unvollständig |
| 413 | Anfrage zu groß |
| 415 | Content-Type muss JSON sein |
| 429 | Rate-Limit erreicht |
| 503 | Server-Schlüssel nicht korrekt konfiguriert |
| result.isError = true | Werkzeugfehler; Nachricht lesen und Argumente oder Auswahl korrigieren |

Ein HTTP-200 allein bedeutet nicht, dass ein Werkzeug erfolgreich war.
Vor der Nutzung immer JSON-RPC error und result.isError prüfen.
