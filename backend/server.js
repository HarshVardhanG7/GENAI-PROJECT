require("dotenv").config()
const app = require("./src/app")
const express = require("express")
const connectDB = require("./src/config/database")


connectDB()

app.listen(3000,async ()=>{
    console.log("Server running on port 3000")
})
 