export default class LineItem {
  constructor(productName, quantity, price, setName, variant, category) {
    this.productName = productName;
    this.quantity = quantity;
    this.price = price;
    this.setName = setName;
    this.variant = variant;
    this.category = category;
  }
}
