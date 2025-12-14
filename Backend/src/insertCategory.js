const { MongoClient } = require("mongodb");

async function insertCategories() {
  const uri = process.env.MOGODB_URI// Replace with your MongoDB URI
  const client = new MongoClient(uri);

  const categories = [
    { name: "All Categories", slug: "all-categories" },
    { name: "Food & Snacks", slug: "food-snacks" },
    { name: "Beauty & Personal Care", slug: "beauty-personal-care" },
    { name: "Fashion & Clothing", slug: "fashion-clothing" },
    { name: "electronics", slug: "electronics" },
    { name: "computers", slug: "computers" },
    { name: "mobile-phones", slug: "mobile-phones" },
    { name: "audio", slug: "audio" },
    { name: "Handmade & Crafts", slug: "handmade-crafts" }
  ];

  const categoriesWithDates = categories.map(category => ({
    ...category,
    createdDate: new Date(),
    updatedDate: new Date(),
  }));

  try {
    await client.connect();
    const database = client.db("ListUP"); // Replace with your DB name
    const collection = database.collection("Category"); // Replace with your collection name

    const result = await collection.insertMany(categoriesWithDates);
    console.log(`${result.insertedCount} documents were inserted.`);
  } finally {
    await client.close();
  }
}

insertCategories().catch(console.error);
