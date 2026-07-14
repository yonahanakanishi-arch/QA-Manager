/**
 * Ticket Table Renderer
 */

function renderTicketTable(tickets) {

    const tbody = document.querySelector("#ticketTable tbody");

    tbody.innerHTML = "";

    if (!tickets || tickets.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    データがありません
                </td>
            </tr>
        `;

        return;
    }

    tickets.forEach(ticket => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${ticket["案件ID"] || ""}</td>
            <td>${ticket["状態"] || ""}</td>
            <td>${ticket["担当者"] || ""}</td>
            <td>${ticket["システム"] || ""}</td>
            <td>${ticket["ベンダー"] || ""}</td>
            <td>${ticket["件名"] || ""}</td>
            <td>${ticket["回答期限"] || ""}</td>
        `;

        tbody.appendChild(row);

    });

}