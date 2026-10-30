import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // در محیط توسعه، کلاینت را در گلوبال ذخیره می‌کنیم تا با هر بار رفرش سرور، کانکشن‌های تکراری ساخته نشود
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // در محیط پروداکشن (مثل Vercel) نیازی به گلوبال نیست
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// اکسپورت به صورت دیفالت
export default clientPromise;