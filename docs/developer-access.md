# Entwicklerzugang und Projektfreigabe

Das Entwicklerportal ist lokal umgesetzt. Die öffentliche Bereitstellung auf foodzwerge.de steht noch aus. Lokale Konten und Schlüssel werden nicht automatisch in eine andere Installation übertragen.

## Zugang erhalten

1. Öffne `/dev/registrieren` auf der verwendeten Foodzwerge-Installation.
2. Registriere dein Entwicklerkonto und bestätige die E-Mail-Adresse.
3. Erstelle unter `/dev/dashboard` einen persönlichen Leseschlüssel.
4. Kopiere ihn sofort in die lokale Konfiguration deiner Anwendung. Der vollständige Schlüssel wird nur einmal angezeigt.
5. Verbinde den Client mit dem MCP-Endpunkt derselben Installation.

## Rechte

| Schlüssel | Werkzeuge |
|---|---|
| Lesen | find_shops, shop_context, search_menu |
| Lesen + Checkout | zusätzlich validate_cart, create_checkout_handoff; nur solange das Projekt freigegeben ist |

Für Checkout: Projektname und Beschreibung im Dashboard einreichen. Foodzwerge prüft den Anwendungsfall. Nach Freigabe einen **neuen Schlüssel mit Checkout-Rechten** erstellen. Bestehende Leseschlüssel bleiben Leseschlüssel.

## Status im Dashboard

| Status | Nächster Schritt |
|---|---|
| Noch nicht beantragt | Projektanfrage einreichen |
| Anfrage wird geprüft | Entscheidung abwarten; Lesen bleibt möglich |
| Checkout freigegeben | Checkout-Schlüssel erstellen |
| Checkout nicht freigegeben | Beschreibung prüfen und gegebenenfalls erneut anfragen |
| Konto gesperrt | Foodzwerge kontaktieren; API-Aufrufe sind gesperrt |

Die Freigabe ist keine Bestellung. Erst der Kunde bestätigt seinen Warenkorb im Checkout.

## Schlüssel verwalten

- Maximal fünf aktive Schlüssel pro Konto, jeweils 90 Tage gültig.
- 30 MCP-Anfragen pro Minute je Schlüssel und 60 pro Entwicklerkonto.
- Schlüssel können im Dashboard gesperrt werden; gesperrte Schlüssel lassen sich nicht reaktivieren.
- Bei Passwort-Zurücksetzung werden bisherige API-Schlüssel gesperrt.
- Keine Schlüssel in Git, Browsercode, Screenshots oder öffentlichen Agentenanweisungen veröffentlichen.
- Es gibt aktuell keinen öffentlichen Demo-Schlüssel und keinen OAuth-Anmeldefluss.

## Ohne Zugang testen

`npm test` und die Python-Tests laufen gegen lokale Mock-Server, ohne Konto und ohne Schlüssel. Sie erzeugen keine Restaurantbestellung. Ein echter Verbindungstest benötigt einen erreichbaren aktivierten MCP-Endpunkt und einen Schlüssel von dessen Installation.

Die Schlüssel werden serverseitig gehasht gespeichert. Das öffentliche Agent Kit enthält weder JD4-Anwendungsquellcode noch Zugangsdaten.
