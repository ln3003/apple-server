const express = require("express");
const router = express.Router();
const OrderModel = require("../models/order");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const PDFDocument = require("pdfkit");
const patch = require("path");

router.use((req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    next("error");
  }
});

SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey =
  "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";

router.post("/add-one-order", (req, res, next) => {
  const newOrder = new OrderModel(req);
  newOrder.addOrder();
  res.end();
  const total = req.body.cart.reduce((sum, x) => {
    return sum + x.quantity * Number(x.item.price);
  }, 0);
  const totalWithDot = total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  req.body.cart.map((x) => {
    x.item.price1 = x.item.price.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    x.item.total = (Number(x.item.price) * x.quantity)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return x;
  });
  new SibApiV3Sdk.TransactionalEmailsApi()
    .sendTransacEmail({
      subject: "Order Confirmation",
      sender: { email: "nghia@ngh.one", name: "Apple Shop" },
      replyTo: { email: "nghia@ngh.one", name: "Apple Shop" },
      to: [{ name: req.session.user.name, email: req.session.user.email }],
      htmlContent: `<html>
      <head>
        <style>
          body {
            background-color: black;
            color: white;
            font-family: "Courier New", Courier, monospace;
          }
          table {
            border: 2px solid white;
            border-collapse: collapse;
            text-align: center;
          }
          table th td {
            border: 2px solid white;
            padding: 10px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h1>Welcome {{params.user.name}}</h1>
        <p style="font-size: 16px; font-weight: bold">Phone: {{params.user.tel}}</p>
        <p style="font-size: 16px; font-weight: bold">Address: {{params.body.address}}</p>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Picture</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
          {% for x in params.body.cart %} 
          <tr>
          <td>{{x.item.name}}</td>
          <td><img src="{{x.item.img1}}" alt="{{x.item.name}}"></td>
          <td>{{x.item.price1}} VND</td>
          <td>{{x.quantity}}</td>
          <td>{{x.item.total}} VND</td>
          </tr>
          {% endfor %}
          </tbody>
        </table>
        <p style="font-size: 24px; font-weight: bold; margin: 0">Sum:</p>
        <p style="font-size: 24px; font-weight: bold; margin: 0">{{params.totalWithDot}} VND</p>
        <p style="font-size: 16px; font-weight: bold">Thank you!</p>
      </body>
    </html>
    `,
      params: {
        user: req.session.user,
        body: req.body,
        totalWithDot: totalWithDot,
      },
    })
    .then(
      function (data) {
        console.log(data);
      },
      function (error) {
        next(error);
      }
    );
});

router.get("/get-user-orders", (req, res, next) => {
  OrderModel.getOrder(req, (value) => {
    res.json(value);
  });
});

router.get("/get-all-orders", (req, res, next) => {
  if (req.session.user.role === "customer") {
    next("Only Admin and Support can access");
  }
  OrderModel.getAllOrders((value) => {
    res.json(value);
  });
});

router.post("/download-order", (req, res, next) => {
  OrderModel.getOrderByID(req, (order) => {
    const total = order.orderItem.reduce((sum, x) => {
      return sum + x.quantity * Number(x.item.price);
    }, 0);
    const totalWithDot = total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const fontPath = patch.join(__dirname, "../utilities/fonts/");
    const imagePath = patch.join(__dirname, "../images/");
    const doc = new PDFDocument({ size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);
    doc
      .font(`${fontPath}TheMonkey-Regular.ttf`)
      .fontSize(50)
      .text("Invoice", 250, 0);
    doc
      .font(`${fontPath}Roboto-BoldItalic.ttf`)
      .fontSize(24)
      .text(order.idUser.name, 100, 50);
    doc
      .font(`${fontPath}Roboto-BoldItalic.ttf`)
      .fontSize(24)
      .text(order.idUser.email, 100, 80);
    doc
      .font(`${fontPath}Roboto-BoldItalic.ttf`)
      .fontSize(24)
      .text(order.idUser.tel, 100, 110);
    doc
      .font(`${fontPath}Roboto-BoldItalic.ttf`)
      .fontSize(24)
      .text(order.address, 100, 140);
    doc
      .font(`${fontPath}Roboto-BoldItalic.ttf`)
      .fontSize(24)
      .text("Summary: " + totalWithDot + " VND", 100, 170);
    let y = 0;
    order.orderItem.forEach((x) => {
      const name = x.item.name.replace(/\s/g, "_");
      doc
        .image(`${imagePath}img1_${name}.jpg`, 0, 230 + y, {
          width: 200,
        })
        .font(`${fontPath}Roboto-Regular.ttf`)
        .fontSize(20)
        .text(
          x.item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") +
            " VND",
          210,
          310 + y
        )
        .text("Quantity: " + x.quantity, 210, 340 + y);
      doc
        .font(`${fontPath}Roboto-Bold.ttf`)
        .fontSize(24)
        .text(x.item.name, 210, 250 + y);
      y += 210;
    });

    doc.end();
  });
});

module.exports = router;
