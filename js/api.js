/* Apps Script API client. Keep this endpoint unchanged unless GAS is redeployed with a new URL. */
window.API = {
  baseUrl: 'https://script.google.com/macros/s/AKfycbwNHjhhyErsEjE0teJ3jMEzsWUUpTp3dMd4ZxzSotZz0Z7j05-DdlrZwbDnqOJATKt9/exec',
  cache: { tickets: null, masters: null },

  async request(action, params = {}) {
    const url = new URL(this.baseUrl);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    const response = await fetch(url.toString(), { redirect: 'follow' });
    if (!response.ok) throw new Error('通信に失敗しました（HTTP ' + response.status + '）');
    return response.json();
  },

  async getList(force = false) {
    if (!force && this.cache.tickets) return this.cache.tickets;
    const result = await this.request('list');
    this.cache.tickets = Array.isArray(result) ? result : [];
    return this.cache.tickets;
  },

  async getMasters() {
    if (this.cache.masters) return this.cache.masters;
    this.cache.masters = await this.request('masters');
    return this.cache.masters;
  },

  async getDetail(id) { return this.request('detail', { id }); },
  async getHistory(id) { return this.request('history', { id }); },

  async post(action, ticket) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      /* text/plain avoids an unnecessary CORS preflight request to Apps Script. */
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: action, ...ticket })
    });
    if (!response.ok) throw new Error('保存に失敗しました（HTTP ' + response.status + '）');
    return response.json();
  },

  async create(ticket) { return this.post('create', ticket); },
  async update(ticket) { return this.post('update', ticket); }
};
