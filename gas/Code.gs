const SHEETS = {
  tickets: 'QA案件',
  history: 'QA履歴',
  systems: 'マスタ_システム',
  statuses: 'マスタ_状態',
  staffs: 'マスタ_担当者',
  priorities: 'マスタ_優先度',
  vendors: 'マスタ_ベンダー',
  categories: 'マスタ_問い合わせ区分'
};

function doGet(e) {
  const action = (e.parameter && e.parameter.action) || '';
  if (action === 'list') return jsonOutput(getList());
  if (action === 'masters') return jsonOutput(getMasters());
  if (action === 'detail') return jsonOutput(getDetail(e.parameter.id));
  if (action === 'history') return jsonOutput(getHistory(e.parameter.id));
  return jsonOutput({ status: 'error', message: 'action not found' });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    if (data.action === 'create') return jsonOutput(createTicket(data));
    if (data.action === 'update') return jsonOutput(updateTicket(data));
    return jsonOutput({ status: 'error', message: 'action not found' });
  } catch (error) {
    return jsonOutput({ status: 'error', message: error.message });
  }
}

function getList() {
  return sheetRecords(SHEETS.tickets).filter(record => !isTrue(record['削除フラグ']));
}

function getDetail(ticketId) {
  return sheetRecords(SHEETS.tickets).find(record => record['案件ID'] === ticketId && !isTrue(record['削除フラグ'])) || { status: 'notfound' };
}

function getHistory(ticketId) {
  return sheetRecords(SHEETS.history)
    .filter(record => record['案件ID'] === ticketId)
    .sort((a, b) => new Date(a['日時']) - new Date(b['日時']));
}

function getMasters() {
  return {
    systems: masterValues(SHEETS.systems), vendors: masterValues(SHEETS.vendors), staffs: masterValues(SHEETS.staffs),
    priorities: masterValues(SHEETS.priorities), statuses: masterValues(SHEETS.statuses), categories: masterValues(SHEETS.categories)
  };
}

function createTicket(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const now = new Date();
    const ticketId = getNextTicketId();
    const record = {
      '案件ID': ticketId, '受付日': now, '送付日': '', '最終催促日': '', '回答日': '', '状態': '受付',
      '優先度': data['優先度'] || '中', '担当者': data['担当者'] || '', 'システム': data['システム'] || '', 'ベンダー': data['ベンダー'] || '',
      'ベンダー管理番号': '', '問い合わせ元部署': data['問い合わせ元部署'] || '', '問い合わせ元担当者': data['問い合わせ元担当者'] || '',
      '件名': data['件名'] || '', '問い合わせ内容': data['問い合わせ内容'] || '', '回答内容': '', '回答期限': data['回答期限'] || '',
      '回答予定日': '', 'ナレッジ対象': false, '完了理由': '', '備考': '', '登録者': data['登録者'] || '',
      '登録日時': now, '更新日時': now, '問い合わせ区分': data['問い合わせ区分'] || 'その他', '削除フラグ': false
    };
    appendRecord(SHEETS.tickets, record);
    addHistory(ticketId, '登録', '案件を登録しました', data['登録者'] || '');
    return { status: 'success', ticketId: ticketId };
  } finally {
    lock.releaseLock();
  }
}

function updateTicket(data) {
  if (!data['案件ID']) throw new Error('案件IDがありません。');
  const sheet = getSheet(SHEETS.tickets);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const rowIndex = values.slice(1).findIndex(row => String(row[0]) === String(data['案件ID']));
  if (rowIndex === -1) return { status: 'notfound' };
  const previous = rowToObject(headers, values[rowIndex + 1]);
  const editable = ['状態', '優先度', '担当者', 'システム', 'ベンダー', 'ベンダー管理番号', '問い合わせ元部署', '問い合わせ元担当者', '件名', '問い合わせ内容', '回答内容', '回答期限', '回答予定日', '回答日', 'ナレッジ対象', '完了理由', '備考', '問い合わせ区分', '送付日', '最終催促日'];
  const updated = Object.assign({}, previous);
  editable.forEach(key => { if (Object.prototype.hasOwnProperty.call(data, key)) updated[key] = data[key]; });
  updated['更新日時'] = new Date();
  sheet.getRange(rowIndex + 2, 1, 1, headers.length).setValues([headers.map(header => updated[header] === undefined ? '' : updated[header])]);
  const changes = editable.filter(key => String(previous[key] || '') !== String(updated[key] || ''));
  const content = changes.length ? '更新: ' + changes.join('、') : '案件情報を確認しました';
  addHistory(data['案件ID'], '更新', content, data['更新者'] || data['担当者'] || '');
  return { status: 'success' };
}

function getNextTicketId() {
  const year = new Date().getFullYear();
  const max = sheetRecords(SHEETS.tickets)
    .map(record => String(record['案件ID'] || ''))
    .filter(id => id.indexOf('QA-' + year + '-') === 0)
    .map(id => Number(id.split('-')[2]))
    .filter(Number.isFinite)
    .reduce((acc, value) => Math.max(acc, value), 0);
  return 'QA-' + year + '-' + String(max + 1).padStart(4, '0');
}

function addHistory(ticketId, type, content, user) {
  const record = { '履歴ID': Utilities.getUuid(), '案件ID': ticketId, '日時': new Date(), '種別': type, '内容': content, '登録者': user, '実施者': user };
  appendRecord(SHEETS.history, record);
}

function sheetRecords(name) {
  const sheet = getSheet(name);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).filter(row => row.some(value => value !== '')).map(row => rowToObject(headers, row));
}

function rowToObject(headers, row) {
  return headers.reduce((record, header, index) => { record[header] = row[index]; return record; }, {});
}

function appendRecord(name, record) {
  const sheet = getSheet(name);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.appendRow(headers.map(header => record[header] === undefined ? '' : record[header]));
}

function masterValues(name) {
  const sheet = getSheet(name);
  const lastRow = sheet.getLastRow();
  return lastRow ? sheet.getRange(1, 1, lastRow, 1).getValues().flat().filter(Boolean) : [];
}

function getSheet(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('シート「' + name + '」が見つかりません。');
  return sheet;
}

function isTrue(value) {
  return value === true || value === 1 || String(value).toUpperCase() === 'TRUE';
}

function jsonOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
