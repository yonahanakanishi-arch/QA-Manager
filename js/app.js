/**
 * QA Manager
 * Application Entry Point
 */

document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {

    console.log("QA Manager started.");

    try {

        const tickets = await API.getList();

        console.log("Ticket List", tickets);

        alert(`案件数：${tickets.length}件`);

    } catch (error) {

        console.error(error);

        alert("サーバーへ接続できませんでした。");

    }

}