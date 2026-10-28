import { MongoClient } from 'mongodb';
const uri = 'mongodb+srv://gadgemitali2001_db_user:Mitali241@cluster0.bzbeme1.mongodb.net/?retryWrites=true&w=majority';
try {
  console.log('Connecting...');
  const c = await MongoClient.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('SUCCESS - MongoDB connected!');
  const dbs = await c.db().admin().listDatabases();
  console.log('Databases:', dbs.databases.map(d => d.name));
  await c.close();
} catch(e) {
  console.error('FAILED:', e.message);
  console.error('Code:', e.code);
  console.error('Name:', e.name);
}

