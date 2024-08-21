const cors = require("cors");
var express = require("express")
const path = require("path");
const flash = require("express-flash");
require("dotenv").config();
const bodyParser = require("body-parser");
const router =express();
const Routesx = require("./routes");
router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.get("/", (req, res) => res.send("Express on Vercel"));
router.use('/api', Routesx);

router.use(flash());
router.use(function (err, req, res, next) {res.status(err.status || 500);res.status(500).json({ message: err.message, error: req.app.get('env') === 'development' ? err : {} });});
router.listen(process.env.PORT, () => {console.log(`Server running on port ${process.env.PORT}`);});