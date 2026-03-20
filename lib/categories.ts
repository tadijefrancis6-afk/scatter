export const CATEGORIES = [
  "A boy's name",
  "U.S. Cities",
  "Things that are cold",
  "School Supplies",
  "Pro Sports Teams",
  "Insects",
  "Breakfast Foods",
  "Furniture",
  "TV Shows",
  "Oceans",
  "President",
  "Product Names",
  "Appliances",
  "Types of Drink",
  "Personality Traits",
  "Articles of Clothing",
  "Desserts",
  "Car Parts",
  "Things you find on a map",
  "Athletes",
  "4-Letter Words",
  "Items in a refrigerator",
  "Farm Animals",
  "Street Names",
  "Things on a beach",
  "Colors",
  "Tools",
  "A Girl's Name",
  "Villains",
  "Musical Instruments",
  "Authors",
  "Bodies of Water",
  "Bird",
  "Countries",
  "Cartoons",
  "Holidays",
  "Things that are square",
  "Clothing Brands",
  "Board Games",
  "Types of Weather",
  "Heroes",
  "Software",
  "Websites",
  "Things you do every day"
];

export function getRandomCategories(count: number): string[] {
  const shuffled = [...CATEGORIES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getRandomLetter(): string {
  // Classic Scattergories excludes Q, U, V, X, Y, Z to make the game playable and fun
  const classicDice = "ABCDEFGHIJKLMNOPRSTW";
  return classicDice[Math.floor(Math.random() * classicDice.length)];
}
