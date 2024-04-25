/**
 * JS实现可编辑的表格
 * 用法:EditTables(tb1,tb2,tb2,......);
 **/

//设置多个表格可编辑
function EditTables() {
  for (var i = 0; i < arguments.length; i++) {
    SetTableCanEdit(arguments[i]);
  }
}

//设置表格是可编辑的
function SetTableCanEdit(table) {
  for (var i = 1; i < table.rows.length; i++) {
    SetRowCanEdit(table.rows[i]);
  }
}

function SetRowCanEdit(row) {
  for (var j = 0; j < row.cells.length; j++) {
    //如果当前单元格指定了编辑类型，则表示允许编辑
    var editType = row.cells[j].getAttribute("EditType");
    if (!editType) {
      //如果当前单元格没有指定，则查看当前列是否指定
      editType = row.parentNode.rows[0].cells[j].getAttribute("EditType");
    }
    if (editType) {
      row.cells[j].onclick = function () {
        EditCell(this, null, row);
      };
    }
  }
}

//设置指定单元格可编辑
function EditCell(element, editType, editRow) {
  var editType = element.getAttribute("EditType");
  if (!editType) {
    //如果当前单元格没有指定，则查看当前列是否指定
    editType =
      element.parentNode.parentNode.rows[0].cells[
        element.cellIndex
      ].getAttribute("EditType");
  }

  switch (editType) {
    case "TextBox":
      CreateTextBox(element, element.innerHTML);
      break;
    default:
      break;
  }
}

//添加行
function AddOne() {
  var table = document.getElementById("tabProduct");
  var lastRow = table.rows[table.rows.length - 1];
  var newRow = lastRow.cloneNode(true);
  newRow.cells[0].innerHTML = "1-1";
  $(table.rows).each(function (index) {
    console.log(this.cells[0].innerHTML);
    if (/[0-9]-[0-9]/.test(this.cells[0].innerHTML))
      newRow.cells[0].innerHTML =
        "1-" +
        (Number(this.cells[0].innerHTML[this.cells[0].innerHTML.length - 1]) +
          1);
  });
  newRow.cells[1].innerHTML =
    '<button type="button" onclick="AddSubAA()">add </button>';
  // newRow.cells[1].setAttribute("EditType", "TextBox");
  newRow.cells[2].innerHTML = "";
  newRow.cells[3].innerHTML = "";
  newRow.cells[4].setAttribute("CalType", "second");
  if (newRow) table.tBodies[0].appendChild(newRow);
  SetRowCanEdit(newRow);
  return newRow;
}

function AddSubAA() {
  var table = document.getElementById("tabProduct");
  var lastRow = table.rows[table.rows.length - 1];
  var newRow = lastRow.cloneNode(true);
  newRow.cells[0].innerHTML =
    event.currentTarget.parentElement.parentElement.cells[0].innerHTML + "-1";
  newRow.cells[1].innerHTML = "";
  newRow.cells[1].setAttribute("EditType", "TextBox");
  newRow.cells[2].innerHTML = "";
  newRow.cells[2].setAttribute("name", "Amount");
  newRow.cells[2].setAttribute("EditType", "TextBox");
  newRow.cells[3].innerHTML = "";
  newRow.cells[3].setAttribute("name", "Price");
  newRow.cells[3].setAttribute("EditType", "TextBox");
  newRow.cells[4].innerHTML = "0";
  newRow.cells[4].setAttribute("Expression", "Amount*Price");
  newRow.cells[4].setAttribute("CalType", "first");
  if (newRow)
    table.tBodies[0].insertBefore(
      newRow,
      event.currentTarget.parentElement.parentElement.nextSibling,
    );
  // if (newRow) table.tBodies[0].appendChild(newRow);

  SetRowCanEdit(newRow);
  return newRow;
}
//为单元格创建可编辑输入框
function CreateTextBox(element, value) {
  //检查编辑状态，如果已经是编辑状态，跳过
  var editState = element.getAttribute("EditState");
  if (editState != "true") {
    //创建文本框
    var textBox = document.createElement("INPUT");
    textBox.type = "text";
    textBox.className = "EditCell_TextBox";

    //设置文本框当前值
    if (!value) {
      value = element.getAttribute("Value");
    }
    textBox.value = value;

    //设置文本框的失去焦点事件
    textBox.onblur = function () {
      CancelEditCell(this.parentNode, this.value);
    };
    //向当前单元格添加文本框
    ClearChild(element);
    element.appendChild(textBox);
    textBox.focus();
    textBox.select();

    //改变状态变量
    element.setAttribute("EditState", "true");
    element.parentNode.parentNode.setAttribute(
      "CurrentRow",
      element.parentNode.rowIndex,
    );
  }
}

//取消单元格编辑状态
function CancelEditCell(element, value, text) {
  element.setAttribute("Value", value);
  if (text) {
    element.innerHTML = text;
  } else {
    element.innerHTML = value;
  }
  element.setAttribute("EditState", "false");

  //检查是否有公式计算
  CheckExpression(element.parentNode);
}

//清空指定对象的所有字节点
function ClearChild(element) {
  element.innerHTML = "";
}

//提取表格的值,JSON格式
function GetTableData(table) {
  var tableData = new Array();
  alert("行数：" + table.rows.length);
  for (var i = 1; i < table.rows.length; i++) {
    tableData.push(GetRowData(tabProduct.rows[i]));
  }

  return tableData;
}
//提取指定行的数据，JSON格式
function GetRowData(row) {
  var rowData = {};
  for (var j = 0; j < row.cells.length; j++) {
    name = row.cells[j].getAttribute("Name");
    if (name && name != "null") {
      var value = row.cells[j].getAttribute("Value");
      if (!value) {
        value = row.cells[j].innerHTML;
      }

      rowData[name] = value;
    }
  }
  //alert("ProductName:" + rowData.ProductName);
  //或者这样：alert("ProductName:" + rowData["ProductName"]);
  return rowData;
}

//检查当前数据行中需要运行的字段
function CheckExpression(row) {
  // for (var j = 0; j < row.cells.length; j++) {
  expn = row.cells[4].getAttribute("Expression");
  //如指定了公式则要求计算
  if (expn) {
    var result = Expression(row, expn);
    row.cells[4].innerHTML = Expression(row, expn);
    CalAll();
  }
  // }
}
function CalAll() {
  var fistArr = [],
    secondArr = [];
  if ($("td[CalType='first']").length > 0) {
    $("td[CalType='first']").each((index, element) => {
      fistArr.push(Number(element.innerHTML));
    });
    $("td[CalType='second']")[0].innerHTML = fistArr.reduce(
      (previousValue, currentValue) => previousValue + currentValue,
    );
    $("td[CalType='third']")[0].innerHTML = $(
      "td[CalType='second']",
    )[0].innerHTML;
    $("td[CalType='forth']")[0].innerHTML = $(
      "td[CalType='third']",
    )[0].innerHTML;
  }
  $("td[CalType='qita']")[0].innerHTML = $("td[CalType='mache']")[0].innerHTML;
  $("td[CalType='wuliu']")[0].innerHTML =
    Number($("td[CalType='shengji']")[0].innerHTML) +
    Number($("td[CalType='qita']")[0].innerHTML);
  $("td[CalType='chengben']")[0].innerHTML =
    Number($("td[CalType='wuliu']")[0].innerHTML) +
    Number($("td[CalType='forth']")[0].innerHTML);
  $("td[CalType='notax']")[0].innerHTML =
    Number($("td[CalType='wuliu']")[0].innerHTML) +
    Number($("td[CalType='forth']")[0].innerHTML);
  $("td[CalType='total']")[0].innerHTML =
    Number($("td[CalType='wuliu']")[0].innerHTML) +
    Number($("td[CalType='forth']")[0].innerHTML);
}
//计算需要运算的字段
function Expression(row, expn) {
  var rowData = GetRowData(row);
  //循环代值计算
  for (var j = 0; j < row.cells.length; j++) {
    name = row.cells[j].getAttribute("Name");
    if (name && name != "null") {
      var reg = new RegExp(name, "i");
      expn = expn.replace(reg, rowData[name].replace(/\,/g, ""));
    }
  }
  return eval(expn);
}
