export default class LineItem {
  constructor(productName, quantity, price, setName, setCode, sku, variant, category) {
    this.productName = productName;
    this.quantity = quantity;
    this.price = price;
    this.setName = setName;
    this.setCode = setCode;
    this.sku = sku;
    this.variant = variant;
    this.category = category;
  }
}
