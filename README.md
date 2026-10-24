# Foodzwerge Agent Kit

Verbinde deine KI-Anwendung mit Foodzwerge: Shops finden, Speisekarten lesen und Warenkörbe bis zum Checkout vorbereiten.

Du brauchst **keine JD4-Installation und keinen Zugriff auf unsere Serversoftware**. Dieses Kit enthält Clients, Werkzeugschemas und Beispiele für den von Foodzwerge betriebenen MCP-Dienst.

> **Early Access:** Die öffentliche Bereitstellung ist noch nicht bestätigt. Die folgende Anleitung gilt für den bereitgestellten Dienst nach dessen Freischaltung. Die Client-Tests kannst du bereits jetzt ohne Konto ausführen.

## Schnellstart

1. Im [Entwicklerportal](https://foodzwerge.de/dev) registrieren und E-Mail bestätigen.
2. Im Dashboard einen persönlichen Leseschlüssel erstellen.
3. Dieses Repository klonen und den Client starten.

Voraussetzung: Node.js 22 oder neuer. Keine Paketinstallation erforderlich.

```powershell
git clone https://github.com/Ruddat/foodzwerge-agent-kit.git
cd foodzwerge-agent-kit
$env:FOODZWERGE_MCP_URL = "https://foodzwerge.de/mcp"
$secureToken = Read-Host "Deinen Entwicklerschlüssel eingeben" -AsSecureString
$env:FOODZWERGE_MCP_TOKEN = [System.Net.NetworkCredential]::new("", $secureToken).Password
node examples/javascript/client.mjs --city Edemissen
```

Den Schlüssel erst bei der Eingabeaufforderung eingeben. Er gehört niemals ins Repository.

Der Client zeigt Serverinformationen, verfügbare Werkzeuge und die Shopsuche. Er bestellt nichts und erzeugt keinen Checkout-Link.

**Erwartet:** Mit einem Leseschlüssel siehst du drei Werkzeuge. Mit freigegebenem Projekt und einem Checkout-Schlüssel siehst du fünf. Ob Shops gefunden werden, hängt vom aktuellen Angebot ab.

→ [Schritt-für-Schritt-Tour](docs/quickstart-tour.md) · [Python und andere Clients](docs/client-setup.md)

## Was du damit bauen kannst

Einen Bestellassistenten, der aktuelle Produkte und Varianten findet, Rückfragen stellt, Preise samt Gebühren prüfen lässt und dem Kunden einen Checkout-Link übergibt.

| Werkzeug | Aufgabe | Zugang |
|---|---|---|
| find_shops | Shops nach Ort oder PLZ suchen | Lesen |
| shop_context | Shopinformationen und Bestellmöglichkeiten | Lesen |
| search_menu | Produkte, Varianten, Preise und Extras | Lesen |
| validate_cart | Warenkorb, Rabatte und Gebühren prüfen | Checkout |
| create_checkout_handoff | Checkout-Link vorbereiten | Checkout |

Der Kunde öffnet den Link, prüft die Angaben und bestätigt die Bestellung selbst. Der Agent bestellt und bezahlt nicht automatisch.

## Verbindung

| Einstellung | Wert |
|---|---|
| Dienstadresse nach Freischaltung | https://foodzwerge.de/mcp |
| Transport | Stateless Streamable HTTP mit JSON-Antworten |
| Protokoll | 2025-06-18 |
| Authentifizierung | Authorization: Bearer DEIN_SCHLUESSEL |
| Entwicklerportal | https://foodzwerge.de/dev |

Dein MCP-Client muss eigene Authorization-Header unterstützen. Es gibt derzeit keinen OAuth-Flow. Ein Prompt allein stellt keine Verbindung her. Die Unterstützung durch einen bestimmten KI-Client muss separat geprüft werden.

## Anleitungen

- [Erster erfolgreicher Aufruf – geführte Tour](docs/quickstart-tour.md)
- [Entwicklerkonto, Schlüssel und Projektfreigabe](docs/developer-access.md)
- [Client einrichten und Fehler beheben](docs/client-setup.md)
- [Bestellablauf und konkrete Argumente](docs/ordering-flow.md)
- [Verhaltensregeln für Agenten](docs/agent-instructions.md)
- [Werkzeugschemas](schemas/tools.json)
- [JavaScript-Client](examples/javascript/client.mjs) · [Python-Client](examples/python/client.py)

## Kit ohne Konto prüfen

Diese Tests benötigen weder API-Schlüssel noch Zugang zur Foodzwerge-Serversoftware:

```sh
npm test
python -m unittest discover -s tests -p "test_*.py"
```

Node.js 22+ beziehungsweise Python 3.10+ erforderlich. Die Tests verwenden lokale Mock-Server und erzeugen keine Bestellungen. GitHub Actions führt sie ebenfalls aus. Sie prüfen Clients und Schemas, nicht die Verfügbarkeit des öffentlichen Dienstes.

## Rückmeldung

Fragen oder Fehler? [Issue erstellen](https://github.com/Ruddat/foodzwerge-agent-kit/issues) und Fehlermeldung, Runtime-Version und betroffenen Aufruf nennen. Keine Schlüssel oder persönlichen Kundendaten posten.

Dieses Repository enthält die Integrationsbeispiele, nicht die Foodzwerge-Serversoftware. Eine Open-Source-Lizenz ist noch nicht festgelegt.
