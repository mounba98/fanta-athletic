import json

# Read cards
with open('data/wirc-snap-cards-full.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

# Remove lore from all cards
for card in cards:
    card.pop('lore', None)

# Write clean version
with open('data/wirc-snap-cards-full.json', 'w', encoding='utf-8') as f:
    json.dump(cards, f, indent=2, ensure_ascii=False)

print(f"✅ Removed lore from {len(cards)} cards")
