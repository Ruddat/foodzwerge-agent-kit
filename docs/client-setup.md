# Client einrichten

Dieses Kit verbindet deine Anwendung mit dem von Foodzwerge betriebenen Dienst. Eine eigene Installation der Bestellsoftware ist nicht erforderlich.

> Der öffentliche Dienst ist noch nicht als freigeschaltet bestätigt. Verwende die folgenden Einstellungen, sobald dein Entwicklerzugang auf foodzwerge.de verfügbar ist.

## Zugang und Einstellungen

Registriere dich im [Entwicklerportal](https://foodzwerge.de/dev), bestätige deine E-Mail und erstelle einen Schlüssel. Details: [Entwicklerzugang](developer-access.md).

- URL: `https://foodzwerge.de/mcp`
- Transport: Streamable HTTP mit JSON-Antworten
- Header: `Authorization: Bearer <dein Schlüssel>`
- Protokoll: `2025-06-18`

Der Client muss eigene Authorization-Header unterstützen. Es gibt keinen OAuth-Flow. Das Kit enthält keine bestätigte plattformspezifische ChatGPT- oder Claude-Konfiguration.

## JavaScript

Node.js 22 oder neuer, keine externen Abhängigkeiten. Die vollständigen PowerShell-Befehle stehen im [README](../README.md).

Für Bash:

```bash
export FOODZWERGE_MCP_URL="https://foodzwerge.de/mcp"
read -r -s -p "Entwicklerschlüssel: " FOODZWERGE_MCP_TOKEN
echo
export FOODZWERGE_MCP_TOKEN
node examples/javascript/client.mjs --city Edemissen
```

## Python

Python 3.10 oder neuer, keine externen Abhängigkeiten. Setze dieselben Umgebungsvariablen wie im JavaScript-Beispiel und führe aus:

```sh
python examples/python/client.py --city Edemissen
```

Die Beispiele lesen Prozess-Umgebungsvariablen. Eine Datei namens `.env` wird nicht automatisch geladen.

## Erwartetes Ergebnis

Ein Leseschlüssel liefert `find_shops`, `shop_context` und `search_menu`. Nach Projektfreigabe und Ausstellung eines Checkout-Schlüssels kommen `validate_cart` und `create_checkout_handoff` hinzu.

Beide CLI-Beispiele initialisieren MCP, listen Werkzeuge und suchen optional Shops. Sie erzeugen keine Checkout-Sitzung und keine Bestellung. Die [geführte Tour](quickstart-tour.md) erklärt die Ausgabe.

## MCP-Ablauf für eigene Clients

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

Nach initialize zusätzlich: `MCP-Protocol-Version: 2025-06-18`.

Der Server benötigt keine persistente MCP-Sitzung und keine Mcp-Session-Id. GET /mcp ist kein Funktionstest; der Transport verwendet POST. Optional verbindet X-Agent-Session-Id mit einer UUID mehrere Aufrufe in der Statistik. Diese Kennung ersetzt keine Authentifizierung.

## Fehler beheben

| Ergebnis | Prüfen |
|---|---|
| 404 | Dienst noch nicht freigeschaltet oder falsche URL |
| 401 | Schlüssel, Ablauf, Sperrung, Kontostatus und E-Mail-Bestätigung |
| 403 | Origin nicht erlaubt oder vorgeschaltete Serversperre; Foodzwerge informieren |
| 405 bei Browseraufruf | MCP über den Client per POST aufrufen |
| 406 | Accept-Header muss JSON und text/event-stream enthalten |
| 413 | Anfrage zu groß |
| 415 | Content-Type muss application/json sein |
| 429 | Anfragebegrenzung erreicht; Retry-After beachten |
| 503 | Dienstkonfiguration benötigt Prüfung durch Foodzwerge |
| result.isError = true | Werkzeugmeldung lesen; Argumente oder Berechtigung prüfen |
| fetch failed | Erreichbarkeit und TLS prüfen; niemals Zertifikatsprüfung abschalten |

Ein HTTP-200 allein bedeutet keinen Werkzeugerfolg. Immer JSON-RPC error und result.isError prüfen. Bei Fragen ein [Issue](https://github.com/Ruddat/foodzwerge-agent-kit/issues) ohne Zugangsschlüssel erstellen.
