export const verses = [
  { text: "Be still, and know that I am God.", reference: "Psalm 46:10", category: "peace" },
  { text: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13", category: "strength" },
  { text: "For I know the plans I have for you, declares the Lord.", reference: "Jeremiah 29:11", category: "purpose" },
  { text: "He heals the brokenhearted and binds up their wounds.", reference: "Psalm 147:3", category: "healing" },
  { text: "The Lord is my shepherd; I shall not want.", reference: "Psalm 23:1", category: "peace" },
  { text: "Have I not commanded you? Be strong and courageous.", reference: "Joshua 1:9", category: "strength" },
  { text: "Trust in the Lord with all your heart.", reference: "Proverbs 3:5", category: "purpose" },
  { text: "Come to me, all you who are weary, and I will give you rest.", reference: "Matthew 11:28", category: "healing" },
];

export const devotionals = [
  {
    title: "Walking in Morning Light",
    snippet: "As dawn breaks, so does a new opportunity to align your heart with the Creator. Today, let the quietness of the morning remind you that stillness is not emptiness — it is fullness waiting to overflow.",
    readTime: "2 min",
    category: "peace",
  },
  {
    title: "Strength Beyond Measure",
    snippet: "When the weight of the world presses in, remember: your strength was never meant to come from within alone. The same power that moved mountains moves through you today.",
    readTime: "2 min",
    category: "strength",
  },
  {
    title: "Discovering Your Purpose",
    snippet: "Purpose is not a destination you arrive at — it is a path you walk daily. Each step, each decision, each whispered prayer draws you closer to the design written in the stars for you.",
    readTime: "3 min",
    category: "purpose",
  },
];

export const bibleChapters = [
  {
    book: "Psalms",
    chapter: 23,
    verses: [
      "The Lord is my shepherd; I shall not want.",
      "He makes me lie down in green pastures. He leads me beside still waters.",
      "He restores my soul. He leads me in paths of righteousness for his name's sake.",
      "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me.",
      "You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows.",
      "Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the Lord forever.",
    ],
  },
  {
    book: "Proverbs",
    chapter: 3,
    verses: [
      "My son, do not forget my teaching, but let your heart keep my commandments,",
      "for length of days and years of life and peace they will add to you.",
      "Let not steadfast love and faithfulness forsake you; bind them around your neck; write them on the tablet of your heart.",
      "So you will find favor and good success in the sight of God and man.",
      "Trust in the Lord with all your heart, and do not lean on your own understanding.",
      "In all your ways acknowledge him, and he will make straight your paths.",
    ],
  },
];

export type Category = "peace" | "strength" | "purpose" | "healing";
