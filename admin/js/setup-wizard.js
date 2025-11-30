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
      mainEntrance: null,
    };
    this.currentCorpusIndex = 0;
  }

  start() {
    this.renderStep();
  }

  renderStep() {
    this.container.innerHTML = '';
    switch (this.step) {
      case 1: this.renderStep1(); break;
      case 2: this.renderStep2(); break;
      case 3: this.renderStep3(); break;
      case 4: this.renderStep4(); break;
      case 5: this.renderStep5(); break;
      default: this.renderStep1();
    }

    const prevBtn = document.getElementById('btn-prev');
    if (prevBtn) prevBtn.disabled = this.step === 1;
  }

  // ——— Шаг 1: количество корпусов и главный вход ———
  renderStep1() {
    const currentCount = this.data.corpora.length || 1;
    this.container.innerHTML = `
      <h2>Шаг 1: Основные параметры</h2>
      <label>Сколько корпусов?</label>
      <input type="number" id="num-corpora" min="1" value="${currentCount}">
      <label>Главный вход в корпусе:</label>
      <select id="main-entrance"></select>
    `;

    const numInput = document.getElementById('num-corpora');
    const entranceSelect = document.getElementById('main-entrance');

    const updateCorpora = () => {
      const n = Math.max(1, parseInt(numInput.value) || 1);

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

      entranceSelect.innerHTML = '';
      this.data.corpora.forEach((corp, i) => {
        const opt = document.createElement('option');
        opt.value = corp.id;
        opt.textContent = corp.name;
        entranceSelect.appendChild(opt);
      });

      if (!this.data.mainEntrance && this.data.corpora.length > 0) {
        this.data.mainEntrance = this.data.corpora[0].id;
      }
      if (this.data.mainEntrance) {
        entranceSelect.value = this.data.mainEntrance;
      }
    };

    numInput.onchange = updateCorpora;
    updateCorpora();

    entranceSelect.onchange = () => {
      this.data.mainEntrance = entranceSelect.value;
    };

    if (this.data.mainEntrance) {
      entranceSelect.value = this.data.mainEntrance;
    }
  }

  // ——— Шаг 2: настройка корпусов по одному ———
  renderStep2() {
    const corp = this.data.corpora[this.currentCorpusIndex];
    if (!corp) {
      this.step = 1;
      this.renderStep();
      return;
    }

    let corpsButtons = '';
    this.data.corpora.forEach((c, i) => {
      const activeClass = i === this.currentCorpusIndex ? ' btn-primary' : '';
      corpsButtons += `<button type="button" class="btn${activeClass}" onclick="wizardInstance.switchCorpus(${i})">${c.name}</button>`;
    });

    this.container.innerHTML = `
      <h2>Шаг 2: Настройка ${corp.name}</h2>
      <label>Этажей:</label>
      <input type="number" id="floors" min="1" value="${corp.floors}">
      <label>Зоны на этаже (через запятую):</label>
      <input type="text" id="zones" value="${corp.zones.join(', ')}">
      <div style="margin-top: 1rem;">
        <label>Корпус:</label><br>
        ${corpsButtons}
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
        .map(z => z.trim())
        .filter(Boolean);
    };
  }

  switchCorpus(index) {
    this.currentCorpusIndex = index;
    this.renderStep2();
  }

  // ——— Шаг 3: распределение кабинетов — ОБНОВЛЁННЫЙ ———
  renderStep3() {
    this.container.innerHTML = `<h2>Шаг 3: Распределение кабинетов</h2>`;

    const preview = document.createElement('div');
    preview.style.lineHeight = '1.6';

    this.data.corpora.forEach((corp, ci) => {
      const corpsDiv = document.createElement('div');
      corpsDiv.style.marginBottom = '1.5rem';
      corpsDiv.style.padding = '1rem';
      corpsDiv.style.border = '1px solid #eee';
      corpsDiv.style.borderRadius = '8px';
      corpsDiv.style.backgroundColor = '#fafafa';

      const title = document.createElement('h3');
      title.textContent = `Корпус ${ci + 1}`;
      title.style.marginTop = '0';
      title.style.marginBottom = '0.5rem';

      const floorsInfo = document.createElement('p');
      floorsInfo.innerHTML = `<strong>Этажей:</strong> ${corp.floors}`;
      floorsInfo.style.margin = '0.25rem 0';

      const zonesInfo = document.createElement('p');
      const zonesList = corp.zones.length
        ? corp.zones.join(', ')
        : '—';
      zonesInfo.innerHTML = `<strong>Зоны:</strong> ${zonesList}`;
      zonesInfo.style.margin = '0.25rem 0';

      corpsDiv.appendChild(title);
      corpsDiv.appendChild(floorsInfo);
      corpsDiv.appendChild(zonesInfo);
      preview.appendChild(corpsDiv);
    });

    this.container.appendChild(preview);

    const note = document.createElement('p');
    note.style.fontSize = '0.9rem';
    note.style.color = '#666';
    note.style.marginTop = '1.5rem';
    note.innerHTML = `<em>Подробное распределение кабинетов по зонам (например, «101–110») будет доступно в <strong>ручном редакторе</strong> после завершения мастера.</em>`;
    this.container.appendChild(note);
  }

  // ——— Шаг 4: специальности ———
  renderStep4() {
    this.container.innerHTML = `
      <h2>Шаг 4: Специальности</h2>
      <div id="specs"></div>
      <button class="btn btn-primary" onclick="wizardInstance.addSpecialty()">Добавить ➕ специальность</button>
    `;

    const specsContainer = document.getElementById('specs');
    specsContainer.innerHTML = '';

    this.data.specialties.forEach((spec, i) => {
      this._renderSpecialty(spec, i);
    });

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
      <input type="text" data-index="${index}" data-field="synonyms" value="${(spec.synonyms || []).join(', ')}">
      <label>Кабинеты (номера через запятую):</label>
      <input type="text" data-index="${index}" data-field="rooms" value="${(spec.rooms || []).map(r => r.number).join(', ')}">
      <label>Название помещения:</label>
      <input type="text" data-index="${index}" data-field="roomName" value="${spec.roomName || ''}">
      <label><input type="checkbox" data-index="${index}" data-field="showDoctor" ${spec.showDoctor ? 'checked' : ''}> Показывать фамилию врача (скрыто)</label>
      <label><input type="checkbox" data-index="${index}" data-field="showSchedule" ${spec.showSchedule ? 'checked' : ''}> Показывать расписание (скрыто)</label>
      <button type="button" class="btn" style="background:#f44336;color:white;" onclick="wizardInstance.removeSpecialty(${index})">Удалить</button>
    `;
    document.getElementById('specs').appendChild(div);

    div.querySelectorAll('input').forEach(el => {
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
              .map(s => s.trim())
              .filter(Boolean);
            break;
          case 'rooms':
            this.data.specialties[idx].rooms = value
              .split(',')
              .map(num => num.trim())
              .filter(Boolean)
              .map(num => ({ number: num }));
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
    this.renderStep4();
  }

  // ——— Шаг 5: генерация QR и сохранение ———
  renderStep5() {
    this.container.innerHTML = `
      <h2>Шаг 5: Генерация QR-кодов</h2>
      <p>Рекомендуемые точки размещения QR-кодов:</p>
      <ul>
        <li>• Главный вход (${this.data.corpora[0]?.name || 'Корпус 1'}, 1 этаж)</li>
        ${this.data.corpora.map((corp, ci) =>
          corp.zones.map((zone, zi) =>
            `<li>• Вход в «${zone}», ${Math.min(2, corp.floors)} этаж (${corp.name})</li>`
          ).slice(0, 1)
        ).flat().join('')}
      </ul>
      <p><em>Точную настройку узлов можно выполнить в редакторе позже.</em></p>
      <button class="btn btn-primary" onclick="wizardInstance.generateQR()">Сохранить и скачать ✅ config.json</button>
    `;
  }

  generateQR() {
    const config = {
      version: '1.1',
      admin_password: 'wellway',
      corpora: this.data.corpora.map((corp) => ({
        id: corp.id,
        name: corp.name,
        entrance: corp.id === this.data.mainEntrance ? 'node_main_entrance' : null,
        floors: Array.from({ length: corp.floors }, (_, fi) => ({
          id: `${fi + 1}`,
          zones: corp.zones.map(zoneName => ({
            name: zoneName,
            range: '',
            node: `node_${corp.id}_${fi + 1}f_${zoneName.replace(/\s+/g, '_').toLowerCase()}_entrance`,
          })),
        })),
      })),
      specialties: this.data.specialties.map(spec => ({
        id: spec.id,
        name: spec.name,
        synonyms: spec.synonyms || [],
        rooms: (spec.rooms || []).map(room => ({
          number: room.number,
          name: spec.roomName || spec.name,
          building: this.data.corpora[0]?.id || 'main',
          floor: '2',
          node: `node_${room.number}`,
        })),
        doctor: spec.doctor || 'Иванова А.П.',
        schedule: spec.schedule || 'Пн–Пт 9:00–15:00',
        status: spec.status || 'работает',
        show_details: !!(spec.showDoctor || spec.showSchedule),
      })),
      qr_nodes: [
        {
          id: 'node_main_entrance',
          name: 'Главный вход',
          building: this.data.corpora[0]?.id || 'main',
          floor: '1',
        },
        ...this.data.corpora.flatMap(corp =>
          Array.from({ length: corp.floors }, (_, fi) =>
            corp.zones.map(zone =>
              ({
                id: `node_${corp.id}_${fi + 1}f_${zone.replace(/\s+/g, '_').toLowerCase()}_entrance`,
                name: `Вход в ${zone} (${corp.name}, ${fi + 1} этаж)`,
                building: corp.id,
                floor: `${fi + 1}`,
              })
            )
          ).flat()
        ),
      ],
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    a.click();
    URL.revokeObjectURL(url);

    if (this.onFinish) this.onFinish(config);
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

// Глобальный экземпляр для onclick
window.wizardInstance = null;

function bindWizardButtons(wizard) {
  const nextBtn = document.getElementById('btn-next');
  const prevBtn = document.getElementById('btn-prev');

  if (nextBtn) nextBtn.onclick = () => wizard.next();
  if (prevBtn) prevBtn.onclick = () => wizard.prev();
}

function initWizard() {
  const container = document.getElementById('wizard');
  if (!container) return;

  const wizard = new SetupWizard({
    container: container,
    onPrev: () => console.log('← Назад'),
    onNext: () => console.log('→ Далее'),
    onFinish: (cfg) => console.log('✅ Конфигурация сформирована:', cfg),
  });

  window.wizardInstance = wizard;
  wizard.start();
  bindWizardButtons(wizard);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWizard);
} else {
  initWizard();
}
