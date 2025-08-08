const express = require('express');
const amqp = require('amqplib');

const app = express();
const port = 4001;

const products = [
  { id: 1, name: "Laptop", price: 999 },
  { id: 2, name: "Phone", price: 499 },
  { id: 3, name: "Tablet", price: 299 }
];

app.get('/', (req, res) => {
  res.json({ message: "Product service is running" });
});

app.get('/products', (req, res) => {
  res.json(products);
});

async function listenToStockEvents() {
  const queue = 'stock_events';
  const conn = await amqp.connect('amqp://localhost');
  const channel = await conn.createChannel();

  await channel.assertQueue(queue);

  console.log("Waiting for stock events...");
  channel.consume(queue, msg => {
    if (msg !== null) {
      const content = msg.content.toString();
      console.log("Received stock event:", content);
      channel.ack(msg);
      // You can add additional logic here (e.g., reorder)
    }
  });
}

listenToStockEvents().catch(console.error);

app.listen(port, () => {
  console.log(`Product service listening at http://localhost:${port}`);
});
