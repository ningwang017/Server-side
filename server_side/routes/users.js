var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* I'm not 100% sure how to structure middleware and backend
so I kept all functions in this users.js */

/* handle login request if username and password match, generate a token */
router.post("/login", async function(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    res.status(400).json({
      error: true,
      message: "Request body imcomplete - email and password needed"
    });
    return;
  }
  const queryUsers = await req.db.from("users").select("*").where("username", "=", username);

  if(queryUsers.length === 0) {
    console.log("User does not exist");
    res.json({
      error: true,
      message: "User does not exist"
    });
    return;
  }

  const user = queryUsers[0];
  const match = await bcrypt.compare(password, user.hash);

  if(!match) {
    res.json({error: true, message: "Password does not match"});
    return;
  }
  const secretKey = "secret key"; // I kept this simple only for the purpose of this assignment
  const expires_in = 60*60;
  const exp = Date.now() + expires_in ;
  const token = jwt.sign({username, exp}, secretKey)
  res.json({token_type: "Bearer", token, expires_in});
})


/* handles register request, register user into the databse with username and hashed password */
router.post("/register", async function (req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    res.status(400).json({
      error: true,
      message: "Request body imcomplete - email and password needed"
    });
    return;
  }

  const queryUsers = await req.db.from("users").select("*").where("username", "=", username);
  if(queryUsers.length > 0) {
    console.log("User aleady exists");
    res.json({
      error: true,
      message: "User already exists"
    });
    return;
  }
  const saltRounds = 10;
  const hash = bcrypt.hashSync(password, saltRounds);
  await req.db.from("users").insert({username, hash});
  res.status(201).json({error: false, message: "Successfully instered user"});
});

/* checks if users is in database by decode the token in the request header
if token available set decoded username to middleware */
const authorize = (req, res, next) => {
  const authorization = req.headers.authorization
  let token = null;
  if (authorization && authorization.split(" ").length === 2) {
    token = authorization.split(" ")[1]
    const decoded = jwt.decode(token)
    req.username = decoded.username
    next()
  } else {
    console.log(authorization)
    res.status(401).json({error: true, message: "Unauthorized"})
    return
  }
}

/* handles add symbol request for authorized user*/
router.post("/addSymbol", authorize, async function (req, res, next) {
  const username = req.username
  const symbols = req.body.symbol
  console.log(symbols)

  if (!symbols) {
    res.status(400).json({
      error: true,
      message: "Request body imcomplete - symbol is needed"
    });
    return;
  }
  const querySymbol = await req.db.from("symbols").select("*").where("symbols","=",symbols,"AND","username", "=", username);
  if(querySymbol.length > 0) {
    res.json({
      error: true,
      message: "Symbol is already added"
    });
    return;
  }

  await req.db.from("symbols").insert({symbols, username});
  res.status(201).json({error: false, message: "Successfully instered symbol"});
})

/* handles get symbol request for authorized user, 
if the users has symbols saved in database, return a json with saved symbols */
router.post("/getSymbols", authorize, async function (req, res, next) {
  const username = req.username

    let watchList = await req.db.from("symbols").select("*").where("username", "=", username);
    console.log(watchList)
    if (watchList.length === 0) {
      res.json({
        error: true, 
        message: "You have no stock in your watch list"
      });
      return 
    }
    res.status(201).json({error: false, message: "Success", symbols: await watchList})
})

/* handles delete symbol request if no symbol matched return an error */
router.post("/deleteSymbol", authorize, async function (req, res, next) {
  const username = req.username;
  const symbol = req.body.symbol

  if (!symbol) {
    res.status(400).json({
      error: true,
      message: "Request body imcomplete - symbol is needed"
    });
    return;
  }

  let querySymbol = await req.db.from("symbols").select("symbols").where("symbols", "=", symbol, "AND", "username", "=", username);
  if (querySymbol.length ===0) {
    res.status(400).json({
      error: true,
      message: "symbol does not exist"
    });
    return
  } 

  console.log(querySymbol);

  await req.db.from("symbols").select("symbols").where("symbols", "=", symbol, "AND", "username", "=", username).del();
  res.status(201).json({error: false, message: "Successfully deleted symbol"});
})

module.exports = router;
