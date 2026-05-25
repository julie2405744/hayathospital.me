const mongoose = require('mongoose');

const uri = 'mongodb://user1:user123@ac-hdxmbra-shard-00-00.mfrnhto.mongodb.net:27017,ac-hdxmbra-shard-00-01.mfrnhto.mongodb.net:27017,ac-hdxmbra-shard-00-02.mfrnhto.mongodb.net:27017/hayat?ssl=true&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(uri)
  .then(() => {
    console.log('Connected to MongoDB via direct seed list!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err.message);
    process.exit(1);
  });
