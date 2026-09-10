// Run with: npm run seed
// Creates a demo admin account, a constituency, an ongoing election and 3 candidates.
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Election = require('./models/Election');
const Candidate = require('./models/Candidate');
const Constituency = require('./models/Constituency');

(async () => {
  await connectDB();

  const adminEmail = 'admin@vms.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: 'admin123',
      role: 'admin',
    });
    console.log('✅ Admin created -> admin@vms.com / admin123');
  } else {
    console.log('ℹ️  Admin already exists');
  }

  let constituency = await Constituency.findOne({ name: 'Main Campus' });
  if (!constituency) {
    constituency = await Constituency.create({ name: 'Main Campus' });
  }

  let election = await Election.findOne({ title: '2026 Student Government General Election' });
  if (!election) {
    const now = new Date();
    election = await Election.create({
      title: '2026 Student Government General Election',
      description: 'Annual general election for student government representatives.',
      startDate: new Date(now.getTime() - 60 * 60 * 1000), // started 1h ago -> ongoing
      endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // ends in 24h
      createdBy: admin._id,
    });

    await Candidate.insertMany([
      { name: 'Ayesha Rahman', party: 'Progress Alliance', position: 'President', election: election._id, constituency: constituency._id },
      { name: 'Tanvir Hasan', party: 'Unity Forum', position: 'President', election: election._id, constituency: constituency._id },
      { name: 'Farzana Akter', party: 'Independent', position: 'President', election: election._id, constituency: constituency._id },
    ]);
    console.log('✅ Sample election + candidates created');
  } else {
    console.log('ℹ️  Sample election already exists');
  }

  console.log('🎉 Seeding complete');
  process.exit(0);
})();
