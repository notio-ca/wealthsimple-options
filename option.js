// ==UserScript==
// @name         WS Options
// @namespace    https://wealthsimple.com
// @version      2026-04-06
// @description  Get the right strike
// @author       Luke Charters
// @match        https://my.wealthsimple.com/app/security-details/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wealthsimple.com
// @grant        none
// ==/UserScript==

function opt(profit_target) {
    localStorage.setItem("opt_profit_target", profit_target);
    var symbol = document.querySelector('[aria-label="Go back"] p').textContent.trim();
    var dte = parseInt(document.querySelector('[data-scope="menu"] p').textContent.trim().split("(")[1].split("d")[0]);
    var side = new URLSearchParams(window.location.search).get("optionType") || "N/A";
    var rows = document.querySelector('[data-test-id="contract-list-container"]').firstElementChild.children;
    var tr = "";
    Array.from(rows).forEach(function(row) {
        try {
            var cells = row.firstElementChild.firstElementChild.firstElementChild.children;
            var strke = cells[0].textContent.replace("$", "");
            var volume = parseInt(cells[2].textContent.trim());
            if (volume < 3) { return; }
            var delta = parseInt(parseFloat(cells[4].textContent.trim().replace("−", "")) * 100);
            var price = cells[5].textContent.replace("$", "").split("(")[0];
            var profit_day = (price * 100) / (dte + 1);
            var percent_year = ((profit_day * 365) / (strke * 100)) * 100;
            if (profit_target) {
                if (profit_day > (profit_target * 1.40) || profit_day < profit_target) { return; }
            }
            tr += `<tr style="color: #AAA;"><td style="text-align:right;">${strke}</td><td style="text-align:right;">${delta}</td><td style="text-align:right;">${price}</td><td style="text-align:right;">${profit_day.toFixed(2)}</td><td style="text-align:right;">${percent_year.toFixed(2)}%</td></tr>`;
        } catch (error) {
            //console.log(error);
        }
    });
    if (tr == "") { tr = `<tr><td colspan="5" style="text-align:center;">No strike found.</td></tr>`; }
    var output = `
    <div style="color:#a6e3a1">
        <hr style="border: 1px solid #666;">
        ${symbol} ${side} : ${dte} dte
    </div>
    <table>
        <tr>
        <th>Strike</th>
        <th style="padding-left:15px;">Delta</th>
        <th style="padding-left:15px;">Mid</th>
        <th style="padding-left:15px;">$/day</th>
        <th style="padding-left:15px;">%/year</th></tr>
        ${tr}
    </table>`;
    document.getElementById("opt_result").innerHTML += output;
}

// ─── Floating toolbar ────────────────────────────────────────────
const toolbar = document.createElement('div');
toolbar.style.cssText = `
        position: fixed; bottom: 100px; right: 25px; z-index: 999997;
        display: flex; gap: 8px;
    `;
toolbar.innerHTML = `
        <div style="max-height:90vh; overflow-y: auto; background-color: #333; color:#FFF; padding:15px; border-radius:15px;">
            <div id="opt_result" style='display:block;'></div>
            <input type="number" id="profit_target" value="${(localStorage.getItem("opt_profit_target") || "")}" placeholder="Daily Profit Target" style="width:100%; margin-top:10px; padding:8px; border-radius:8px; border:none; text-align:right;">
        </div>
        <div style="display:block;"><button id="tm-btn-run" style="cursor:pointer; padding:8px 14px;border-radius:8px;border:none;background:#a6e3a1;color:#1e1e2e;font-weight:bold;">Make $</button></div>
    `;
document.body.appendChild(toolbar);

toolbar.querySelector('#tm-btn-run').addEventListener('click', () => {
    var profit_target = toolbar.querySelector('#profit_target').value.trim();
    if (profit_target === null) { return; }
    opt(profit_target);
});
