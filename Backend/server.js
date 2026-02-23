require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/db")

const port = process.env.PORT || 3000;

connectToDB()

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});