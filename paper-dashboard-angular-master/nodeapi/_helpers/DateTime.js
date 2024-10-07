var DateTime = (exports.DateTime = {});

function getDate() {
  var date_format = new Date();
  return (
    date_format.getDate() +
    "-" +
    (date_format.getMonth() +
      1) +
    "-" +
    date_format.getFullYear()
  );
}

function getTime() {
  var date_format = new Date();
  return (
    date_format.getHours() +
    ":" +
    date_format.getMinutes() +
    1 +
    ":" +
    date_format.getSeconds()
  );
}

exports.DateTime.getDate = getDate;
exports.DateTime.getTime = getTime;