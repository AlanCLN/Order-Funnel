export function makeCSV(content) {
  let csv = "\ufeff";
  for (let value of content) {
    if (value === undefined) {
      continue;
    }
    value.forEach((item, i) => {
      if (!item && item !== "") {
        console.log(value);
      }
      let innerValue = item === null ? "" : item.toString();
      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) {
        result = `"${result}"`;
      }
      if (i > 0) {
        csv += ",";
      }
      csv += result;
    });
    csv += "\n";
  }
  return csv;
}

export function makeURL(output, extension) {
  let mimeType;

  if (extension === "csv") {
    mimeType = "text/csv;charset=utf-8;";
  } else if (extension === "pdf") {
    mimeType = "application/pdf";
  }

  const blob = new Blob([output], { type: mimeType });
  return URL.createObjectURL(blob);
}
