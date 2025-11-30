// lib/auth.js — упрощённая клиентская аутентификация (MVP-версия)
window.auth = {
  login: async function(password) {
    try {
      const res = await fetch('../config.json');
      const config = await res.json();

      // Вариант 1: если в config.json есть plain-пароль (рекомендуется для MVP)
      if (config.admin_password) {
        return password === config.admin_password;
      }

      // Вариант 2: fallback на демо-пароль (если config.json пока не содержит admin_password)
      return password === 'wellway';
    } catch (e) {
      console.error('Ошибка загрузки config.json:', e);
      return false;
    }
  }
};
