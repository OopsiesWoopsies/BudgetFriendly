let num;

document.getElementById("submitButton").onclick = function() {
    num = document.getElementById("numberField").value;
    document.getElementById("result").textContent = num;
}