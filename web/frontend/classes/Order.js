export default class Order {
  constructor(
    orderId,
    shippingAddress,
    billingAddress,
    note,
    tags,
    totalLineItemsPrice,
    totalDiscounts,
    totalTax,
    subtotal
  ) {
    this.orderId = orderId;
    this.shippingAddress = shippingAddress;
    this.billingAddress = billingAddress;
    this.note = note;
    this.tags = tags;
    this.totalLineItemsPrice = totalLineItemsPrice;
    this.totalDiscounts = totalDiscounts;
    this.totalTax = totalTax;
    this.subtotal = subtotal;

    this._lineItems = [];
    this._sortedLineItems = [];
    this._totalQuantity = 0;
  }

  addLineItems(lineItemInstance) {
    this._lineItems.push(lineItemInstance);
  }

  getLineItems() {
    return this._lineItems;
  }

  getSortedLineItems() {
    return this._sortedLineItems;
  }

  addQuantity(lineItemQuantity) {
    this._totalQuantity += lineItemQuantity;
  }

  getTotalQuantity() {
    return this._totalQuantity;
  }

  getTotalLineItemsPrice() {
    return this.totalLineItemsPrice;
  }

  requireTracking() {
    return this.subtotal >= 25 || this._totalQuantity >= 30;
  }

  sort() {
    const variants = {
      "Near Mint": [],
      "Lightly Played": [],
      "Moderately Played": [],
      "Heavily Played": [],
      Damaged: [],
      Other: [],
      "No Variant": [],
    };

    for (let line_item of this._lineItems) {
      const variant = line_item.variant;
      variants[variant].push(line_item);
    }

    function sortBySet(lineItemA, lineItemB) {
      if (lineItemA.setName < lineItemB.setName) {
        return -1;
      } else if (lineItemA.setName > lineItemB.setName) {
        return 1;
      } else {
        if (lineItemA.productName < lineItemB.productName) {
          return -1;
        } else if (lineItemA.productName > lineItemB.productName) {
          return 1;
        } else {
          return 0;
        }
      }
    }

    for (const key of Object.keys(variants)) {
      variants[key].sort(sortBySet);
    }

    let sortedLineItems = [];

    for (const variantArray of Object.values(variants)) {
      sortedLineItems = sortedLineItems.concat(variantArray);
    }

    this._sortedLineItems = sortedLineItems;
  }
}
