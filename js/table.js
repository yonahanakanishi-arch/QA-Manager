window.TableView = (() => {
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const formatDate = value => { if (!value) return '—'; const date = new Date(value); return Number.isNaN(date.valueOf()) ? escapeHtml(value) : date.toLocaleDateString('ja-JP'); };
  const daysOpen = ticket => { const start = new Date(ticket['受付日']); if (Number.isNaN(start.valueOf())) return '—'; return `${Math.max(0, Math.floor((Date.now() - start) / 86400000))}日`; };
  const isOverdue = ticket => { if (ticket['状態'] === '完了' || !ticket['回答期限']) return false; const due = new Date(ticket['回答期限']); if (Number.isNaN(due.valueOf())) return false; due.setHours(23,59,59,999); return due < new Date(); };
  const statusClass = value => `status-${String(value || '').replace(/[^\p{L}\p{N}]/gu, '')}`;
  const priorityClass = value => value === '高' || value === 'やや高' ? 'priority-high' : value === '中' ? 'priority-medium' : 'priority-low';
  function render(tickets) {
    const tbody = document.querySelector('#ticketTable tbody');
    const empty = document.querySelector('#emptyMessage');
    tbody.innerHTML = '';
    empty.hidden = tickets.length !== 0;
    tickets.forEach(ticket => {
      const row = document.createElement('tr');
      if (isOverdue(ticket)) row.classList.add('overdue-row');
      row.tabIndex = 0; row.dataset.ticketId = ticket['案件ID'] || '';
      row.innerHTML = `<td>${escapeHtml(ticket['案件ID'])}</td><td><span class="badge ${statusClass(ticket['状態'])}">${escapeHtml(ticket['状態'])}</span></td><td class="${priorityClass(ticket['優先度'])}">${escapeHtml(ticket['優先度'])}</td><td>${escapeHtml(ticket['担当者'])}</td><td>${escapeHtml(ticket['システム'])}</td><td>${escapeHtml(ticket['ベンダー'])}</td><td class="subject" title="${escapeHtml(ticket['件名'])}">${escapeHtml(ticket['件名'])}</td><td>${formatDate(ticket['回答期限'])}</td><td>${daysOpen(ticket)}</td><td>${formatDate(ticket['更新日時'])}</td>`;
      tbody.appendChild(row);
    });
  }
  return { render, isOverdue };
})();
