export type Article = "der" | "die" | "das";

export type Noun = {
  de: string;
  article: Article;
  en: string;
};

// Common A1/A2 nouns, written as [German, English] pairs grouped by article.
const DER: [string, string][] = [
  ["Tisch", "table"], ["Stuhl", "chair"], ["Mann", "man"], ["Vater", "father"], ["Bruder", "brother"],
  ["Sohn", "son"], ["Freund", "friend (male)"], ["Lehrer", "teacher (male)"], ["Arzt", "doctor"],
  ["Student", "student (male)"], ["Hund", "dog"], ["Vogel", "bird"], ["Fisch", "fish"], ["Apfel", "apple"],
  ["Kaffee", "coffee"], ["Tee", "tea"], ["Saft", "juice"], ["Käse", "cheese"], ["Kuchen", "cake"],
  ["Salat", "salad"], ["Reis", "rice"], ["Zucker", "sugar"], ["Wein", "wine"], ["Hunger", "hunger"],
  ["Durst", "thirst"], ["Tag", "day"], ["Morgen", "morning"], ["Abend", "evening"], ["Montag", "Monday"],
  ["Dienstag", "Tuesday"], ["Mittwoch", "Wednesday"], ["Donnerstag", "Thursday"], ["Freitag", "Friday"],
  ["Samstag", "Saturday"], ["Sonntag", "Sunday"], ["Monat", "month"], ["Sommer", "summer"],
  ["Winter", "winter"], ["Frühling", "spring"], ["Herbst", "autumn"], ["Regen", "rain"], ["Schnee", "snow"],
  ["Wind", "wind"], ["Himmel", "sky"], ["Baum", "tree"], ["Garten", "garden"], ["Wald", "forest"],
  ["Berg", "mountain"], ["See", "lake"], ["Fluss", "river"], ["Strand", "beach"], ["Platz", "square"],
  ["Bahnhof", "train station"], ["Flughafen", "airport"], ["Zug", "train"], ["Bus", "bus"], ["Flug", "flight"],
  ["Weg", "way, path"], ["Urlaub", "vacation"], ["Koffer", "suitcase"], ["Computer", "computer"],
  ["Fernseher", "television"], ["Schrank", "cupboard"], ["Teppich", "carpet"], ["Spiegel", "mirror"],
  ["Balkon", "balcony"], ["Keller", "basement"], ["Flur", "hallway"], ["Boden", "floor"],
  ["Kühlschrank", "fridge"], ["Herd", "stove"], ["Löffel", "spoon"], ["Teller", "plate"],
  ["Pullover", "sweater"], ["Mantel", "coat"], ["Schuh", "shoe"], ["Rock", "skirt"], ["Hut", "hat"],
  ["Kopf", "head"], ["Arm", "arm"], ["Finger", "finger"], ["Fuß", "foot"], ["Bauch", "belly"],
  ["Rücken", "back"], ["Mund", "mouth"], ["Zahn", "tooth"], ["Name", "name"], ["Brief", "letter"],
  ["Stift", "pen"], ["Bleistift", "pencil"], ["Beruf", "profession"], ["Chef", "boss"], ["Kunde", "customer"],
  ["Preis", "price"], ["Termin", "appointment"], ["Film", "film"], ["Sport", "sport"], ["Spaß", "fun"],
  ["Geburtstag", "birthday"], ["Supermarkt", "supermarket"], ["Markt", "market"], ["Park", "park"],
  ["Fehler", "mistake"], ["Test", "test"], ["Kurs", "course"], ["Satz", "sentence"], ["Text", "text"],
  ["Schlüssel", "key"], ["Müll", "trash"], ["Regenschirm", "umbrella"], ["Rucksack", "backpack"],
  ["Ball", "ball"], ["Kugelschreiber", "ballpoint pen"],
];

const DIE: [string, string][] = [
  ["Frau", "woman"], ["Mutter", "mother"], ["Schwester", "sister"], ["Tochter", "daughter"],
  ["Freundin", "friend (female)"], ["Lehrerin", "teacher (female)"], ["Familie", "family"], ["Tante", "aunt"],
  ["Oma", "grandma"], ["Katze", "cat"], ["Kuh", "cow"], ["Ente", "duck"], ["Maus", "mouse"], ["Lampe", "lamp"],
  ["Tür", "door"], ["Wand", "wall"], ["Küche", "kitchen"], ["Wohnung", "apartment"], ["Straße", "street"],
  ["Stadt", "city"], ["Schule", "school"], ["Universität", "university"], ["Arbeit", "work"], ["Zeit", "time"],
  ["Uhr", "clock, o'clock"], ["Woche", "week"], ["Minute", "minute"], ["Stunde", "hour"], ["Nacht", "night"],
  ["Zeitung", "newspaper"], ["Tasche", "bag"], ["Brille", "glasses"], ["Hose", "pants"], ["Jacke", "jacket"],
  ["Mütze", "cap"], ["Bluse", "blouse"], ["Socke", "sock"], ["Banane", "banana"], ["Orange", "orange"],
  ["Birne", "pear"], ["Tomate", "tomato"], ["Kartoffel", "potato"], ["Gurke", "cucumber"],
  ["Zitrone", "lemon"], ["Erdbeere", "strawberry"], ["Suppe", "soup"], ["Butter", "butter"], ["Milch", "milk"],
  ["Pizza", "pizza"], ["Schokolade", "chocolate"], ["Wurst", "sausage"], ["Flasche", "bottle"],
  ["Tasse", "cup"], ["Gabel", "fork"], ["Post", "post office"], ["Apotheke", "pharmacy"],
  ["Bäckerei", "bakery"], ["Kirche", "church"], ["Brücke", "bridge"], ["Haltestelle", "stop (bus/tram)"],
  ["U-Bahn", "subway"], ["Reise", "trip"], ["Karte", "card, ticket"], ["Rechnung", "bill"],
  ["Nummer", "number"], ["Adresse", "address"], ["Sprache", "language"], ["Frage", "question"],
  ["Antwort", "answer"], ["Übung", "exercise"], ["Hausaufgabe", "homework"], ["Prüfung", "exam"],
  ["Farbe", "color"], ["Blume", "flower"], ["Sonne", "sun"], ["Luft", "air"], ["Welt", "world"],
  ["Erde", "earth"], ["Insel", "island"], ["Hand", "hand"], ["Nase", "nose"], ["Schulter", "shoulder"],
  ["Dusche", "shower"], ["Toilette", "toilet"], ["Badewanne", "bathtub"], ["Treppe", "stairs"],
  ["Heizung", "heating"], ["Waschmaschine", "washing machine"], ["Idee", "idea"], ["Party", "party"],
  ["Musik", "music"], ["Hilfe", "help"], ["Liebe", "love"], ["Kamera", "camera"], ["Lösung", "solution"],
  ["Wiese", "meadow"], ["Kasse", "cash register"], ["Speisekarte", "menu"],
];

const DAS: [string, string][] = [
  ["Haus", "house"], ["Auto", "car"], ["Buch", "book"], ["Kind", "child"], ["Mädchen", "girl"],
  ["Baby", "baby"], ["Zimmer", "room"], ["Fenster", "window"], ["Bett", "bed"], ["Sofa", "sofa"],
  ["Regal", "shelf"], ["Bad", "bathroom"], ["Wohnzimmer", "living room"], ["Schlafzimmer", "bedroom"],
  ["Badezimmer", "bathroom"], ["Essen", "food"], ["Brot", "bread"], ["Brötchen", "bread roll"], ["Ei", "egg"],
  ["Fleisch", "meat"], ["Obst", "fruit"], ["Gemüse", "vegetables"], ["Wasser", "water"], ["Bier", "beer"],
  ["Glas", "glass"], ["Messer", "knife"], ["Frühstück", "breakfast"], ["Mittagessen", "lunch"],
  ["Abendessen", "dinner"], ["Eis", "ice cream, ice"], ["Müsli", "muesli"], ["Schwein", "pig"],
  ["Pferd", "horse"], ["Tier", "animal"], ["Kaninchen", "rabbit"], ["Wetter", "weather"], ["Jahr", "year"],
  ["Wochenende", "weekend"], ["Datum", "date"], ["Handy", "mobile phone"], ["Telefon", "telephone"],
  ["Radio", "radio"], ["Foto", "photo"], ["Bild", "picture"], ["Heft", "notebook"], ["Papier", "paper"],
  ["Wort", "word"], ["Land", "country"], ["Dorf", "village"], ["Meer", "sea"], ["Gebäude", "building"],
  ["Restaurant", "restaurant"], ["Café", "café"], ["Kino", "cinema"], ["Hotel", "hotel"],
  ["Krankenhaus", "hospital"], ["Geschäft", "shop"], ["Büro", "office"], ["Museum", "museum"],
  ["Theater", "theater"], ["Hemd", "shirt"], ["Kleid", "dress"], ["T-Shirt", "T-shirt"], ["Gesicht", "face"],
  ["Auge", "eye"], ["Ohr", "ear"], ["Bein", "leg"], ["Knie", "knee"], ["Herz", "heart"], ["Haar", "hair"],
  ["Geld", "money"], ["Ticket", "ticket"], ["Gepäck", "luggage"], ["Fahrrad", "bicycle"],
  ["Motorrad", "motorcycle"], ["Flugzeug", "airplane"], ["Schiff", "ship"], ["Taxi", "taxi"],
  ["Spiel", "game"], ["Problem", "problem"], ["Ziel", "goal"], ["Leben", "life"], ["Glück", "luck"],
  ["Licht", "light"], ["Feuer", "fire"], ["Salz", "salt"], ["Öl", "oil"], ["Gespräch", "conversation"],
  ["Thema", "topic"], ["Beispiel", "example"], ["Lied", "song"], ["Konzert", "concert"],
  ["Programm", "program"], ["Internet", "internet"], ["Blatt", "leaf, sheet"], ["Zelt", "tent"],
  ["Kissen", "pillow"], ["Handtuch", "towel"], ["Ding", "thing"],
];

const tag = (list: [string, string][], article: Article): Noun[] =>
  list.map(([de, en]) => ({ de, article, en }));

export const NOUNS: Noun[] = [...tag(DER, "der"), ...tag(DIE, "die"), ...tag(DAS, "das")];
