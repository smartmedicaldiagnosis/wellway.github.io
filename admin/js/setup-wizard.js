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
    }
    document.getElementById('btn-prev').disabled = this.step === 1;
  }

  renderStep1() {
    var html = '<h2>Шаг 1: Основные параметры</h2>';
    html += '<label>Сколько корпусов?</label>';
    html += '<input type="number" id="num-corpora" min="1" value="' + (this.data.corpora.length || 1) + '">';
    html += '<label>Главный вход в корпусе:</label>';
    html += '<select id="main-entrance"></select>';

    this.container.innerHTML = html;

    var numInput = document.getElementById('num-corpora');
    var entranceSelect = document.getElementById('main-entrance');

    var updateCorpora = function() {
      var n = Math.max(1, parseInt(numInput.value) || 1);
      while (this.data.corpora.length < n) {
        var idx = this.data.corpora.length + 1;
        this.data.corpora.push({
          id: 'corp-' + idx,
          name: 'Корпус ' + idx,
          floors: 1,
          zones: ['Центр'],
        });
      }
      while (this.data.corpora.length > n) {
        this.data.corpora.pop();
      }

      entranceSelect.innerHTML = '';
      for (var i = 0; i < this.data.corpora.length; i++) {
        var corp = this.data.corpora[i];
        var opt = document.createElement('option');
        opt.value = corp.id;
        opt.textContent = corp.name;
        entranceSelect.appendChild(opt);
      }

      numInput.onchange = function() {
        this.data.mainEntrance = entranceSelect.value;
      }.bind(this);

      entranceSelect.onchange = function() {
        this.data.mainEntrance = entranceSelect.value;
      }.bind(this);

    }.bind(this);

    numInput.oninput = updateCorpora;
    updateCorpora();

    if (this.data.mainEntrance) {
      entranceSelect.value = this.data.mainEntrance;
    }
  }

  renderStep2() {
    var corp = this.data.corpora[this.currentCorpusIndex];
    var html = '<h2>Шаг 2: Настройка ' + corp.name + '</h2>';
    html += '<label>Этажей:</label>';
    html += '<input type="number" id="floors" min="1" value="' + corp.floors + '">';
    html += '<label>Зоны на этаже (через запятую):</label>';
    html += '<input type="text" id="zones" value="' + corp.zones.join(', ') + '">';

    html += '<div style="margin-top: 1rem;">';
    html += '<label>Корпус:</label><br>';
    for (var i = 0; i < this.data.corpora.length; i++) {
      var c = this.data.corpora[i];
      var isActive = i === this.currentCorpusIndex ? 'btn-primary' : '';
      html += '<button type="button" class="btn ' + isActive + '" onclick="wizardInstance.switchCorpus(' + i + ')">' + c.name + '</button>';
    }
    html += '</div>';

    this.container.innerHTML = html;

    var floorsInput = document.getElementById('floors');
    var zonesInput = document.getElementById('zones');

    floorsInput.onchange = function() {
      corp.floors = Math.max(1, parseInt(floorsInput.value) || 1);
    };

    zonesInput.onchange = function() {
      corp.zones = zonesInput.value.split(',').map(function(z) { return z.trim(); }).filter(Boolean);
    };
  }

  switchCorpus(index) {
    this.currentCorpusIndex = index;
    this.renderStep2();
  }

  renderStep3() {
    var html = '<h2>Шаг 3: Распределение кабинетов</h2>';
    html += '<p>На основе введённых корпусов и зон система подготовит структуру.</p>';
    html += '<p><strong>Пример для ' + this.data.corpora[0].name + ':</strong></p>';
    html += '<ul>';

    for (var fi = 0; fi < this.data.corpora[0].floors; fi++) {
      var floorNum = fi + 1;
      html += '<li><strong>Этаж ' + floorNum + '</strong> — зоны: ' + this.data.corpora[0].zones.join(', ') + '</li>';
    }

    html += '</ul>';
    html += '<p>Детальное распределение кабинетов будет доступно в <strong>ручном редакторе</strong> после завершения мастера.</p>';

    this.container.innerHTML = html;
  }

  renderStep4() {
    var html = '<h2>Шаг 4: Специальности</h2>';
    html += '<div id="specs"></div>';
    html += '<button class="btn btn-primary" onclick="wizardInstance.addSpecialty()">➕ Добавить специальность</button>';

    this.container.innerHTML = html;

    var specsContainer = document.getElementById('specs');
    specsContainer.innerHTML = '';

    for (var i = 0; i < this.data.specialties.length; i++) {
      this._renderSpecialty(this.data.specialties[i], i);
    }

    if (this.data.specialties.length === 0) {
      this.addSpecialty();
    }
  }

  _renderSpecialty(spec, index) {
    var div = document.createElement('div');
    div.className = 'spec-item';
    var html = '<hr>';
    html += '<label>Название:</label>';
    html += '<input type="text" data-index="' + index + '" data-field="name" value="' + (spec.name || '') + '">';

    html += '<label>Синонимы (через запятую):</label>';
    html += '<input type="text" data-index="' + index + '" data-field="synonyms" value="' + (spec.synonyms ? spec.synonyms.join(', ') : '') + '">';

    html += '<label>Кабинеты (номера через запятую):</label>';
    html += '<input type="text" data-index="' + index + '" data-field="rooms" value="' + (spec.rooms ? spec.rooms.map(function(r) { return r.number; }).join(', ') : '') + '">';

    html += '<label>Название помещения:</label>';
    html += '<input type="text" data-index="' + index + '" data-field="roomName" value="' + (spec.roomName || '') + '">';

    html += '<label><input type="checkbox" data-index="' + index + '" data-field="showDoctor" ' + (spec.showDoctor ? 'checked' : '') + '> Показывать фамилию врача (скрыто)</label>';
    html += '<label><input type="checkbox" data-index="' + index + '" data-field="showSchedule" ' + (spec.showSchedule ? 'checked' : '') + '> Показывать расписание (скрыто)</label>';

    html += '<button type="button" class="btn" style="background:#f44336;color:white;" onclick="wizardInstance.removeSpecialty(' + index + ')">Удалить</button>';

    div.innerHTML = html;
    document.getElementById('specs').appendChild(div);

    var inputs = div.querySelectorAll('input');
    for (var j = 0; j < inputs.length; j++) {
      var el = inputs[j];
      el.onchange = function() {
        var idx = parseInt(this.dataset.index);
        var field = this.dataset.field;
        var value = this.type === 'checkbox' ? this.checked : this.value.trim();

        if (!this.data.specialties[idx]) return;

        switch (field) {
          case 'name':
            this.data.specialties[idx].name = value;
            break;
          case 'synonyms':
            this.data.specialties[idx].synonyms = value.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
            break;
          case 'rooms':
            this.data.specialties[idx].rooms = value.split(',').map(function(num) { return num.trim(); }).filter(Boolean).map(function(num) { return { number: num }; });
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
      }.bind(this);
    }
  }

  addSpecialty() {
    var spec = {
      id: 'spec-' + Date.now(),
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

  renderStep5() {
    var html = '<h2>Шаг 5: Генерация QR-кодов</h2>';
    html += '<p>Рекомендуемые точки размещения QR-кодов:</p>';
    html += '<ul>';
    html += '<li>• Главный вход (' + (this.data.corpora[0] ? this.data.corpora[0].name : 'Корпус 1') + ', 1 этаж)</li>';
    html += '<li>• Вход в ' + (this.data.corpora[0] && this.data.corpora[0].zones[0] ? this.data.corpora[0].zones[0] : 'центр') + ', 2 этаж</li>';
    html += '<li>• Развилка у лифта, 3 этаж</li>';
    html += '</ul>';
    html += '<p><em>Подробная настройка точек будет доступна в редакторе.</em></p>';
    html += '<button class="btn btn-primary" onclick="wizardInstance.generateQR()">✅ Сохранить и скачать config.json</button>';

    this.container.innerHTML = html;
  }

  generateQR() {
    var config = {
      version: '1.1',
      admin_password: 'wellway',
      corpora: this.data.corpora.map(function(corp, i) {
        return {
          id: corp.id,
          name: corp.name,
          entrance: i === 0 ? (this.data.mainEntrance || corp.id) : null,
          floors: Array.from({ length: corp.floors }, function(_, fi) {
            return {
              id: '' + (fi + 1),
              zones: corp.zones.map(function(zoneName) {
                return {
                  name: zoneName,
                  range: '',
                  node: 'node_' + corp.id + '_' + (fi + 1) + 'f_' + zoneName.replace(/\s+/g, '_').toLowerCase() + '_entrance'
                };
              })
            };
          })
        };
      }.bind(this)),

      specialties: this.data.specialties.map(function(spec) {
        return {
          id: spec.id,
          name: spec.name,
          synonyms: spec.synonyms || [],
          rooms: (spec.rooms || []).map(function(room) {
            return {
              number: room.number,
              name: spec.roomName || spec.name,
              building: this.data.corpora[0] ? this.data.corpora[0].id : 'main',
              floor: '2',
              node: 'node_' + room.number
            };
          }.bind(this)),
          doctor: spec.doctor,
          schedule: spec.schedule,
          status: spec.status,
          show_details: spec.showDoctor || spec.showSchedule
        };
      }.bind(this)),

      qr_nodes: [
        {
          id: 'node_main_entrance',
          name: 'Главный вход',
          building: this.data.corpora[0] ? this.data.corpora[0].id : 'main',
          floor: '1'
        }
      ]
    };

    var blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    a.click();
    URL.revokeObjectURL(url);
  }

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

window.wizardInstance = null;

function initWizard() {
  var wizard = new SetupWizard({
    container: document.getElementById('wizard'),
    onPrev: function() { console.log('← Назад'); },
    onNext: function() { console.log('→ Далее'); },
    onFinish: function(cfg) { console.log('✅ Сохранено:', cfg); }
  });
  window.wizardInstance = wizard;
  wizard.start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWizard);
} else {
  initWizard();
}
