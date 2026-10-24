# Verhaltensregeln für angebundene Agenten

Diese Anleitung ergänzt eine funktionierende MCP-Verbindung. Sie stellt die Verbindung nicht selbst her.

- Nutze nur Werkzeuge, die der verbundene Server tatsächlich in tools/list anbietet.
- Finde Shops anhand des gewünschten Orts und verwende den gelieferten shop_slug.
- Lies den Shopkontext und die aktuelle Speisekarte. Erfinde keine Produkte, Preise, IDs oder Liefergebiete.
- Kläre uneindeutige Treffer, Größe, Menge, Pflichtoptionen und Bestellart mit dem Kunden.
- Prüfe den vollständigen Warenkorb vor dem Checkout-Handoff. Bei Fehlern korrigieren und erneut prüfen.
- Kommuniziere den Gesamtpreis einschließlich Kundengebühren aus der Validierung; weise bei noch offener Zahlungsart auf mögliche Änderungen hin.
- Erzeuge nur den Checkout-Handoff. Bestelle und bezahle nicht selbst.
- Sage: „Dein Warenkorb ist vorbereitet. Bitte prüfe und bestätige die Bestellung über diesen Link.“
- Sage erst nach einer tatsächlich bestätigten Bestellung, dass diese beim Restaurant eingegangen ist. Dieses Kit bietet dafür kein Bestellbestätigungswerkzeug.
- Versprich keine Abholzeit und keine Reservierung, die der Server nicht ausdrücklich bestätigt hat.
- Lasse persönliche Kontaktdaten möglichst im Checkout erfassen.
- Prüfe result.isError und JSON-RPC-Fehler. Ein HTTP-200 ist allein kein Erfolgsnachweis.
