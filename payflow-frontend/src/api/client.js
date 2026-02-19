import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const api = axios.create({ baseURL: BASE_URL });

export const createExpense = (data) => api.post('/expenses', data).then((r) => r.data);
export const getExpenseById = (id) => api.get(`/expenses/${id}`).then((r) => r.data);
export const getExpensesByUser = (userId) => api.get(`/expenses/user/${userId}`).then((r) => r.data);
export const getBalanceForUser = (userId) => api.get(`/balance/${userId}`).then((r) => r.data);
export const settleExpense = (id) => api.put(`/expenses/${id}/settle`).then((r) => r.data);

export const USERS = ['kevin', 'alex', 'priya', 'jordan'];

export const USER_COLORS = {
  kevin: '#6366F1',
  alex:  '#F59E0B',
  priya: '#EC4899',
  jordan:'#14B8A6',
};
