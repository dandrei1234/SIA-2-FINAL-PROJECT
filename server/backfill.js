const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://ned:ned@cluster0.kdgy8kh.mongodb.net/Admin-SchoolOrg?appName=Cluster0')
  .then(async () => {
    const db = mongoose.connection.db;
    const attendances = await db.collection('attendances').find({}).toArray();
    const members = await db.collection('members').find({}).toArray();
    let updated = 0;
    
    for (const att of attendances) {
      const member = members.find(m => m._id.toString() === att.member.toString());
      if (member) {
        await db.collection('attendances').updateOne(
          { _id: att._id },
          { $set: { memberName: member.firstName + ' ' + member.lastName, studentId: member.studentId } }
        );
        updated++;
      }
    }
    
    console.log('Updated ' + updated + ' records.');
    process.exit(0);
  })
  .catch(console.error);
