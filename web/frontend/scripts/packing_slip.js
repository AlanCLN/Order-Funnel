import { makeCSV, makeURL } from "./file_scripts";
import { findSetName, findVariant } from "./pullsheet";
import Order from "../classes/Order";
import LineItem from "../classes/LineItem";
import PackingSlip from "../classes/PackingSlip";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function createPackingSlipUrl(ordersData) {
  const packingSlip = parseOrdersData(ordersData);

  // const pdfDoc = await PDFDocument.create();
  // const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  // const page = pdfDoc.addPage();
  // const { width, height } = page.getSize();
  // const fontSize = 30;
  // page.drawText("Creating PDFs in JavaScript is awesome!", {
  //   x: 50,
  //   y: height - 4 * fontSize,
  //   size: fontSize,
  //   font: timesRomanFont,
  //   color: rgb(0, 0.53, 0.71),
  // });

  // const pdfBytes = await pdfDoc.save();
  // const url = makeURL(pdfBytes, "pdf");

  // return url;
}

function parseOrdersData(ordersData) {
  const packingSlip = new PackingSlip();

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

      const setName = findSetName(line_item.sku);
      const variant = findVariant(line_item.variant_title);

      const newLineItem = new LineItem(
        lineItemName,
        lineItemQuantity,
        lineItemPrice,
        setName,
        variant
      );

      orderInstance.addLineItems(newLineItem);
      orderInstance.addQuantity(lineItemQuantity);
    }
    packingSlip.addOrder(orderInstance);
    orderInstance.sort();
  }

  return packingSlip;
}
