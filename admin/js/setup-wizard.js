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
      default:
        this.renderStep1();
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

  // ——— Шаг 3: распределение кабинетов — ПОЛНЫЙ ВВОД (обновлённый) ———
  renderStep3() {
    this.container.innerHTML = `<h2>Шаг 3: Распределение кабинетов</h2>`;

    const corpsContainer = document.createElement('div');
    corpsContainer.id = 'corps-config';

    this.data.corpora.forEach((corp, ci) => {
      const corpDiv = document.createElement('div');
      corpDiv.className = 'corp-section';
      corpDiv.style.border = '1px solid #eee';
      corpDiv.style.borderRadius = '8px';
      corpDiv.style.padding = '1rem';
      corpDiv.style.marginBottom = '1.5rem';
      corpDiv.style.backgroundColor = '#fafafa';

      const title = document.createElement('h3');
      title.textContent = `Корпус: ${corp.name}`;
      corpDiv.appendChild(title);

      for (let fi = 1; fi <= corp.floors; fi++) {
        const floorDiv = document.createElement('div');
        floorDiv.className = 'floor-section';
        floorDiv.style.marginTop = '1rem';

        const floorTitle = document.createElement('h4');
        floorTitle.textContent = `Этаж ${fi}`;
        floorTitle.style.margin = '0.5rem 0';
        floorDiv.appendChild(floorTitle);

        corp.zones.forEach((zoneName, zi) => {
          const zoneDiv = document.createElement('div');
          zoneDiv.className = 'zone-config';
          zoneDiv.style.padding = '0.75rem';
          zoneDiv.style.border = '1px dashed #ccc';
          zoneDiv.style.borderRadius = '4px';
          zoneDiv.style.marginTop = '0.5rem';
          zoneDiv.style.backgroundColor = '#fff';

          zoneDiv.innerHTML = `
            <strong>${zoneName}</strong>
            <div style="margin-top: 0.5rem;">
              <label>Диапазон кабинетов:</label>
              <input type="text" class="range-input" data-corp="${ci}" data-floor="${fi}" data-zone="${zi}" 
                     placeholder="101–110" value="${this._getZoneValue(ci, fi, zi, 'range') || ''}">
            </div>
            <div>
              <label>Тип кабинетов:</label>
              <input type="text" class="type-input" data-corp="${ci}" data-floor="${fi}" data-zone="${zi}" 
                     placeholder="Основные приёмы" value="${this._getZoneValue(ci, fi, zi, 'type') || ''}">
            </div>
            <div>
              <label>ID узла входа:</label>
              <input type="text" class="node-input" data-corp="${ci}" data-floor="${fi}" data-zone="${zi}" 
                     placeholder="node_1f_right_entrance" value="${this._getZoneValue(ci, fi, zi, 'node') || ''}">
            </div>
          `;
          floorDiv.appendChild(zoneDiv);
        });

        corpDiv.appendChild(floorDiv);
      }

      corpsContainer.appendChild(corpDiv);
    });

    this.container.appendChild(corpsContainer);

    // — Обработчики input —
    corpsContainer.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', (e) => {
        const { corp, floor, zone } = e.target.dataset;
        const field = e.target.classList.contains('range-input') ? 'range' :
                      e.target.classList.contains('type-input')  ? 'type'  :
                      e.target.classList.contains('node-input')  ? 'node'  : null;

        if (!field) return;

        // Инициализируем структуру, если ещё не создана
        if (!this.data.corpora[corp].floorZones) {
          this.data.corpora[corp].floorZones = {};
        }
        const key = `${floor}-${zone}`;
        if (!this.data.corpora[corp].floorZones[key]) {
          this.data.corpora[corp].floorZones[key] = {};
        }

        this.data.corpora[corp].floorZones[key][field] = e.target.value.trim();
      });
    });

    // — Кнопка перехода к следующему шагу —
    const nextBtn = document.getElementById('btn-next');
    if (nextBtn && !nextBtn.dataset.bound) {
      nextBtn.dataset.bound = 'true';
      nextBtn.onclick = () => this.next();
    }
  }

  // Вспомогательная функция для получения сохранённого значения
  _getZoneValue(corpIdx, floor, zoneIdx, field) {
    const corp = this.data.corpora[corpIdx];
    if (!corp || !corp.floorZones) return '';
    const key = `${floor}-${zoneIdx}`;
    return corp.floorZones[key]?.[field] || '';
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
      <input type="text" data-index="${index}" data-field="synonyms" value="${(spec.synonyms || []).join(',')}">
      <label>Кабинеты (номера через запятую):</label>
      <input type="text" data-index="${index}" data-field="rooms" value="${(spec.rooms || []).map(r => r.number).join(',')}">
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
        ${this.data.corpora
          .map((corp, ci) =>
            corp.zones
              .map((zone, zi) =>
                `<li>• Вход в «${zone}», ${Math.min(2, corp.floors)} этаж (${corp.name})</li>`
              )
              .slice(0, 1)
          )
          .flat()
          .join('')}
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
        entrance:
          corp.id === this.data.mainEntrance ? 'node_main_entrance' : null,
        floors: Array.from({ length: corp.floors }, (_, fi) => ({
          id: `${fi + 1}`,
          zones: corp.zones.map((zoneName, zi) => {
            const key = `${fi + 1}-${zi}`;
            const zoneData = corp.floorZones?.[key] || {};
            return {
              name: zoneName,
              range: zoneData.range || '',
              node:
                zoneData.node ||
                `node_${corp.id}_${fi + 1}f_${zoneName.replace(/\s+/g, '_').toLowerCase()}_entrance`,
            };
          }),
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
        // Добавляем узлы из floorZones.node
        ...this.data.corpora.flatMap((corp) =>
          Array.from({ length: corp.floors }, (_, fi) =>
            corp.zones.map((_, zi) => {
              const key = `${fi + 1}-${zi}`;
              const zoneData = corp.floorZones?.[key];
              if (zoneData?.node) {
                return {
                  id: zoneData.node,
                  name: `Вход (${corp.name}, этаж ${fi + 1}, зона ${corp.zones[zi]})`,
                  building: corp.id,
                  floor: `${fi + 1}`,
                };
              }
              return null;
            })
          ).flat().filter(Boolean)
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

// ——— Инициализация ———
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
