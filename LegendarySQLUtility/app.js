/// <reference path="scripts/typings/jquery/jquery.d.ts" />
"use strict";
//Thanks: http://stackoverflow.com/questions/6014702/how-do-i-detect-shiftenter-and-generate-a-new-line-in-textarea?lq=1
function getCaret(el) {
    if (el.selectionStart) {
        return el.selectionStart;
    } else if (document.selection) {
        el.focus();

        var r = document.selection.createRange();
        if (!r) {
            return 0;
        }

        var re = el.createTextRange(), rc = re.duplicate();
        re.moveToBookmark(r.getBookmark());
        rc.setEndPoint('EndToStart', re);

        return rc.text.length;
    }
    return 0;
}

function strReplace(inputString, needle, replacement) {
    // from http://stackoverflow.com/questions/1967119/why-does-javascript-replace-only-first-instance-when-using-replace
    return inputString.split(needle).join(replacement || "");
}

function listToValuesClause() {
    var fieldDelimiter = getFieldDelimiter();
    var lineItems = strReplace(getInputText(), "\r", "").split("\n");
    var result = "";
    for (var i = 0; i < lineItems.length; i++) {
        if (lineItems[i].length > 0) {
            //todo: refactor to not allow jaggy rows.
            if (lineItems[i].indexOf(fieldDelimiter) == -1) {
                result += "('" + lineItems[i] + "'),\n";
            } else {
                var fields = lineItems[i].split(fieldDelimiter);
                result += "('";
                for (var fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
                    result += fields[fieldIndex];
                    if (fieldIndex + 1 < fields.length) {
                        result += "','";
                    }
                }
                result += "')" + (i + 1 < lineItems.length ? "," : "") + "\n";
            }
        }
    }
    setOutputText(result);
}

function getInputText() {
    var inputTextArea = document.getElementById("inputText");
    return inputTextArea.value;
}

function setOutputText(theTextValue) {
    var outputTextArea = document.getElementById("outputText");
    outputTextArea.value = theTextValue;
}

function listToColumnHeaders() {
    var fieldDelimiter = getFieldDelimiter();
    var lineItems = strReplace(getInputText(), "\r", "").split("\n");
    var result = "";
    for (var i = 0; i < lineItems.length; i++) {
        if (lineItems[i].length > 0) {
            //todo: refactor to not allow jaggy rows.
            result += "'' as [" + lineItems[i] + "]" + (i + 1 < lineItems.length ? "," : "") + "\n";
        }
    }
    setOutputText(result);
}

function textToVBString() {
    var lineItems = strReplace(getInputText(), "\r", "").split("\n");
    var result = "";
    for (var i = 0; i < lineItems.length; i++) {
        result += '"' + strReplace(lineItems[i], '"', '""') + '"' + (i + 1 < lineItems.length ? ' & _' : "") + '\r\n';
    }
    setOutputText(result);
}

function listToSelectUnionAll() {
    var lineItems = strReplace(getInputText(), "\r", "").split("\n");
    if (lineItems.length === 0) {
        setOutputText("");
        return;
    }
    var fieldDelimiter = getFieldDelimiter();
    var result = "";
    for (var i = 0; i < lineItems.length; i++) {
        var fields = lineItems[i].split(fieldDelimiter);
        for (var fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
            result += (fieldIndex === 0 ? "SELECT " : "") + "'" + strReplace(fields[fieldIndex], "'", "''") + "'" + (i === 0 ? " as [col" + fieldIndex.toString() + "]" : "") + (fieldIndex + 1 < fields.length ? "," : "");
        }
        if (i + 1 < lineItems.length) {
            result += " UNION ALL\r\n";
        }
    }
    result += "\r\n";
    setOutputText(result);
}

function textToCSV() {
    var lineItems = strReplace(getInputText(), "\r", "").split("\n");
    if (lineItems.length === 0) {
        setOutputText("");
        return;
    }
    var fieldDelimiter = getFieldDelimiter();
    var result = "";
    for (var i = 0; i < lineItems.length; i++) {
        var fields = lineItems[i].split(fieldDelimiter);
        for (var fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
            result += '"' + strReplace(fields[fieldIndex], '"', '""') + '"' + (fieldIndex + 1 < fields.length ? "," : "");
        }
        if (i + 1 < lineItems.length) {
            result += "\r\n";
        }
    }
    result += "\r\n";
    setOutputText(result);
}

function textTemplate() {
    var lineItems = strReplace(getInputText(), "\r", "").split("\n");
    if (lineItems.length === 0) {
        setOutputText("");
        return;
    }
    var fieldDelimiter = getFieldDelimiter();
    var dataForReplacing = lineItems[0].split(fieldDelimiter);
    for (var i = 1; i < lineItems.length; i++) {
        for (var replaceIndex = 0; replaceIndex < dataForReplacing.length; replaceIndex++) {
            lineItems[i] = strReplace(lineItems[i], "{" + replaceIndex.toString() + "}", dataForReplacing[replaceIndex]);
        }
    }
    lineItems[0] = "";
    setOutputText(lineItems.join("\n"));
}

function listToInClause() {
    var items = strReplace(getInputText(), "\r", "").split("\n");
    var result = "(";
    for (var i = 0; i < items.length; i++) {
        result += "'" + items[i] + "',";
    }
    result += ")";
    setOutputText(result);
}

function getFieldDelimiter() {
    if (document.getElementById("rdoTabDelimited").value == "on") {
        return "\t";
    } else {
        return ",";
    }
}

function downloadText() {
    var outputTextArea = document.getElementById("outputText");
    download("myfile.txt", outputTextArea.value);
}

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
}

window.onload = function () {
    //Allows tabs to be typed in top window.
    $('#inputText').keydown(function (event) {
        if (event.keyCode === 9) {
            var content = this.value;
            var caret = getCaret(this);
            this.value = content.substring(0, caret) + "\t" + content.substring(caret, content.length);
            event.stopPropagation();
            return false;
        }
    });
};
//# sourceMappingURL=app.js.map
