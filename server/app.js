const express = require("express");
const bodyparser = require("body-parser");
const path = require("path");
const ejs = require("ejs");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const app = express();
const port = 3001;
app.set("view engine", "ejs");
app.use("views", express.static(path.join(__dirname, "/views")));

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

// Razorpay instance with your credentials
const razorpay = new Razorpay({
  key_id: "rzp_test_j3DQPkSLOIfTvT", // Replace with your Razorpay Key ID
  key_secret: "ovso67ZzFkT7FoTBXush8SKc", // Replace with your Razorpay Key Secret
});
app.get("/", (req, res) => {
  res.render("index");
});

//payment intigration
app.post("/create-order", async (req, res) => {
  const { name, email, mobile, amount, course } = req.body;

  //step-2
  const options = {
    amount: amount * 100, // Convert amount to paise
    currency: "INR",
    receipt: "receipt#1",
  };

  try {
    const order = await razorpay.orders.create(options);
    console.log({
      name,
      email,
      mobile,
      amount,
      course,
      order_id: order.id,
    });
    res.json({
      key: "rzp_test_j3DQPkSLOIfTvT", // Send key to the frontend
      amount: order.amount,
      currency: order.currency,
      id: order.id,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Route to verify Razorpay payment signature
app.post("/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const key_secret = "ovso67ZzFkT7FoTBXush8SKc";

  const generated_signature = crypto
    .createHmac("sha256", key_secret)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    res.json({ status: "success", message: "Payment verified successfully" });
  } else {
    res.status(400).json({ status: "failed", message: "Invalid signature" });
  }
});

//Start The Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
