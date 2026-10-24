# Bestellablauf

1. find_shops mit city oder postal_code aufrufen.
2. Den zurückgegebenen slug in shop_context verwenden.
3. search_menu nach dem gewünschten Gericht durchsuchen.
4. Variante, Menge, Extras und Lieferung oder Abholung mit dem Kunden klären.
5. Den vollständigen Warenkorb mit validate_cart prüfen.
6. Bei Erfolg create_checkout_handoff aufrufen.
7. Den zurückgegebenen checkout.checkout_url an den Kunden geben. Er prüft und bestätigt selbst.

## Beispielargumente

Die IDs unten sind rein illustrative Platzhalter. Verwende ausschließlich IDs aus einer aktuellen search_menu-Antwort.

Shopsuche:

```json
{"city":"Edemissen","order_type":"pickup","limit":5}
```

Shopkontext:

```json
{"shop_slug":"<slug-aus-der-suche>"}
```

Speisekarte:

```json
{"shop_slug":"<slug-aus-der-suche>","query":"Salami","limit":5}
```

Warenkorbprüfung:

```json
{"shop_slug":"<slug-aus-der-suche>","order_type":"pickup","items":[{"type":"product","variant_id":123,"quantity":1}]}
```

Checkout-Handoff:

```json
{"shop_slug":"<slug-aus-der-suche>","order_type":"pickup","items":[{"item_type":"product","product_id":45,"variant_id":123,"quantity":1}]}
```

Extras haben in beiden Werkzeugen die Form [{"id":456,"quantity":1}].
Für Menüs unterscheiden sich choices (Validierung) und selections (Checkout); verwende dafür die genauen [Schemas](../schemas/tools.json).

Bei Lieferung braucht validate_cart unter delivery_address mindestens die postal_code.
Der Checkout übernimmt keine Kundendaten aus diesem Beispiel; der Kunde ergänzt diese im Checkout.
Zahlungsart und weitere Auswahl können den endgültigen Gesamtbetrag beeinflussen.

## Grenzen

- Unbekannte Lieferkosten oder Mindestbestellwerte sind nicht gleich null.
- shop_context enthält in dieser Version keine vollständigen Öffnungszeiten. find_shops liefert is_open und next_opening_at. Daraus keine garantierte Abholzeit ableiten.
- Ein gültiger Warenkorb ist keine Bestellbestätigung und keine Lieferzusage.
- Die Gültigkeitsdauer eines Checkout-Links aus expires_at lesen; keine feste Laufzeit versprechen.
- Keine veganen, halal- oder allergenfreien Eigenschaften aus Produktnamen oder fehlenden Daten erfinden.
- Die Shopsuche bildet aktuell die freigegebenen Shops des Backends ab; eine ausschließliche Restaurantauswahl ist nicht garantiert.
- Vor echten Kundennutzungen den gesamten Ablauf im vorgesehenen Client testen.
