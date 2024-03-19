export default class Pullsheet {
  constructor(variant) {
    this.variant = variant;
    this.content = {};
    this.sortedContent = [];
  }

  addLineItem({ productName, qty, setName }) {
    if (productName in this.content && this.content[productName]["setName"] === setName) {
      this.content[productName]["qty"] += qty;
    } else {
      this.content[productName] = {
        qty: qty,
        setName: setName,
        variant: this.variant,
      };
    }
  }

  sortContent() {
    let contentsArray = [];

    for (let productName of Object.keys(this.content)) {
      let qty = this.content[productName]["qty"];
      let setName = this.content[productName]["setName"];
      let variant = this.variant;

      contentsArray.push({ productName, qty, setName, variant });
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

    contentsArray.sort(sortBySet);
    this.sortedContent = contentsArray;
  }

  isEmpty() {
    return Object.keys(this.content).length === 0;
  }

  isNotEmpty() {
    return Object.keys(this.content).length > 0;
  }
}
