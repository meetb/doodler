function addColumn(tblId)
{
    var tblHeadObj = document.getElementById(tblId).tHead;
    for (var h=0; h<tblHeadObj.rows.length; h++) {
        var newTH = document.createElement('th');
        tblHeadObj.rows[h].appendChild(newTH);
        newTH.innerHTML = '<textarea cols="1" rows="1" style="resize: none"/>'
    }

    var tblBodyObj = document.getElementById(tblId).tBodies[0];
    for (var i=0; i<tblBodyObj.rows.length; i++) {
        var newCell = tblBodyObj.rows[i].insertCell(-1);
        newCell.innerHTML = '<textarea />'
    }
}
function deleteColumn(tblId)
{
    var allRows = document.getElementById(tblId).rows;
    for (var i=0; i<allRows.length; i++) {
        if (allRows[i].cells.length > 1) {
            allRows[i].deleteCell(-1);
        }
    }
}
function addRow(tblId)

{
  var tbl = document.getElementById(tblId);
  console.log(tbl, tblId);
  var width = tbl.rows[0].cells.length
  var lastRow = tbl.rows.length;
  // if there's no header row in the table, then iteration = lastRow + 1
  var iteration = lastRow;
  var row = tbl.insertRow(lastRow);
  
  // left cell
  for (var i = 0; i < width; i++){
      var cellLeft = row.insertCell(0);
      var textNode = document.createElement("textarea");
      textNode.cols = "1";
      textNode.rows = "1";
      textNode.style.resize = "none";
      textNode.style.font="bold";
      cellLeft.appendChild(textNode);
  }
  
}
function deleteRow(tblId)
{
  var tbl = document.getElementById(tblId);
  var lastRow = tbl.rows.length;
  if (lastRow > 2) tbl.deleteRow(lastRow - 1);
}
