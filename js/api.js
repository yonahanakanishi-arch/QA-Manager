/**
 * QA Manager API Client
 * Version 1.0
 */

const API = {

    baseUrl: "https://script.google.com/macros/s/AKfycbwNHjhhyErsEjE0teJ3jMEzsWUUpTp3dMd4ZxzSotZz0Z7j05-DdlrZwbDnqOJATKt9/exec",

    async getList() {

        const response = await fetch(
            `${this.baseUrl}?action=list`
        );

        if (!response.ok) {
            throw new Error("一覧取得に失敗しました。");
        }

        return await response.json();

    },

    async getDetail(ticketId) {

        const response = await fetch(
            `${this.baseUrl}?action=detail&id=${encodeURIComponent(ticketId)}`
        );

        if (!response.ok) {
            throw new Error("案件取得に失敗しました。");
        }

        return await response.json();

    },

    async getMasters() {

        const response = await fetch(
            `${this.baseUrl}?action=masters`
        );

        if (!response.ok) {
            throw new Error("マスタ取得に失敗しました。");
        }

        return await response.json();

    },

    async create(data) {

        const response = await fetch(this.baseUrl, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                action: "create",
                ...data
            })

        });

        return await response.json();

    },

    async update(data) {

        const response = await fetch(this.baseUrl, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                action: "update",
                ...data
            })

        });

        return await response.json();

    }

};