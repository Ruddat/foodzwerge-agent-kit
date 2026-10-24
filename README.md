# Foodzwerge Agent Kit

Restaurants finden, Speisekarten durchsuchen und einen Warenkorb für den Kunden vorbereiten – mit MCP.

**Stand: 24. Oktober 2026 · frühe Integration (0.1).** Die serverseitigen Laravel-Tests wurden lokal erfolgreich ausgeführt. Ein Test mit einem unabhängigen MCP-Client und die öffentliche Bereitstellung stehen noch aus. Dieses Repository betreibt keinen Server.

## Was das Kit enthält

- [Werkzeugschemas](schemas/tools.json)
- [Client einrichten](docs/client-setup.md)
- [Bestellablauf und Argumente](docs/ordering-flow.md)
- [Verhaltensregeln für Agenten](docs/agent-instructions.md)
- Ausführbare [JavaScript-](examples/javascript/client.mjs) und [Python-Beispiele](examples/python/client.py)

## Verbindung

| Eigenschaft | Wert |
|---|---|
| Vorgesehener Produktionsendpunkt | `https://foodzwerge.de/mcp` — noch nicht als öffentlich verfügbar bestätigt |
| Transport | Stateless Streamable HTTP mit JSON-Antworten |
| MCP-Protokoll | `2025-06-18` |
| Anmeldung | Persönlicher Bearer-Schlüssel (Entwicklerportal in Vorbereitung) |
| Automatische Bestellung / Zahlung | Nicht unterstützt; Kunde bestätigt im Checkout |

Der Entwicklerbereich unter `https://foodzwerge.de/dev` ist im Anwendungsbranch vorbereitet und noch nicht als öffentlich bereitgestellt bestätigt. Nach Deployment: registrieren, E-Mail bestätigen und einen Leseschlüssel erzeugen. Warenkorbprüfung und Checkout-Handoff benötigen zusätzlich eine Projektfreigabe.

Kein OAuth und kein öffentlicher Demo-Schlüssel in dieser Version.
Ein Client muss benutzerdefinierte Authorization-Header unterstützen. Ein Prompt allein richtet keine Verbindung ein.

## Werkzeuge

| Name | Zweck |
|---|---|
| `find_shops` | Shops nach Ort oder PLZ suchen |
| `shop_context` | Informationen und Fähigkeiten eines Shops |
| `search_menu` | Produkte, Varianten, Preise und Extras |
| `validate_cart` | Warenkorb und Kundengebühren prüfen |
| `create_checkout_handoff` | Checkout-Link zur Prüfung und Bestätigung erzeugen |

Alle Werkzeuge außer `find_shops` benötigen `shop_slug` aus der Shopsuche.
Die Schemas sind maßgeblich. Insbesondere unterscheiden sich die Positionen bei Warenkorbprüfung und Checkout.

## Lokal ausprobieren

Voraussetzung: Der Betreiber hat einen erreichbaren Testendpunkt aktiviert und dir einen Token gegeben.
Setze `FOODZWERGE_MCP_URL` und `FOODZWERGE_MCP_TOKEN` in deiner Umgebung.

PowerShell-Beispiel für die URL:

```powershell
$env:FOODZWERGE_MCP_URL = "https://justdeliver4.test/mcp"
# FOODZWERGE_MCP_TOKEN separat mit deinem lokalen Schlüssel setzen.
node examples/javascript/client.mjs
python examples/python/client.py
```

Die Beispiele initialisieren MCP und listen Werkzeuge. Mit `--city Edemissen` führen sie zusätzlich eine Shopsuche für Abholung aus. Sie erzeugen weder Checkout-Sitzungen noch Bestellungen.

Lokale TLS-Zertifikate müssen vom jeweiligen Runtime-System als vertrauenswürdig erkannt werden.
Die Zertifikatsprüfung sollte aktiv bleiben.

## Entwicklung

Node.js 22 oder neuer, Python 3.10 oder neuer. Keine externen Laufzeit-Abhängigkeiten.

```sh
npm test
python -m unittest discover -s tests -p "test_*.py"
```

Diese Tests verwenden ausschließlich einen lokalen Mock-Server. Sie bestätigen die Beispiele und Schemas, nicht die öffentliche Bereitstellung oder vollständige MCP-Konformität.

Die Bestelllogik läuft in der Foodzwerge-Anwendung. Dieses Kit enthält öffentliche Verträge und Integrationsbeispiele.
Eine Open-Source-Lizenz wurde vom Eigentümer noch nicht festgelegt.
