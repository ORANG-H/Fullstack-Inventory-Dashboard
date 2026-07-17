import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

let nextId = 4;
const items = [
  { id: 1, name: "Ryzen 7 7800X3D", type: "cpu", price: 399 },
  { id: 2, name: "RTX 4070 Super", type: "gpu", price: 599 },
  { id: 3, name: "Medkit", type: "utility", price: 45 }
];

app.get("/api/items", (_req, res) => {
  res.json(items);
});

app.post("/api/items", (req, res) => {
  const { name, type, price } = req.body ?? {};

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }

  if (!["cpu", "gpu", "weapon", "utility"].includes(type)) {
    return res.status(400).json({ error: "invalid type" });
  }

  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    return res.status(400).json({ error: "price must be a valid non-negative number" });
  }

  const item = {
    id: nextId++,
    name: name.trim(),
    type,
    price: numericPrice
  };

  items.push(item);
  return res.status(201).json(item);
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
