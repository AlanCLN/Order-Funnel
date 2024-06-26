import { makeCSV, makeURL } from "./file_scripts";
import Pullsheet from "../classes/Pullsheet";

export function createYGOPullsheetUrl(ordersData) {
  let allVariantPullsheets = {};

  allVariantPullsheets["Near Mint"] = new Pullsheet("Near Mint");
  allVariantPullsheets["Lightly Played"] = new Pullsheet("Lightly Played");
  allVariantPullsheets["Moderately Played"] = new Pullsheet("Moderately Played");
  allVariantPullsheets["Heavily Played"] = new Pullsheet("Heavily Played");
  allVariantPullsheets["Damaged"] = new Pullsheet("Damaged");
  allVariantPullsheets["Other"] = new Pullsheet("Other");
  allVariantPullsheets["No Variant"] = new Pullsheet("No Variant");

  for (let order of ordersData) {
    for (let line_item of order.line_items) {
      if (!line_item) {
        continue;
      }

      const lineItemVendor = line_item.vendor;

      if (lineItemVendor === "Yu-Gi-Oh!") {
        let productName = line_item.name;
        let qty = line_item.quantity;
        let setName = findSetName(line_item.sku);
        let variant = findVariant(line_item.variant_title);

        let lineItem = {
          productName,
          qty,
          setName,
        };
        let pullsheet_instance = allVariantPullsheets[variant];

        pullsheet_instance.addLineItem(lineItem);
      }
    }
  }

  sortPullsheets(allVariantPullsheets, "Yu-Gi-Oh!");
  const combinedPullsheet = combineAllPullsheetContent(allVariantPullsheets);

  const csvString = makeCSV(combinedPullsheet);
  const url = makeURL(csvString, "csv");
  return url;
}

export function createOthersPullsheetUrl(ordersData) {
  let allVariantPullsheets = {};

  allVariantPullsheets["Near Mint"] = new Pullsheet("Near Mint");
  allVariantPullsheets["Lightly Played"] = new Pullsheet("Lightly Played");
  allVariantPullsheets["Moderately Played"] = new Pullsheet("Moderately Played");
  allVariantPullsheets["Heavily Played"] = new Pullsheet("Heavily Played");
  allVariantPullsheets["Damaged"] = new Pullsheet("Damaged");
  allVariantPullsheets["Other"] = new Pullsheet("Other");
  allVariantPullsheets["No Variant"] = new Pullsheet("No Variant");

  for (let order of ordersData) {
    for (let line_item of order.line_items) {
      if (!line_item) {
        continue;
      }

      const lineItemVendor = line_item.vendor;

      if (lineItemVendor === "Yu-Gi-Oh!") {
        continue;
      }

      let productName = line_item.name;
      let qty = line_item.quantity;
      let setName = findSetCode(line_item.sku);
      let variant = findVariant(line_item.variant_title);

      let lineItem = {
        productName,
        qty,
        setName,
      };
      let pullsheet_instance = allVariantPullsheets[variant];

      pullsheet_instance.addLineItem(lineItem);
    }
  }

  sortPullsheets(allVariantPullsheets, "others");
  const combinedPullsheet = combineAllPullsheetContent(allVariantPullsheets);

  const csvString = makeCSV(combinedPullsheet);
  const url = makeURL(csvString, "csv");
  return url;
}

function combineAllPullsheetContent(allVariantPullsheets) {
  let headers = ["qty", "setName", "productName", "variant"];
  let content = [headers];

  for (let pullsheet_instance of Object.values(allVariantPullsheets)) {
    for (let lineItem of pullsheet_instance.sortedContent) {
      let row = [];

      for (let header of headers) {
        row.push(lineItem[header]);
      }

      content.push(row);
    }
    content.push([""]);
  }

  return content;
}

function sortPullsheets(allVariantPullsheets, vendor) {
  for (let pullsheet_instance of Object.values(allVariantPullsheets)) {
    pullsheet_instance.sortContent(vendor);
  }
}

export function findSetCode(sku) {
  const split_sku = sku.split("-");

  return split_sku.length >= 2 ? [split_sku[0], split_sku[1]].join("-") : sku;
}

export function findSetName(sku) {
  const split_sku = sku.split("-");
  return split_sku[0];
}

export function findVariant(variant) {
  if (!variant) return "No Variant";

  const conditions = [
    "Near Mint",
    "Lightly Played",
    "Moderately Played",
    "Heavily Played",
    "Damaged",
  ];

  for (const condition of conditions) {
    if (variant.includes(condition)) {
      return condition;
    }
  }

  return "Other";
}
