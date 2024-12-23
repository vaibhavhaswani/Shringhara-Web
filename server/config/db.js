const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/Shringhara", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useCreateIndex: true, // You can remove this line if you're using MongoDB version 5.x or later
})
  .then(() => {
    console.log("Database Connected Successfully");
  })
  .catch((err) => {
    console.log("Database Not Connected", err);
  });