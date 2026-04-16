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
  {
    book: "John",
    chapter: 1,
    verses: [
      "In the beginning was the Word, and the Word was with God, and the Word was God.",
      "He was with God in the beginning.",
      "Through him all things were made; without him nothing was made that has been made.",
      "In him was life, and that life was the light of all mankind.",
      "The light shines in the darkness, and the darkness has not overcome it.",
      "There was a man sent from God whose name was John.",
      "He came as a witness to testify concerning that light, so that through him all might believe.",
      "He himself was not the light; he came only as a witness to the light.",
      "The true light that gives light to everyone was coming into the world.",
      "He was in the world, and though the world was made through him, the world did not recognize him.",
    ],
  },
];

export const plans = [
  {
    id: "1",
    title: "Finding Peace in Chaos",
    description: "A 7-day journey through scriptures that calm the storm within.",
    days: 7,
    completedDays: 3,
    participants: 2341,
    category: "peace",
    image: "🕊️",
  },
  {
    id: "2",
    title: "Strength for the Weary",
    description: "Build unshakable faith through daily devotions on God's strength.",
    days: 14,
    completedDays: 0,
    participants: 1892,
    category: "strength",
    image: "⚔️",
  },
  {
    id: "3",
    title: "Walking in Purpose",
    description: "Discover God's unique calling for your life in 21 days.",
    days: 21,
    completedDays: 21,
    participants: 4521,
    category: "purpose",
    image: "🧭",
  },
  {
    id: "4",
    title: "Healing Waters",
    description: "Let scripture wash over your wounds with this 10-day healing plan.",
    days: 10,
    completedDays: 7,
    participants: 3102,
    category: "healing",
    image: "💧",
  },
];

export const discoverCategories = [
  { label: "Anxiety", color: "from-blue-600 to-blue-800", icon: "🌊" },
  { label: "Hope", color: "from-amber-500 to-orange-600", icon: "☀️" },
  { label: "Peace", color: "from-emerald-600 to-teal-700", icon: "🕊️" },
  { label: "Healing", color: "from-purple-600 to-violet-700", icon: "💜" },
  { label: "Strength", color: "from-red-600 to-rose-700", icon: "🔥" },
  { label: "Purpose", color: "from-sky-500 to-cyan-600", icon: "🧭" },
  { label: "Gratitude", color: "from-yellow-500 to-amber-600", icon: "🙏" },
  { label: "Love", color: "from-pink-500 to-rose-600", icon: "❤️" },
];

export type Category = "peace" | "strength" | "purpose" | "healing";
