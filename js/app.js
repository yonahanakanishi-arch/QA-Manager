window.QAApp = (() => {
  const state = { tickets: [], masters: {}, dashboardFilter: 'all' };
  const filterIds = ['keyword', 'filterStatus', 'filterOwner', 'filterSystem', 'filterVendor', 'filterPriority'];
  const value = id => document.getElementById(id).value.trim();
  const optionHtml = (values, placeholder) => '<option value="">' + placeholder + '</option>' + [...new Set((values || []).filter(Boolean))].map(item => '<option value="' + String(item).replace(/"/g, '&quot;') + '">' + String(item) + '</option>').join('');
  const toInputDate = value => { if (!value) return ''; const date = new Date(value); return Number.isNaN(date.valueOf()) ? '' : date.toISOString().slice(0, 10); };
  const displayDate = value => { if (!value) return '—'; const date = new Date(value); return Number.isNaN(date.valueOf()) ? value : date.toLocaleString('ja-JP'); };

  function matches(ticket) {
    const term = value('keyword').toLocaleLowerCase();
    const searchable = ['案件ID', '件名', '問い合わせ内容', '回答内容', 'ベンダー管理番号'].map(k => String(ticket[k] || '')).join(' ').toLocaleLowerCase();
    if (term && !searchable.includes(term)) return false;
    const conditions = [['状態','filterStatus'], ['担当者','filterOwner'], ['システム','filterSystem'], ['ベンダー','filterVendor'], ['優先度','filterPriority']];
    if (!conditions.every(([key, id]) => !value(id) || ticket[key] === value(id))) return false;
    if (state.dashboardFilter === 'overdue' && !TableView.isOverdue(ticket)) return false;
    if (state.dashboardFilter !== 'all' && state.dashboardFilter !== 'overdue' && ticket['状態'] !== state.dashboardFilter) return false;
    return true;
  }

  function render() {
    const filtered = state.tickets.filter(matches);
    TableView.render(filtered);
    UI.updateDashboard(state.tickets);
    document.getElementById('resultCount').textContent = filtered.length + '件 / 全' + state.tickets.length + '件';
    document.querySelectorAll('[data-dashboard-filter]').forEach(button => button.classList.toggle('active', button.dataset.dashboardFilter === state.dashboardFilter));
  }

  function populateTicketForm() {
    document.getElementById('ticketSystem').innerHTML = optionHtml(state.masters.systems, '選択してください *');
    document.getElementById('ticketVendor').innerHTML = optionHtml(state.masters.vendors, '選択してください *');
    document.getElementById('ticketOwner').innerHTML = optionHtml(state.masters.staffs, '選択してください *');
    document.getElementById('ticketPriority').innerHTML = optionHtml(state.masters.priorities, '選択してください *');
    document.getElementById('ticketCategory').innerHTML = optionHtml(state.masters.categories, '選択してください *');
    const user = document.getElementById('currentUser').value;
    if (user) document.getElementById('ticketOwner').value = user;
  }

  function populateDetailForm(ticket) {
    const fields = [
      ['detailSystem', 'systems', 'システム'], ['detailVendor', 'vendors', 'ベンダー'], ['detailOwner', 'staffs', '担当者'],
      ['detailPriority', 'priorities', '優先度'], ['detailStatus', 'statuses', '状態'], ['detailCategory', 'categories', '問い合わせ区分']
    ];
    fields.forEach(([id, masterKey, ticketKey]) => { const input = document.getElementById(id); input.innerHTML = optionHtml(state.masters[masterKey], '選択してください'); input.value = ticket[ticketKey] || ''; });
    const textFields = { detailId:'案件ID', detailSentDate:'送付日', detailFollowupDate:'最終催促日', detailDueDate:'回答期限', detailPlannedDate:'回答予定日', detailAnswerDate:'回答日', detailVendorCase:'ベンダー管理番号', detailDepartment:'問い合わせ元部署', detailRequester:'問い合わせ元担当者', detailSubject:'件名', detailInquiry:'問い合わせ内容', detailAnswer:'回答内容', detailCompletionReason:'完了理由', detailNotes:'備考' };
    Object.entries(textFields).forEach(([id, key]) => { const input = document.getElementById(id); input.value = input.type === 'date' ? toInputDate(ticket[key]) : (ticket[key] || ''); });
    document.getElementById('detailKnowledge').checked = ticket['ナレッジ対象'] === true || String(ticket['ナレッジ対象']).toUpperCase() === 'TRUE';
    document.getElementById('detailTicketId').textContent = ticket['案件ID'] || 'Ticket';
    document.getElementById('detailReceivedDate').textContent = displayDate(ticket['受付日']);
    document.getElementById('detailCreator').textContent = ticket['登録者'] || '—';
    document.getElementById('detailCreatedAt').textContent = displayDate(ticket['登録日時']);
    document.getElementById('detailUpdatedAt').textContent = displayDate(ticket['更新日時']);
  }

  function renderHistory(history) {
    const list = document.getElementById('historyList');
    list.innerHTML = '';
    if (!Array.isArray(history) || history.length === 0) { list.innerHTML = '<li>履歴はまだありません。</li>'; return; }
    history.slice().sort((a, b) => new Date(b['日時']) - new Date(a['日時'])).forEach(item => {
      const li = document.createElement('li'); const time = document.createElement('time'); time.textContent = displayDate(item['日時']); const strong = document.createElement('strong'); strong.textContent = item['種別'] || '更新'; const span = document.createElement('span'); span.textContent = (item['内容'] || '') + (item['登録者'] ? '（' + item['登録者'] + '）' : ''); li.append(time, strong, span); list.appendChild(li);
    });
  }

  async function load(force = false) {
    UI.setLoading(true);
    try { const [tickets, masters] = await Promise.all([API.getList(force), API.getMasters()]); state.tickets = tickets; state.masters = masters; UI.populateFilters(masters, tickets); populateTicketForm(); document.getElementById('newTicketButton').disabled = false; render(); }
    catch (error) { console.error(error); UI.showAlert('データを読み込めませんでした。Apps Script の公開URLとアクセス設定を確認してください。詳細: ' + error.message, true); UI.showToast('データを読み込めませんでした。' + error.message, true); }
    finally { UI.setLoading(false); }
  }

  function clearFilters() { filterIds.forEach(id => document.getElementById(id).value = ''); state.dashboardFilter = 'all'; render(); }
  function openNewModal() { populateTicketForm(); document.getElementById('ticketModal').hidden = false; document.getElementById('ticketSystem').focus(); }
  function closeNewModal() { document.getElementById('ticketModal').hidden = true; }
  function closeDetailModal() { document.getElementById('detailModal').hidden = true; }

  async function openDetail(ticketId) {
    UI.setLoading(true);
    try { const [ticket, history] = await Promise.all([API.getDetail(ticketId), API.getHistory(ticketId)]); if (ticket.status === 'notfound') throw new Error('案件が見つかりません。'); populateDetailForm(ticket); renderHistory(history); document.getElementById('detailModal').hidden = false; }
    catch (error) { console.error(error); UI.showToast('案件詳細を読み込めませんでした。' + error.message, true); }
    finally { UI.setLoading(false); }
  }

  async function submitTicket(event) {
    event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return;
    const submit = document.getElementById('submitTicket'); const record = Object.fromEntries(new FormData(form).entries()); record.登録者 = document.getElementById('currentUser').value || record.担当者;
    submit.disabled = true; UI.setLoading(true);
    try { const result = await API.create(record); if (result.status !== 'success') throw new Error(result.message || '登録処理が完了しませんでした。'); form.reset(); closeNewModal(); API.cache.tickets = null; await load(true); UI.showToast((result.ticketId || '案件') + ' を登録しました。'); }
    catch (error) { console.error(error); UI.showToast('登録できませんでした。' + error.message, true); }
    finally { submit.disabled = false; UI.setLoading(false); }
  }

  async function saveDetail(event) {
    event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return;
    const submit = document.getElementById('saveTicket'); const record = Object.fromEntries(new FormData(form).entries()); record.ナレッジ対象 = document.getElementById('detailKnowledge').checked; record.更新者 = document.getElementById('currentUser').value || record.担当者;
    submit.disabled = true; UI.setLoading(true);
    try { const result = await API.update(record); if (result.status !== 'success') throw new Error(result.message || '更新処理が完了しませんでした。'); closeDetailModal(); API.cache.tickets = null; await load(true); UI.showToast(record.案件ID + ' を更新しました。'); }
    catch (error) { console.error(error); UI.showToast('更新できませんでした。' + error.message, true); }
    finally { submit.disabled = false; UI.setLoading(false); }
  }

  function bindEvents() {
    filterIds.forEach(id => document.getElementById(id).addEventListener(id === 'keyword' ? 'input' : 'change', () => { state.dashboardFilter = 'all'; render(); }));
    document.getElementById('clearFilters').addEventListener('click', clearFilters); document.getElementById('reloadButton').addEventListener('click', () => load(true));
    document.querySelectorAll('[data-dashboard-filter]').forEach(button => button.addEventListener('click', () => { state.dashboardFilter = button.dataset.dashboardFilter; render(); }));
    document.getElementById('newTicketButton').addEventListener('click', openNewModal); document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', closeNewModal)); document.getElementById('ticketForm').addEventListener('submit', submitTicket);
    document.querySelectorAll('[data-close-detail]').forEach(button => button.addEventListener('click', closeDetailModal)); document.getElementById('detailForm').addEventListener('submit', saveDetail);
    document.querySelector('#ticketTable tbody').addEventListener('click', event => { const row = event.target.closest('tr[data-ticket-id]'); if (row) openDetail(row.dataset.ticketId); });
  }

  document.addEventListener('DOMContentLoaded', () => { bindEvents(); load(); });
  return { state, load, render };
})();
