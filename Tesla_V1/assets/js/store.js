// store.js — Tesla Colombia · Capa de datos centralizada
'use strict';

const Store = (() => {

  const KEYS = { user: 'tesla_co_user', res: 'tesla_co_res_' };

  // ── USUARIO ─────────────────────────────────────────────────
  function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(KEYS.user)) || null; }
    catch { return null; }
  }
  function setCurrentUser(data) {
    localStorage.setItem(KEYS.user, JSON.stringify(data));
  }
  function logout() {
    localStorage.removeItem(KEYS.user);
  }

  // ── RESERVAS ─────────────────────────────────────────────────
  function getUserReservation(email) {
    if (!email) return null;
    try { return JSON.parse(localStorage.getItem(KEYS.res + email)) || null; }
    catch { return null; }
  }
  function saveReservation(email, data) {
    if (!email) return;
    const res = {
      ...data,
      id:    'TSL-' + Date.now().toString(36).toUpperCase(),
      fecha: new Date().toISOString(),
    };
    localStorage.setItem(KEYS.res + email, JSON.stringify(res));
    return res;
  }
  function deleteReservation(email) {
    if (!email) return;
    localStorage.removeItem(KEYS.res + email);
  }

  // ── UTILS ─────────────────────────────────────────────────────
  function formatPrice(n) {
    return '$' + Number(n).toLocaleString('es-CO') + ' COP';
  }
  function formatDate(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('es-CO', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch { return '—'; }
  }

  return { getCurrentUser, setCurrentUser, logout, getUserReservation, saveReservation, deleteReservation, formatPrice, formatDate };
})();
