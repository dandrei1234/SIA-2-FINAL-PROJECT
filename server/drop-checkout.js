const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://ned:ned@cluster0.kdgy8kh.mongodb.net/Admin-SchoolOrg?appName=Cluster0')
  .then(async () => {
    const db = mongoose.connection.db;
    const res = await db.collection('attendances').updateMany({}, { $unset: { checkOut: "" } });
    console.log('Removed checkOut from ' + res.modifiedCount + ' records.');
    process.exit(0);
  })
  .catch(console.error);
