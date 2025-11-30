class SetupWizard {
  constructor({ container, onPrev, onNext, onFinish }) {
    this.container = container;
    this.onPrev = onPrev;
    this.onNext = onNext;
    this.onFinish = onFinish;
    this.step = 1;
    this.data = {
      corpora: [],
      specialties: [],
      qrNodes: []
    };
  }

  start() {
    this.renderStep();
  }

  renderStep() {
    this.container.innerHTML = '';
    switch (this.step) {
      case 1:
        this.renderStep1();
        break;
      case 2:
        this.renderStep2();
        break;
      case 3:
        this.renderStep3();
        break;
      case 4:
        this.renderStep4();
        break;
      case 5:
        this.renderStep5();
        break;
    }
    document.getElementById('btn-prev').disabled = (this.step === 1);
  }

  renderStep1() {
    this.container.innerHTML = `
      <h2>Шаг 1: Основные параметры</h2>
      <label>Сколько корпусов?</label>
      <input type="number" id="num-corpora" min="1" value="1">
      <label>Главный вход в корпусе:</label>
      <select id="main-entrance">
        <option value="corp-1">Корпус 1</option>
      </select>
    `;
    const input = document.getElementById('num-corpora');
    input.oninput = () => {
      const n = parseInt(input.value) || 1;
      const sel = document.getElementById('main-entrance');
      sel.innerHTML = '';
      for (let i = 1; i <= n; i++) {
        const opt = document.createElement('option');
        opt.value = `corp-${i}`;
        opt.textContent = `Корпус ${i}`;
        sel.appendChild(opt);
      }
    };
  }

  renderStep2() {
    this.container.innerHTML = `
      <h2>Шаг 2: Настройка корпуса 1</h2>
      <label>Этажей:</label>
      <input type="number" id="floors" min="1" value="3">
      <label>Зоны на этаже (через запятую):</label>
      <input type="text" id="zones" value="Левое крыло, Правое крыло, Центр">
      <button class="btn" onclick="this.addFloor()">➕ Добавить этаж</button>
    `;
    // Простая реализация — можно расширить
  }

  renderStep3() {
    this.container.innerHTML = `
      <h2>Шаг 3: Распределение кабинетов</h2>
      <p><strong>Корпус 1 / Этаж 1 / Правое крыло</strong></p>
      <label>Диапазон кабинетов:</label>
      <input type="text" id="range" placeholder="101–110">
      <label>Тип:</label>
      <select>
        <option>Основные приёмы</option>
        <option>Диагностика</option>
        <option>Процедурные</option>
      </select>
      <label>Узел входа:</label>
      <input type="text" value="node_1f_right_entrance" readonly>
      <div>
        <button class="btn">➕ Добавить зону</button>
        <button class="btn">➕ Добавить этаж</button>
        <button class="btn">➕ Добавить корпус</button>
      </div>
    `;
  }

  renderStep4() {
    this.container.innerHTML = `
      <h2>Шаг 4: Специальности</h2>
      <div id="specs"></div>
      <button class="btn btn-primary" onclick="this.addSpecialty()">➕ Добавить специальность</button>
    `;
    this.addSpecialty();
  }

  addSpecialty() {
    const div = document.createElement('div');
    div.className = 'spec-item';
    div.innerHTML = `
      <hr>
      <label>Название:</label>
      <input type="text" placeholder="Окулист">
      <label>Синонимы (через запятую):</label>
      <input type="text" placeholder="офтальмолог, глазной врач">
      <label>Кабинеты (номера через запятую):</label>
      <input type="text" placeholder="205, 207">
      <label>Название помещения:</label>
      <input type="text" placeholder="Кабинет осмотра сетчатки">
      <label><input type="checkbox"> Показывать фамилию врача (скрыто)</label>
      <label><input type="checkbox"> Показывать расписание (скрыто)</label>
    `;
    document.getElementById('specs').appendChild(div);
  }

  renderStep5() {
    this.container.innerHTML = `
      <h2>Шаг 5: Генерация QR-кодов</h2>
      <p>Система предлагает точки установки QR:</p>
      <ul>
        <li>✅ Главный вход (Корпус 1, 1 этаж)</li>
        <li>✅ Вход в Правое крыло, 2 этаж</li>
        <li>✅ Развилка у лифта, 3 этаж</li>
      </ul>
      <button class="btn btn-primary" onclick="this.generateQR()">Сгенерировать и скачать ZIP</button>
    `;
  }

  generateQR() {
    alert('✅ Сгенерировано 10 QR-кодов. ZIP скачивается...');
    // TODO: использовать qr-gen.js + JSZip для браузерной генерации
  }

  next() {
    if (this.step < 5) {
      this.step++;
      this.renderStep();
      this.onNext();
    } else {
      // Финал: собрать данные → вызвать onFinish
      const config = {
        version: "1.1",
        corpora: [{ id: "corp-1", name: "Корпус 1", floors: 3 }],
        specialties: [],
        admin_password_hash: "stub"
      };
      this.onFinish(config);
    }
  }

  prev() {
    if (this.step > 1) {
      this.step--;
      this.renderStep();
      this.onPrev();
    }
  }
}

// Назначаем кнопки глобально (для простоты)
document.getElementById('btn-next')?.addEventListener('click', () => {
  const wizard = window.wizardInstance;
  if (wizard) wizard.next();
});
document.getElementById('btn-prev')?.addEventListener('click', () => {
  const wizard = window.wizardInstance;
  if (wizard) wizard.prev();
});

// Для примера — создаём экземпляр
window.wizardInstance = new SetupWizard({
  container: document.getElementById('wizard'),
  onNext: () => console.log('Next'),
  onPrev: () => console.log('Prev'),
  onFinish: (cfg) => console.log('Save:', cfg)
});
