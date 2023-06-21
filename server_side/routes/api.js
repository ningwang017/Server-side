const express = require("express");
const router = express.Router();

// router.get("/city", async function (req, res, next) {
//     try{
//         let row = req.db.from("city").select("name", "district");
//         res.json({Error: false, Message: "Success", city: await row})
//     }catch(err) {
//         console.log(err);
//         res.json({Error: true, Message: "Error in MySQL query"})
//     }
// });


// router.get("/city/:c", async function (req, res, next) {
//     try{
//         let row = req.db.from("city").select("name", "district");
//         row = row.where("CountryCode", "=", req.params.c);
//         res.json({Error: false, Message: "Success", city: await row})
//     }catch(err) {
//         console.log(err);
//         res.json({Error: true, Message: "Error in MySQL query"})
//     }
// });

module.exports = router;