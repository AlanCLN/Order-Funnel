export default class PackingSlip {
  constructor() {
    this._orders = [];
  }

  addOrder(order_instance) {
    this._orders.push(order_instance);
  }

  getOrders() {
    return this._orders;
  }
}
