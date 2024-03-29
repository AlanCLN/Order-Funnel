import { makeCSV, makeURL } from "./file_scripts";
import { findSetName, findVariant } from "./pullsheet";
import Order from "../classes/Order";
import LineItem from "../classes/LineItem";
import PackingSlip from "../classes/PackingSlip";
import jsPDF from "jspdf";

export async function createPackingSlipUrl(order_instances) {
  // Create a new jsPDF instance
  const doc = new jsPDF({ putOnlyUsedFonts: true });
  let firstPage = true;
  const leftMargin = 15;
  const offsetY = 10;

  for (const order_instance of order_instances) {
    // jsPDF creates the first page automatically. We only add a new page after we utilize the first page.
    if (firstPage === false) {
      doc.addPage();
    } else {
      firstPage = false;
    }

    const addressName = order_instance.shippingAddress?.name || "";
    const address1 = order_instance.shippingAddress?.address1 || "";
    const address2 = order_instance.shippingAddress?.address2 || "";
    const city = order_instance.shippingAddress?.city || "";
    const provinceCode = order_instance.shippingAddress?.province_code || "";
    const zipCode = order_instance.shippingAddress?.zip || "";

    const orderId = order_instance.orderId;
    doc.setFontSize(13);
    doc.text(
      [
        addressName,
        `${address1} ${address2}`,
        `${city} ${provinceCode}, ${zipCode}`,
        "",
        "",
        `Order ID: #${orderId}`,
      ],
      leftMargin,
      20 + offsetY
    );
    const headers = [
      {
        id: "qty",
        name: "qty",
        prompt: "QTY",
        width: 25,
        align: "center",
        padding: 0,
      },
      {
        id: "name",
        name: "name",
        prompt: "Product Name",
        width: 180,
        align: "left",
        padding: 0,
      },
      {
        id: "price",
        name: "price",
        prompt: "Price",
        width: 35,
        align: "center",
        padding: 0,
      },
    ];

    const tableConfig = {
      fontSize: 11,
      headerBackgroundColor: "#FFFFFF",
    };

    const data = [];
    let currentVariant = "";

    for (let lineItemInstance of order_instance.getSortedLineItems()) {
      const variant = lineItemInstance.variant;

      if (currentVariant !== variant) {
        data.push({ qty: " ", name: `${variant}`, price: " " });
        currentVariant = variant;
      }

      const row = {
        qty: `${lineItemInstance.quantity}`,
        name: `${lineItemInstance.productName}`,
        price: `${lineItemInstance.price}`,
      };
      data.push(row);
    }

    doc.table(leftMargin, 55 + offsetY, data, headers, tableConfig);
    doc.cell(
      leftMargin,
      0,
      180,
      10,
      `Total Quantity: ${order_instance.getTotalQuantity()}`,
      1,
      "left"
    );
    doc.cell(
      leftMargin,
      0,
      180,
      10,
      `Total Line Item Price: ${order_instance.getTotalLineItemsPrice()}`,
      2,
      "left"
    );
  }

  // Save the PDF as a Byte and convert it to a URL
  const pdfBytes = doc.output("arraybuffer");
  const url = makeURL(pdfBytes, "pdf");

  return url;
}

export function parseOrdersData(ordersData) {
  let orders = [];

  for (let order of ordersData) {
    const orderId = order.order_number;
    const shippingAddress = order.shipping_address;
    const billingAddress = order.billing_address;
    const note = order.note;
    const tags = order.tags;
    const totalLineItemsPrice = order.total_line_items_price;
    const totalDiscounts = order.total_discounts;
    const totalTax = order.total_tax;
    const subtotal = order.subtotal_price;

    const orderInstance = new Order(
      orderId,
      shippingAddress,
      billingAddress,
      note,
      tags,
      totalLineItemsPrice,
      totalDiscounts,
      totalTax,
      subtotal
    );

    for (let line_item of order.line_items) {
      const lineItemName = line_item.name;
      const lineItemQuantity = line_item.quantity;
      const lineItemPrice = line_item.price;

      const category = line_item.vendor === "Yu-Gi-Oh!" ? "Yu-Gi-Oh!" : "Other";
      const setName = findSetName(line_item.sku);
      const variant = findVariant(line_item.variant_title);

      const newLineItem = new LineItem(
        lineItemName,
        lineItemQuantity,
        lineItemPrice,
        setName,
        variant,
        category
      );

      orderInstance.addLineItems(newLineItem);
      orderInstance.addQuantity(lineItemQuantity);
    }
    // packingSlip.addOrder(orderInstance);
    orderInstance.sort();
    orders.push(orderInstance);
  }

  return orders;
}
