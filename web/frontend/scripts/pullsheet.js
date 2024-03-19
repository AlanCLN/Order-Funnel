import { makeCSV, makeURL } from "./file_scripts";
import Pullsheet from "../classes/Pullsheet";

export function createPullsheetUrl(ordersData) {
  let allVariantPullsheets = {};

  allVariantPullsheets["Near Mint"] = new Pullsheet("Near Mint");
  allVariantPullsheets["Lightly Played"] = new Pullsheet("Lightly Played");
  allVariantPullsheets["Moderately Played"] = new Pullsheet("Moderately Played");
  allVariantPullsheets["Heavily Played"] = new Pullsheet("Heavily Played");
  allVariantPullsheets["Damaged"] = new Pullsheet("Damaged");
  allVariantPullsheets["Other"] = new Pullsheet("Other");
  allVariantPullsheets["None"] = new Pullsheet("None");

  for (let order of ordersData) {
    for (let line_item of order.line_items) {
      if (!line_item) {
        continue;
      }

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

  sortPullsheets(allVariantPullsheets);
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
  }

  return content;
}

function sortPullsheets(allVariantPullsheets) {
  for (let pullsheet_instance of Object.values(allVariantPullsheets)) {
    pullsheet_instance.sortContent();
  }
}

function findSetName(sku) {
  const split_sku = sku.split("-");
  return split_sku[0];
}

function findVariant(variant) {
  if (!variant) return "None";

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
