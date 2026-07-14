/**
 * Dashboard UI
 */

function updateDashboard(tickets) {

    const open =
        tickets.filter(t => t["状態"] === "受付").length;

    const waiting =
        tickets.filter(t => t["状態"] === "回答待ち").length;

    const completed =
        tickets.filter(t => t["状態"] === "完了").length;

    const overdue =
        tickets.filter(t => {

            if (!t["回答期限"]) return false;

            return new Date(t["回答期限"]) < new Date()
                && t["状態"] !== "完了";

        }).length;

    document.getElementById("countOpen").textContent = open;
    document.getElementById("countWaiting").textContent = waiting;
    document.getElementById("countCompleted").textContent = completed;
    document.getElementById("countOverdue").textContent = overdue;

}