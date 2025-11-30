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
      qrNodes: [],
    };
    this.currentCorpusIndex = 0; // активный корпус (для шага 2+)
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
    document.getElementById('btn-prev').disabled = this.step === 1;
  }

  // ——— Шаг 1: количество корпусов и главный вход ———
  renderStep1() {
    this.container.innerHTML = `
      <h2>Шаг 1: Основные параметры</h2>
      <label>Сколько корпусов?</label>
      <input type="number" id="num-corpora" min="1" value="${this.data.corpora.length || 1}">
      <label>Главный вход в корпусе:</label>
      <select id="main-entrance"></select>
    `;

    const numInput = document.getElementById('num-corpora');
    const entranceSelect = document.getElementById('main-entrance');

    // Обновляем список корпусов при изменении числа
    const updateCorpora = () => {
      const n = Math.max(1, parseInt(numInput.value) || 1);
      // Убедимся, что this.data.corpora соответствует количеству корпусов
      while (this.data.corpora.length < n) {
        const idx = this.data.corpora.length + 1;
        this.data.corpora.push({
          id: `corp-${idx}`,
          name: `Корпус ${idx}`,
          floors: 1,
          zones: ['Центр'],
        });
      }
      while (this.data.corpora.length > n) {
        this.data.corpora.pop();
      }

      // Обновляем селект главного входа
      entranceSelect.innerHTML = '';
      this.data.corpora.forEach((corp, i) => {
        const opt = document.createElement('option');
        opt.value = corp.id;
        opt.textContent = corp.name;
        entranceSelect.appendChild(opt);
      });

      // Сохраняем значение при выходе
      numInput.onchange = () => {
        this.data.mainEntrance = entranceSelect.value;
      };
      entranceSelect.onchange = () => {
        this.data.mainEntrance = entranceSelect.value;
      };
    };

    numInput.oninput = updateCorpora;
    updateCorpora(); // первый рендер

    // Восстановление ранее выбранного (если продолжаем)
    if (this.data.mainEntrance) {
      entranceSelect.value = this.data.mainEntrance;
    }
  }

  // ——— Шаг 2: настройка корпусов ———
  renderStep2() {
    const corp = this.data.corpora[this.currentCorpusIndex];
    this.container.innerHTML = `
      <h2>Шаг 2: Настройка ${corp.name}</h2>
      <label>Этажей:</label>
      <input type="number" id="floors" min="1" value="${corp.floors}">
      <label>Зоны на этаже (через запятую):</label>
      <input type="text" id="zones" value="${corp.zones.join(', ')}">
      
      <div style="margin-top: 1rem;">
        <label>Корпус:</label><br>
        ${this.data.corpora
          .map(
            (c, i) =>
              `<button type="button" class="btn ${
                i === this.currentCorpusIndex ? 'btn-primary' : ''
              }" onclick="wizardInstance.switchCorpus(${i})">
                ${c.name}
              </button>`
          )
          .join(' ')}
      </div>
    `;

    const floorsInput = document.getElementById('floors');
    const zonesInput = document.getElementById('zones');

    floorsInput.onchange = () => {
      corp.floors = Math.max(1, parseInt(floorsInput.value) || 1);
    };
    zonesInput.onchange = () => {
      corp.zones = zonesInput.value
        .split(',')
        .map((z) => z.trim())
        .filter(Boolean);
    };
  }

  switchCorpus(index) {
    this.currentCorpusIndex = index;
    this.renderStep2();
  }

  // ——— Шаг 3: распределение кабинетов (упрощённый MVP) ———
  renderStep3() {
    // Генерируем структуру корпусов → этажи → зоны для ручного редактирования позже (в editor.js)
    // В мастере — только подтверждение, что данные собраны
    this.container.innerHTML = `
      <h2>Шаг 3: Распределение кабинетов</h2>
      <p>На основе введённых корпусов и зон система подготовит структуру.</p>
      <p><strong>Пример для ${this.data.corpora[0].name}:</strong></p>
      <ul>
        ${Array.from({ length: this.data.corpora[0].floors }, (_, fi) => {
          const floorNum = fi + 1;
          return `<li><strong>Этаж ${floorNum}</strong> — зоны: ${this.data.corpora[0].zones.join(', ')}</li>`;
        }).join('')}
      </ul>
      <p>Детальное распределение кабинетов будет доступно в <strong>ручном редакторе</strong> после завершения мастера.</p>
    `;
  }

  // ——— Шаг 4: специальности ———
  renderStep4() {
    this.container.innerHTML = `
      <h2>Шаг 4: Специальности</h2>
      <div id="specs"></div>
      <button class="btn btn-primary" onclick="wizardInstance.addSpecialty()">➕ Добавить специальность</button>
    `;

    const specsContainer = document.getElementById('specs');
    specsContainer.innerHTML = '';

    // Отображаем уже добавленные
    this.data.specialties.forEach((spec, i) => {
      this._renderSpecialty(spec, i);
    });

    // Если ни одной — добавляем одну
    if (this.data.specialties.length === 0) {
      this.addSpecialty();
    }
  }

  _renderSpecialty(spec, index) {
    const div = document.createElement('div');
    div.className = 'spec-item';
    div.innerHTML = `
      <hr>
      <label>Название:</label>
      <input type="text" data-index="${index}" data-field="name" value="${spec.name || ''}">
      
      <label>Синонимы (через запятую):</label>
      <input type="text" data-index="${index}" data-field="synonyms" value="${spec.synonyms?.join(', ') || ''}">
      
      <label>Кабинеты (номера через запятую):</label>
      <input type="text" data-index="${index}" data-field="rooms" value="${spec.rooms?.map(r => r.number)?.join(', ') || ''}">
      
      <label>Название помещения:</label>
      <input type="text" data-index="${index}" data-field="roomName" value="${spec.roomName || ''}">
      
      <label><input type="checkbox" data-index="${index}" data-field="showDoctor" ${
        spec.showDoctor ? 'checked' : ''
      }> Показывать фамилию врача (скрыто)</label>
      
      <label><input type="checkbox" data-index="${index}" data-field="showSchedule" ${
        spec.showSchedule ? 'checked' : ''
      }> Показывать расписание (скрыто)</label>
      
      <button type="button" class="btn" style="background:#f44336;color:white;" onclick="wizardInstance.removeSpecialty(${index})">
        Удалить
      </button>
    `;
    document.getElementById('specs').appendChild(div);

    // Привязываем обработчики
    div.querySelectorAll('input').forEach((el) => {
      el.onchange = () => {
        const idx = parseInt(el.dataset.index);
        const field = el.dataset.field;
        const value = el.type === 'checkbox' ? el.checked : el.value.trim();

        if (!this.data.specialties[idx]) return;

        switch (field) {
          case 'name':
            this.data.specialties[idx].name = value;
            break;
          case 'synonyms':
            this.data.specialties[idx].synonyms = value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            break;
          case 'rooms':
            this.data.specialties[idx].rooms = value
              .split(',')
              .map((num) => num.trim())
              .filter(Boolean)
              .map((num) => ({ number: num }));
            break;
          case 'roomName':
            this.data.specialties[idx].roomName = value;
            break;
          case 'showDoctor':
            this.data.specialties[idx].showDoctor = value;
            break;
          case 'showSchedule':
            this.data.specialties[idx].showSchedule = value;
            break;
        }
      };
    });
  }

  addSpecialty() {
    const spec = {
      id: `spec-${Date.now()}`,
      name: '',
      synonyms: [],
      rooms: [],
      roomName: '',
      doctor: 'Иванова А.П.',
      schedule: 'Пн–Пт 9:00–15:00',
      status: 'работает',
      show_details: false,
    };
    this.data.specialties.push(spec);
    this._renderSpecialty(spec, this.data.specialties.length - 1);
  }

  removeSpecialty(index) {
    this.data.specialties.splice(index, 1);
    this.renderStep4(); // перерисовать
  }

  // ——— Шаг 5: генерация QR ———
  renderStep5() {
    this.container.innerHTML = `
      <h2>Шаг 5: Генерация QR-кодов</h2>
      <p>Рекомендуемые точки размещения QR-кодов:</p>
      <ul>
        <li>• Главный вход (${this.data.corpora[0]?.name}, 1 этаж)</li>
        <li>• Вход в ${this.data.corpora[0]?.zones[0] || 'центр'}, 2 этаж</li>
        <li>• Развилка у лифта, 3 этаж</li>
      </ul>
      <p><em>Подробная настройка точек будет доступна в редакторе.</em></p>
      <button class="btn btn-primary" onclick="wizardInstance.generateQR()">✅ Сохранить и скачать config.json</button>
    `;
  }

  generateQR() {
    // Финальная сборка config.json
    const config = {
      version: '1.1',
      admin_password: 'wellway', // можно оставить или спросить — но для MVP фикс
      corpora: this.data.corpora.map((corp, i) => ({
        id: corp.id,
        name: corp.name,
        entrance: i === 0 ? this.data.mainEntrance || corp.id : null,
        floors: Array.from({ length: corp.floors }, (_, fi) => ({
          id: `${fi + 1}`,
          zones: corp.zones.map((zoneName) => ({
            name: zoneName,
            range: '', // заполнится вручную позже
            node: `node_${corp.id}_${fi + 1}f_${zoneName.replace(/\s+/g, '_').toLowerCase()}_entrance`,
          })),
        })),
      })),

      specialties: this.data.specialties.map((spec) => ({
        id: spec.id,
        name: spec.name,
        synonyms: spec.synonyms || [],
        rooms: (spec.rooms || []).map((room) => ({
          number: room.number,
          name: spec.roomName || spec.name,
          building: this.data.corpora[0]?.id || 'main',
          floor: '2', // по умолчанию — можно улучшить позже
          node: `node_${room.number}`,
        })),
        doctor: spec.doctor,
        schedule: spec.schedule,
        status: spec.status,
        show_details: spec.showDoctor || spec.showSchedule, // флаг включения деталей
      })),

      qr_nodes: [
        {
          id: 'node_main_entrance',
          name: 'Главный вход',
          building: this.data.corpora[0]?.id || 'main',
          floor: '1',
        },
      ],
    };

    // Скачивание
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ——— Навигация ———
  next() {
    if (this.step < 5) {
      this.step++;
      this.renderStep();
      if (this.onNext) this.onNext();
    } else {
      this.generateQR();
    }
  }

  prev() {
    if (this.step > 1) {
      this.step--;
      this.renderStep();
      if (this.onPrev) this.onPrev();
    }
  }
}

// Глобальный экземпляр для inline-обработчиков (`onclick="wizardInstance..."`)
window.wizardInstance = null;

// Инициализация — вызывается из setup-wizard.html
function initWizard() {
  const wizard = new SetupWizard({
    container: document.getElementById('wizard'),
    onPrev: () => console.log('← Назад'),
    onNext: () => console.log('→ Далее'),
    onFinish: (cfg) => console.log('✅ Сохранено:', cfg),
  });
  window.wizardInstance = wizard;
  wizard.start();
}

// Запуск при загрузке страницы
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWizard);
} else {
  initWizard();
}
