/* eslint-disable */
// Seed the SQLite database with the demo brand, menu and a demo user.
// Run with: npm run seed   (or `npm run setup` to push schema + seed)

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const CATEGORIES = [
  { id: "ice-blended", label: "Ice Blended", sort: 1 },
  { id: "hot-coffee", label: "Hot Coffee", sort: 2 },
  { id: "tea", label: "Tea", sort: 3 },
  { id: "food", label: "Food", sort: 4 },
];

const ITEMS = [
  { id: "original-ice-blended", name: "Original Ice Blended", categoryId: "ice-blended", price: 385, img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=700", desc: "The blended coffee drink that started it all — a velvety mix of signature coffee, milk and ice, finished with a swirl.", veg: true, kcal: 320, caffeine: 95, protein: 6, sugar: 38, signature: true, rating: 4.8, reviews: 2140, origin: "100% Arabica from the highlands of Coorg, Karnataka & Costa Rica. Medium roast, notes of cocoa & toasted nut.", ingredients: ["Espresso", "Whole milk", "Ice Blended powder", "Cane sugar", "Ice"], allergens: ["Milk", "Made on equipment that handles nuts & soy"], tags: ["cold", "sweet", "signature", "treat"], sizes: [{ name: "Small", price: 345 }, { name: "Regular", price: 385 }, { name: "Large", price: 425 }], aiTip: "Craving less sugar? Ask for it 'lite' to cut ~30% sugar. Pairs beautifully with a Butter Croissant." },
  { id: "mocha-ice-blended", name: "Mocha Ice Blended", categoryId: "ice-blended", price: 410, img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=700", desc: "Rich chocolate meets signature coffee, blended smooth and topped with whipped cream.", veg: true, kcal: 380, caffeine: 105, protein: 7, sugar: 44, rating: 4.7, reviews: 1320, origin: "Arabica blend with single-origin cocoa from Idukki, Kerala.", ingredients: ["Espresso", "Whole milk", "Chocolate sauce", "Ice Blended powder", "Whipped cream", "Ice"], allergens: ["Milk", "Soy"], tags: ["cold", "sweet", "treat"], sizes: [{ name: "Small", price: 370 }, { name: "Regular", price: 410 }, { name: "Large", price: 450 }], aiTip: "The most indulgent pick on the menu — great as an afternoon treat." },
  { id: "vanilla-ice-blended", name: "Vanilla Ice Blended", categoryId: "ice-blended", price: 375, img: "https://images.unsplash.com/photo-1599639668273-01692b3b7c39?w=700", desc: "Smooth Madagascar vanilla blended with milk & ice — a creamy, caffeine-free classic.", veg: true, kcal: 340, caffeine: 0, protein: 6, sugar: 40, rating: 4.6, reviews: 870, origin: "Madagascar bourbon vanilla.", ingredients: ["Madagascar vanilla", "Whole milk", "Ice Blended powder", "Cane sugar", "Ice"], allergens: ["Milk"], tags: ["cold", "sweet", "treat", "decaf", "low-caffeine"], sizes: [{ name: "Small", price: 335 }, { name: "Regular", price: 375 }, { name: "Large", price: 415 }], aiTip: "Caffeine-free, so a good evening choice or for kids." },
  { id: "matcha-ice-blended", name: "Matcha Ice Blended", categoryId: "ice-blended", price: 410, img: "https://images.unsplash.com/photo-1568649929103-28ffbefaca1e?w=700", desc: "Ceremonial-grade matcha blended cold with milk and ice — earthy, gently sweet and refreshing.", veg: true, kcal: 340, caffeine: 40, protein: 5, sugar: 30, rating: 4.7, reviews: 640, origin: "Ceremonial-grade matcha from Uji, Kyoto.", ingredients: ["Matcha", "Whole milk", "Ice Blended powder", "Cane sugar", "Ice"], allergens: ["Milk"], tags: ["cold", "refreshing", "low-caffeine"], sizes: [{ name: "Small", price: 370 }, { name: "Regular", price: 410 }, { name: "Large", price: 450 }], aiTip: "Lower caffeine than coffee with steady energy — nice mid-afternoon." },
  { id: "cafe-latte", name: "Café Latte", categoryId: "hot-coffee", price: 295, img: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=700", desc: "Double espresso with steamed milk and a delicate layer of microfoam.", veg: true, kcal: 190, caffeine: 150, protein: 9, sugar: 14, rating: 4.8, reviews: 3100, origin: "House espresso blend — Arabica from Chikmagalur, Karnataka.", ingredients: ["Double espresso", "Steamed milk"], allergens: ["Milk"], tags: ["hot", "high-protein"], sizes: [{ name: "Regular", price: 295 }, { name: "Large", price: 335 }], aiTip: "9g protein from the milk — your most filling hot coffee." },
  { id: "cappuccino", name: "Cappuccino", categoryId: "hot-coffee", price: 275, img: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=700", desc: "Equal parts espresso, steamed milk and airy foam — dusted with cocoa.", veg: true, kcal: 150, caffeine: 150, protein: 8, sugar: 10, rating: 4.7, reviews: 2400, origin: "House espresso blend — Arabica from Chikmagalur, Karnataka.", ingredients: ["Double espresso", "Steamed milk", "Milk foam", "Cocoa dust"], allergens: ["Milk"], tags: ["hot", "high-protein"], sizes: [{ name: "Regular", price: 275 }, { name: "Large", price: 315 }], aiTip: "Under 150 kcal with a good protein hit — a balanced pick." },
  { id: "americano", name: "Americano", categoryId: "hot-coffee", price: 245, img: "https://images.unsplash.com/photo-1551030173-122aabc4489c?w=700", desc: "Rich double espresso lengthened with hot water. Bold, black, zero sugar.", veg: true, kcal: 10, caffeine: 150, protein: 1, sugar: 0, rating: 4.6, reviews: 1180, origin: "House espresso blend — Arabica from Chikmagalur, Karnataka.", ingredients: ["Double espresso", "Hot water"], allergens: [], tags: ["hot", "low-cal", "vegan"], sizes: [{ name: "Regular", price: 245 }, { name: "Large", price: 285 }], aiTip: "Just 10 kcal and vegan — the lightest coffee on the menu." },
  { id: "iced-black-tea", name: "Iced Black Tea", categoryId: "tea", price: 220, img: "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=700", desc: "Single-estate Assam black tea over ice. Order it unsweetened for the lightest refresh.", veg: true, kcal: 5, caffeine: 25, protein: 0, sugar: 0, rating: 4.5, reviews: 540, origin: "Single-estate Assam, second flush.", ingredients: ["Black tea", "Water", "Ice"], allergens: [], tags: ["cold", "refreshing", "low-cal", "low-caffeine", "vegan"], sizes: [{ name: "Regular", price: 220 }, { name: "Large", price: 250 }], aiTip: "5 kcal, vegan and the most refreshing — perfect for a hot day." },
  { id: "masala-chai", name: "Masala Chai Latte", categoryId: "tea", price: 260, img: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=700", desc: "House-blend spiced tea simmered with steamed milk, cardamom, ginger and clove.", veg: true, kcal: 180, caffeine: 40, protein: 6, sugar: 22, rating: 4.7, reviews: 980, origin: "Assam CTC with whole-spice house masala.", ingredients: ["Black tea", "Steamed milk", "Cardamom", "Ginger", "Clove", "Cane sugar"], allergens: ["Milk"], tags: ["hot", "sweet", "low-caffeine"], sizes: [{ name: "Regular", price: 260 }, { name: "Large", price: 300 }], aiTip: "Comforting and lower in caffeine — a great cosy choice." },
  { id: "green-tea", name: "Jasmine Green Tea", categoryId: "tea", price: 210, img: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=700", desc: "Delicate green tea scented with jasmine blossoms. Light, floral and calming.", veg: true, kcal: 0, caffeine: 30, protein: 0, sugar: 0, rating: 4.5, reviews: 410, origin: "Green tea scented with jasmine, Fujian style.", ingredients: ["Green tea", "Jasmine", "Hot water"], allergens: [], tags: ["hot", "low-cal", "low-caffeine", "vegan"], sizes: [{ name: "Regular", price: 210 }], aiTip: "Zero calories and antioxidant-rich — the cleanest pick." },
  { id: "butter-croissant", name: "Butter Croissant", categoryId: "food", price: 180, img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=700", desc: "Flaky, all-butter croissant baked fresh each morning. Warm on request.", veg: true, kcal: 290, caffeine: 0, protein: 6, sugar: 6, rating: 4.6, reviews: 720, origin: "French-style lamination, baked in-house daily.", ingredients: ["Wheat flour", "Butter", "Milk", "Yeast", "Salt"], allergens: ["Gluten", "Milk", "May contain egg"], tags: ["food", "treat"], sizes: [{ name: "One", price: 180 }], aiTip: "The classic pairing for any Ice Blended or latte." },
  { id: "almond-croissant", name: "Almond Croissant", categoryId: "food", price: 220, img: "https://images.unsplash.com/photo-1620921568790-c1cf8984624c?w=700", desc: "Butter croissant filled with almond cream and topped with toasted flakes.", veg: true, kcal: 410, caffeine: 0, protein: 9, sugar: 18, rating: 4.5, reviews: 360, origin: "Filled and finished in-house.", ingredients: ["Wheat flour", "Butter", "Almond cream", "Almonds", "Milk", "Egg"], allergens: ["Gluten", "Milk", "Egg", "Nuts"], tags: ["food", "treat", "high-protein"], sizes: [{ name: "One", price: 220 }], aiTip: "9g protein and very filling — good if you skipped breakfast." },
  { id: "veg-sandwich", name: "Grilled Veg & Pesto Sandwich", categoryId: "food", price: 320, img: "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=700", desc: "Grilled vegetables, basil pesto and melted cheese on sourdough.", veg: true, kcal: 430, caffeine: 0, protein: 16, sugar: 6, rating: 4.4, reviews: 290, origin: "Made fresh to order on house sourdough.", ingredients: ["Sourdough", "Zucchini", "Bell pepper", "Basil pesto", "Mozzarella"], allergens: ["Gluten", "Milk", "Nuts (pesto)"], tags: ["food", "high-protein"], sizes: [{ name: "One", price: 320 }], aiTip: "16g protein and savoury — the most filling thing on the menu." },
  { id: "blueberry-muffin", name: "Blueberry Muffin", categoryId: "food", price: 190, img: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=700", desc: "Soft muffin studded with real blueberries and a crunchy sugar top.", veg: true, kcal: 360, caffeine: 0, protein: 5, sugar: 28, rating: 4.3, reviews: 210, origin: "Baked in-house daily.", ingredients: ["Wheat flour", "Blueberries", "Butter", "Egg", "Sugar"], allergens: ["Gluten", "Milk", "Egg"], tags: ["food", "sweet", "treat"], sizes: [{ name: "One", price: 190 }], aiTip: "A sweet grab-and-go bite alongside your coffee." },
];

async function main() {
  console.log("Seeding Pista database…");

  await prisma.brand.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", name: "Pista", brandHex: "#7AB04A", darkHex: "#36511F" },
  });

  for (const c of CATEGORIES) {
    await prisma.category.upsert({ where: { id: c.id }, update: c, create: c });
  }

  let sort = 0;
  for (const it of ITEMS) {
    const data = {
      ...it,
      sort: sort++,
      ingredients: JSON.stringify(it.ingredients),
      allergens: JSON.stringify(it.allergens),
      tags: JSON.stringify(it.tags),
      sizes: JSON.stringify(it.sizes),
    };
    await prisma.item.upsert({ where: { id: it.id }, update: data, create: data });
  }

  const password = await bcrypt.hash("password", 10);
  const admin = await prisma.user.upsert({
    where: { email: "demo@pista.app" },
    update: { role: "admin" },
    create: { email: "demo@pista.app", name: "Maple Studios", password, role: "admin", points: 1240 },
  });

  // Sample customers
  const customerSeeds = [
    { email: "aarav@example.com", name: "Aarav Sharma", points: 320 },
    { email: "diya@example.com", name: "Diya Patel", points: 540 },
    { email: "kabir@example.com", name: "Kabir Rao", points: 90 },
  ];
  const customers = [];
  for (const c of customerSeeds) {
    customers.push(
      await prisma.user.upsert({
        where: { email: c.email },
        update: {},
        create: { ...c, password, role: "customer" },
      })
    );
  }

  // Discount codes
  for (const d of [
    { code: "WELCOME10", percent: 10 },
    { code: "PISTA15", percent: 15 },
    { code: "FESTIVE20", percent: 20, active: false },
  ]) {
    await prisma.discount.upsert({ where: { code: d.code }, update: {}, create: d });
  }

  // Sample orders across the last 14 days (only if none exist yet)
  const existingOrders = await prisma.order.count();
  if (existingOrders === 0) {
    const allItems = await prisma.item.findMany();
    const buyers = [admin, ...customers];
    const statuses = ["completed", "completed", "completed", "ready", "preparing"];
    const fulfilments = ["pickup", "dinein", "delivery"];
    const pick = (a) => a[Math.floor(Math.random() * a.length)];

    let made = 0;
    for (let d = 0; d < 14; d++) {
      const perDay = 1 + Math.floor(Math.random() * 4);
      for (let n = 0; n < perDay; n++) {
        const buyer = pick(buyers);
        const lineCount = 1 + Math.floor(Math.random() * 3);
        const chosen = [];
        for (let i = 0; i < lineCount; i++) {
          const it = pick(allItems);
          const qty = 1 + Math.floor(Math.random() * 2);
          chosen.push({ itemId: it.id, name: it.name, size: "Regular", unit: it.price, qty });
        }
        const subtotal = chosen.reduce((s, l) => s + l.unit * l.qty, 0);
        const tax = Math.round(subtotal * 0.05);
        const reward = Math.round(subtotal * 0.05);
        const total = subtotal + tax - reward;
        const createdAt = new Date(Date.now() - d * 86400000 - Math.floor(Math.random() * 80000000));
        await prisma.order.create({
          data: {
            userId: buyer.id,
            subtotal, tax, reward, total,
            fulfilment: pick(fulfilments),
            status: d === 0 ? pick(statuses) : "completed",
            createdAt,
            items: { create: chosen },
          },
        });
        made++;
      }
    }
    console.log(`  + generated ${made} sample orders`);
  }

  console.log(`Done: ${CATEGORIES.length} categories, ${ITEMS.length} items, ${1 + customerSeeds.length} users (admin: demo@pista.app / password).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
