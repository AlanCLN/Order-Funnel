// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || "3000", 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

// All endpoints after this point will require an active session

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.get("/api/orders", async (_req, res) => {
  console.log(res.locals);

  const ordersData = await shopify.api.rest.Order.all({
    session: res.locals.shopify.session,
    fulfillment_status: "unfulfilled",
    limit: 250,
    fields:
      "billing_address,current_subtotal_price,current_total_discounts,current_total_price,current_total_tax,fulfillment_status,id,line_items,name,note,order_number,shipping_address,subtotal_price,tags,total_discounts,total_line_items_price,total_price,total_tax",
  });

  res.status(200).send(ordersData);
});

app.post("/api/fulfillments", async (req, res) => {
  const fulfillment = new shopify.api.rest.Fulfillment({
    session: res.locals.shopify.session,
  });
});

app.post("/api/fulfillment/:orderId", async (req, res) => {
  const session = res.locals.shopify.session;

  const orderId = parseInt(req.params.orderId);

  const fulfillmentOrder = await shopify.api.rest.FulfillmentOrder.all({
    session: session,
    order_id: orderId,
  });

  const fulfillmentIDs = fulfillmentOrder.data.map(
    (fulfillmentOrderObject) => fulfillmentOrderObject.id
  );

  const fulfillmentLineItems = [];
  for (let fulfillmentID of fulfillmentIDs) {
    fulfillmentLineItems.push({
      fulfillment_order_id: fulfillmentID,
    });
  }

  const fulfillment = new shopify.api.rest.Fulfillment({
    session: session,
  });

  fulfillment.line_items_by_fulfillment_order = fulfillmentLineItems;

  await fulfillment.save({
    update: true,
  });
  res.status(200).send(fulfillment);
});

app.put("/api/order/:orderId", async (req, res) => {
  const orderId = req.params.orderId;

  const order = await shopify.api.rest.Order.find({
    session: res.locals.shopify.session,
    id: orderId,
  });

  if (order) {
    order.note = "Testing note";

    await order.save({
      update: true,
    });
    res.status(200).send(order);
  } else {
    res.status(404).send("No order found");
  }
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
