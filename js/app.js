/**
 * QA Manager
 * Application Entry Point
 */

document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {

    console.log("QA Manager started.");

    try {

        const tickets = await API.getList();

        renderTicketTable(tickets);

        console.log("Ticket List", tickets);

    } catch (error) {

        console.error(error);

        alert("サーバーへ接続できませんでした。");

    }

}