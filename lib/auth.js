// auth.js — простая клиентская проверка (в продакшене — лучше hash+salt)
// Для MVP: bcrypt.js, но можно и простую строку для демо

async function loadBcrypt() {
  if (typeof dcodeIO === 'undefined') {
    await import('https://cdnjs.cloudflare.com/ajax/libs/bcryptjs/2.4.3/bcrypt.min.js');
  }
}

const auth = {
  async login(password) {
    await loadBcrypt();
    // Загружаем config.json для получения хэша
    const res = await fetch('../config.json');
    const config = await res.json();
    return bcrypt.compareSync(password, config.admin_password_hash);
  }
};

// Экспорт (для ES6 module — но у нас скрипты без type="module")
window.auth = auth;
