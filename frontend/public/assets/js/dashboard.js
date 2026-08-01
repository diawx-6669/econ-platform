(function () {
  "use strict";

  var API_BASE = window.__API_BASE__ || "http://localhost:4000/api";
  var AUTH_KEY = "index_econ_auth";
  var PROGRESS_KEY_PREFIX = "index_econ_progress_";

  // ---------------------------------------------------------------
  // 0. Auth guard
  // ---------------------------------------------------------------

  var session = null;
  try {
    var raw = localStorage.getItem(AUTH_KEY);
    if (raw) session = JSON.parse(raw);
  } catch (e) { /* ignore */ }

  if (!session || !session.token) {
    window.location.replace("index.html");
    return;
  }

  var user = session.user || { name: "Гость", email: "" };
  var progressKey = PROGRESS_KEY_PREFIX + (user.email || "guest");

  function loadProgress() {
    try {
      var p = JSON.parse(localStorage.getItem(progressKey));
      if (p && typeof p === "object") return p;
    } catch (e) { /* ignore */ }
    return { completed: {}, quizScores: {}, lastVisited: null, stars: 0 };
  }

  function saveProgress() {
    try { localStorage.setItem(progressKey, JSON.stringify(progress)); } catch (e) { /* ignore */ }
  }

  var progress = loadProgress();

  // Optional: verify session against backend if it's reachable; fail silently otherwise.
  fetch(API_BASE + "/auth/me", { headers: { Authorization: "Bearer " + session.token } })
    .then(function (res) {
      if (res.status === 401) {
        localStorage.removeItem(AUTH_KEY);
        window.location.replace("index.html");
      }
    })
    .catch(function () { /* backend offline — keep working from local session */ });

  // ---------------------------------------------------------------
  // 1. Course & lesson content
  // ---------------------------------------------------------------

  var COURSES = [
    {
      id: "basics",
      theme: "violet",
      icon: "🧠",
      title: "Основы экономики",
      desc: "Зачем вообще нужна экономика, ограниченность ресурсов и альтернативные издержки.",
      lessons: [
        {
          id: "basics-1",
          title: "Что такое экономика",
          kind: "theory",
          blocks: [
            { p: "Экономика изучает, как люди, компании и государства принимают решения в условиях ограниченности ресурсов. Ресурсов — времени, денег, сырья, труда — всегда меньше, чем желаний их использовать." },
            { h3: "Три главных вопроса" },
            { ul: [
              "Что производить? — какие товары и услуги нужны обществу",
              "Как производить? — какие технологии и ресурсы использовать",
              "Для кого производить? — как распределить произведённое"
            ] },
            { callout: "tip", text: "Экономика — это не только про деньги и биржу. Это про выбор в условиях, когда всё сразу получить нельзя." }
          ],
          quiz: [
            {
              q: "Почему возникает экономическая проблема выбора?",
              options: [
                "Потому что люди жадные",
                "Потому что ресурсы ограничены, а потребности безграничны",
                "Потому что государство печатает мало денег",
                "Потому что не хватает магазинов"
              ],
              correct: 1,
              explain: "Ключевая идея экономики — ограниченность ресурсов при неограниченных потребностях. Именно это заставляет выбирать."
            },
            {
              q: "Какой из вопросов НЕ входит в тройку базовых экономических вопросов?",
              options: ["Что производить", "Как производить", "Когда закрывать биржу", "Для кого производить"],
              correct: 2,
              explain: "«Когда закрывать биржу» — операционный вопрос, а не фундаментальный экономический."
            }
          ]
        },
        {
          id: "basics-2",
          title: "Альтернативные издержки",
          kind: "theory",
          blocks: [
            { p: "Альтернативные издержки (opportunity cost) — это ценность лучшей из упущенных альтернатив, когда вы делаете выбор." },
            { formula: "Альтернативные издержки = ценность лучшего из отвергнутых вариантов" },
            { p: "Например: вы потратили вечер на подготовку к экзамену вместо подработки за 2000₽. Альтернативные издержки этого вечера — именно эти 2000₽, даже если вы не потратили ни рубля." },
            { callout: "fact", text: "Даже «бесплатные» решения не бывают бесплатными — вы всегда жертвуете чем-то ещё: временем, вниманием, другой возможностью." }
          ],
          quiz: [
            {
              q: "Студент отказался от подработки за 3000₽ в день, чтобы готовиться к экзамену. Чему равны альтернативные издержки этого дня подготовки?",
              options: ["0₽, ведь учёба бесплатна", "3000₽", "Стоимости учебников", "Это нельзя посчитать"],
              correct: 1,
              explain: "Альтернативные издержки равны ценности лучшей упущенной альтернативы — то есть 3000₽ несостоявшегося заработка."
            },
            {
              q: "Компания может выпустить либо 100 телефонов, либо 500 наушников на одном заводе. Что здесь является альтернативными издержками выпуска телефонов?",
              options: ["Стоимость завода", "Упущенные 500 наушников (в пересчёте на выгоду от них)", "Зарплата рабочих", "Ничего, ресурсы не ограничены"],
              correct: 1,
              explain: "Ресурсы завода ограничены — выбирая телефоны, компания жертвует возможностью произвести наушники."
            }
          ]
        },
        {
          id: "basics-3",
          title: "Кривая производственных возможностей",
          kind: "interactive-ppf",
          blocks: [
            { p: "Кривая производственных возможностей (КПВ) показывает все комбинации двух товаров, которые экономика может произвести при полном использовании ограниченных ресурсов." },
            { p: "Любая точка на самой кривой — эффективное использование ресурсов. Точка внутри кривой — ресурсы используются не полностью. Точка снаружи — недостижима при текущих ресурсах и технологиях." },
            { callout: "tip", text: "Подвигайте ползунок ниже, чтобы увидеть, как перераспределение ресурсов между двумя товарами меняет объём производства каждого из них." }
          ],
          quiz: [
            {
              q: "Что означает точка, лежащая ВНУТРИ кривой производственных возможностей?",
              options: [
                "Экономика работает эффективно на пределе возможностей",
                "Ресурсы используются не полностью (например, безработица)",
                "Комбинация недостижима",
                "Технологии улучшились"
              ],
              correct: 1,
              explain: "Точки внутри КПВ показывают неполное использование ресурсов — часть мощностей простаивает."
            },
            {
              q: "Что может сдвинуть всю КПВ наружу (экономический рост)?",
              options: [
                "Снижение цен в магазинах",
                "Технологический прогресс или рост объёма ресурсов",
                "Перераспределение бюджета между товарами",
                "Увеличение импорта одного товара"
              ],
              correct: 1,
              explain: "Наружный сдвиг КПВ отражает рост потенциала экономики — новые технологии, больше труда, капитала или природных ресурсов."
            }
          ]
        }
      ]
    },
    {
      id: "market",
      theme: "teal",
      icon: "🛒",
      title: "Спрос и предложение",
      desc: "Как формируется рыночная цена, что такое равновесие и эластичность.",
      lessons: [
        {
          id: "market-1",
          title: "Закон спроса и предложения",
          kind: "theory",
          blocks: [
            { p: "Закон спроса: при прочих равных, чем выше цена товара, тем меньше его хотят купить. Закон предложения: чем выше цена, тем больше продавцы готовы предложить." },
            { p: "Точка, где кривая спроса пересекает кривую предложения, называется рыночным равновесием — цена и объём, при которых покупатели и продавцы согласны на сделку." },
            { callout: "fact", text: "Если цена выше равновесной — образуется избыток товара. Если ниже — дефицит." }
          ],
          quiz: [
            {
              q: "Что произойдёт, если государство установит цену НИЖЕ равновесной (например, на аренду жилья)?",
              options: ["Возникнет избыток предложения", "Возникнет дефицит — спрос превысит предложение", "Ничего не изменится", "Цена сама вырастет обратно"],
              correct: 1,
              explain: "При цене ниже равновесной покупателей, готовых купить по низкой цене, больше, чем товара, который продавцы готовы предложить — возникает дефицит."
            },
            {
              q: "Рыночное равновесие — это точка, где...",
              options: [
                "Цена максимальна",
                "Объём спроса равен объёму предложения",
                "Государство фиксирует цену",
                "Продавцов больше, чем покупателей"
              ],
              correct: 1,
              explain: "Равновесие — это именно точка пересечения кривых спроса и предложения, где объёмы совпадают."
            }
          ]
        },
        {
          id: "market-2",
          title: "Тренажёр рыночного равновесия",
          kind: "interactive-supply-demand",
          blocks: [
            { p: "На рынок влияют факторы, которые сдвигают кривые спроса и предложения целиком — не движение вдоль кривой, а именно сдвиг." },
            { ul: [
              "Спрос растёт, если растут доходы населения, мода на товар, ожидания подорожания",
              "Предложение растёт, если дешевеет сырьё, появляются новые технологии, снижаются налоги"
            ] },
            { callout: "tip", text: "Подвигайте ползунки «Спрос» и «Предложение» ниже и понаблюдайте, как меняются равновесные цена и объём." }
          ],
          quiz: [
            {
              q: "Доходы населения выросли, и спрос на товар увеличился (кривая спроса сдвинулась вправо). Что произойдёт с равновесной ценой и объёмом при прочих равных?",
              options: [
                "Цена и объём вырастут",
                "Цена и объём упадут",
                "Цена вырастет, объём упадёт",
                "Ничего не изменится"
              ],
              correct: 0,
              explain: "Сдвиг спроса вправо (рост спроса) при неизменном предложении поднимает и равновесную цену, и равновесный объём."
            },
            {
              q: "Подешевело сырьё, и предложение выросло (кривая сдвинулась вправо). Что произойдёт с равновесной ценой?",
              options: ["Вырастет", "Упадёт", "Останется прежней", "Станет равна нулю"],
              correct: 1,
              explain: "Рост предложения при неизменном спросе снижает равновесную цену, а равновесный объём растёт."
            }
          ]
        },
        {
          id: "market-3",
          title: "Эластичность спроса",
          kind: "interactive-elasticity",
          blocks: [
            { p: "Эластичность спроса по цене показывает, насколько сильно объём спроса реагирует на изменение цены." },
            { formula: "Ed = (% изменения объёма спроса) / (% изменения цены)" },
            { ul: [
              "|Ed| > 1 — спрос эластичный (чувствительный к цене): деликатесы, поездки за границу",
              "|Ed| < 1 — спрос неэластичный: хлеб, лекарства, соль",
              "|Ed| = 1 — единичная эластичность"
            ] }
          ],
          quiz: [
            {
              q: "Цена на инсулин выросла на 20%, а объём покупок упал лишь на 2%. Какой это тип спроса?",
              options: ["Эластичный", "Неэластичный", "Единичной эластичности", "Отрицательный"],
              correct: 1,
              explain: "Небольшое изменение объёма при большом изменении цены — признак неэластичного спроса. Так ведут себя жизненно необходимые товары."
            },
            {
              q: "Что из перечисленного обычно имеет БОЛЕЕ эластичный спрос?",
              options: ["Соль", "Хлеб", "Поход в ресторан премиум-класса", "Инсулин"],
              correct: 2,
              explain: "Товары не первой необходимости (рестораны, путешествия, роскошь) обычно эластичнее — от них легче отказаться при росте цены."
            }
          ]
        }
      ]
    },
    {
      id: "money",
      theme: "gold",
      icon: "💰",
      title: "Деньги и инфляция",
      desc: "Почему цены растут, что такое покупательная способность и роль центробанка.",
      lessons: [
        {
          id: "money-1",
          title: "Что такое инфляция",
          kind: "theory",
          blocks: [
            { p: "Инфляция — устойчивый рост общего уровня цен в экономике, при котором на одну и ту же сумму денег со временем можно купить меньше товаров." },
            { ul: [
              "Инфляция спроса — когда денег в экономике больше, чем товаров",
              "Инфляция издержек — когда дорожают сырьё, энергия, труд",
              "Гиперинфляция — экстремальный, часто неконтролируемый рост цен"
            ] },
            { callout: "warn", text: "Дефляция (падение цен) звучит приятно, но часто означает падение спроса и производства — это тоже риск для экономики." }
          ],
          quiz: [
            {
              q: "Что такое покупательная способность денег при инфляции?",
              options: [
                "Она растёт вместе с ценами",
                "Она снижается — на ту же сумму можно купить меньше",
                "Не меняется",
                "Зависит только от курса доллара"
              ],
              correct: 1,
              explain: "При инфляции цены растут, а фиксированная сумма денег «покупает» меньше товаров — покупательная способность падает."
            },
            {
              q: "Инфляция издержек чаще всего вызвана...",
              options: ["Ростом доходов населения", "Удорожанием сырья и производственных затрат", "Снижением налогов", "Ростом сбережений"],
              correct: 1,
              explain: "Инфляция издержек возникает, когда растут затраты на производство — сырьё, энергия, зарплаты — и это закладывается в цены."
            }
          ]
        },
        {
          id: "money-2",
          title: "Калькулятор инфляции",
          kind: "interactive-inflation",
          blocks: [
            { p: "Посчитаем, как инфляция «съедает» стоимость денег во времени. Задайте текущую стоимость условной продуктовой корзины, ожидаемый темп инфляции и горизонт в годах." },
            { callout: "fact", text: "Даже скромные 8% годовых удваивают цены примерно за 9 лет — работает та же логика, что и со сложным процентом." }
          ],
          quiz: [
            {
              q: "При инфляции 10% в год, во сколько раз примерно вырастут цены за 7 лет?",
              options: ["В 1.1 раза", "Примерно в 2 раза", "В 10 раз", "Цены не изменятся"],
              correct: 1,
              explain: "10% годовых сложным образом удваивают цены примерно за 7 лет (правило 70: 70/10 ≈ 7)."
            },
            {
              q: "Если ваша зарплата не индексируется, а инфляция 12% в год, что происходит с вашим реальным доходом?",
              options: ["Растёт", "Падает", "Не меняется", "Зависит от курса валют"],
              correct: 1,
              explain: "Без индексации номинальная зарплата остаётся прежней, а покупательная способность (реальный доход) снижается вслед за ростом цен."
            }
          ]
        },
        {
          id: "money-3",
          title: "Роль центрального банка",
          kind: "theory",
          blocks: [
            { p: "Центральный банк управляет денежно-кредитной политикой, чтобы удерживать инфляцию на целевом уровне и поддерживать финансовую стабильность." },
            { h3: "Главный инструмент — ключевая ставка" },
            { ul: [
              "Повышение ставки делает кредиты дороже → спрос и инфляция замедляются",
              "Снижение ставки делает кредиты дешевле → экономика и спрос ускоряются"
            ] },
            { callout: "tip", text: "Повышение ставки — это как «тормоз» для перегретой экономики, снижение — «газ» для стимулирования роста." }
          ],
          quiz: [
            {
              q: "Центробанк резко повышает ключевую ставку. Какой эффект это окажет на инфляцию в среднесрочной перспективе?",
              options: ["Инфляция ускорится", "Инфляция должна замедлиться", "Никак не повлияет", "Цены упадут до нуля"],
              correct: 1,
              explain: "Более высокая ставка удорожает кредиты, охлаждает спрос, что со временем замедляет рост цен."
            },
            {
              q: "Основная цель денежно-кредитной политики большинства центробанков — это...",
              options: ["Максимизация прибыли банков", "Ценовая стабильность (контроль инфляции)", "Рост курса национальной валюты любой ценой", "Увеличение госдолга"],
              correct: 1,
              explain: "Главный мандат большинства центральных банков — удержание инфляции вблизи целевого уровня и финансовая стабильность."
            }
          ]
        }
      ]
    },
    {
      id: "personal",
      theme: "pink",
      icon: "🐷",
      title: "Личные финансы",
      desc: "Сложный процент, бюджетирование и практические инструменты для повседневных решений.",
      lessons: [
        {
          id: "personal-1",
          title: "Сложный процент",
          kind: "interactive-compound",
          blocks: [
            { p: "Сложный процент — это когда доход начисляется не только на изначальную сумму, но и на уже накопленные проценты. Со временем это создаёт эффект «снежного кома»." },
            { formula: "FV = P × (1 + r/n)^(n×t)" },
            { callout: "fact", text: "Альберт Эйнштейну приписывают фразу, что сложный процент — «восьмое чудо света». Чем раньше вы начали копить, тем сильнее работает время на вас." }
          ],
          quiz: [
            {
              q: "В чём принципиальное отличие сложного процента от простого?",
              options: [
                "Сложный процент начисляется реже",
                "Сложный процент начисляется и на проценты, а не только на первоначальную сумму",
                "Сложный процент доступен только банкам",
                "Разницы нет"
              ],
              correct: 1,
              explain: "Ключевая идея сложного процента — реинвестирование: проценты сами начинают приносить проценты."
            },
            {
              q: "Что сильнее всего увеличивает итоговую сумму при долгосрочных накоплениях со сложным процентом?",
              options: ["Более короткий срок накоплений", "Более длинный срок накоплений", "Хранение денег наличными", "Ежедневное снятие процентов"],
              correct: 1,
              explain: "Эффект сложного процента ускоряется со временем — чем дольше горизонт, тем больше итоговый прирост."
            }
          ]
        },
        {
          id: "personal-2",
          title: "Бюджет по правилу 50/30/20",
          kind: "interactive-budget",
          blocks: [
            { p: "Простое правило распределения дохода: 50% — обязательные траты (жильё, еда, транспорт), 30% — желания (развлечения, хобби), 20% — накопления и погашение долгов." },
            { callout: "tip", text: "Это ориентир, а не догма — соотношение можно адаптировать под свою ситуацию. Главное, чтобы накопления не были «тем, что осталось в конце месяца»." }
          ],
          quiz: [
            {
              q: "По правилу 50/30/20, к какой категории обычно относят подписку на стриминг-сервис для развлечения?",
              options: ["Обязательные траты (50%)", "Желания (30%)", "Накопления (20%)", "Ни к одной из категорий"],
              correct: 1,
              explain: "Развлекательные подписки, не являющиеся необходимостью, обычно относят к категории «желания»."
            },
            {
              q: "Почему финансовые консультанты советуют откладывать накопления В НАЧАЛЕ месяца, а не в конце?",
              options: [
                "Так требует закон",
                "Чтобы не оставлять накопления «на потом», когда деньги чаще всего уже потрачены",
                "Это не имеет значения",
                "Банки платят больше процентов в начале месяца"
              ],
              correct: 1,
              explain: "Принцип «сначала заплати себе» снижает риск того, что до накоплений просто не дойдут свободные деньги в конце месяца."
            }
          ]
        }
      ]
    }
  ];

  var LESSON_INDEX = {};
  var COURSE_OF_LESSON = {};
  COURSES.forEach(function (c) {
    c.lessons.forEach(function (l) {
      LESSON_INDEX[l.id] = l;
      COURSE_OF_LESSON[l.id] = c;
    });
  });

  function totalLessons() { return Object.keys(LESSON_INDEX).length; }
  function completedCount() { return Object.keys(progress.completed).length; }
  function courseCompletedCount(course) {
    return course.lessons.filter(function (l) { return progress.completed[l.id]; }).length;
  }
  function fmt(n, digits) {
    if (digits === undefined) digits = 0;
    return Number(n).toLocaleString("ru-RU", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }

  // ---------------------------------------------------------------
  // 2. DOM refs & top-level chrome
  // ---------------------------------------------------------------

  var root = document.getElementById("view-root");
  var sidebarNav = document.getElementById("sidebar-nav");
  var userNameEl = document.getElementById("user-name");
  var userInitialEl = document.getElementById("user-initial");
  var userEmailEl = document.getElementById("user-email-dd");
  var streakNumEl = document.getElementById("streak-num");
  var starsNumEl = document.getElementById("stars-num");

  userNameEl.textContent = user.name || "Ученик";
  userInitialEl.textContent = (user.name || "У").trim().charAt(0).toUpperCase();
  userEmailEl.textContent = user.email || "";

  document.getElementById("user-chip").addEventListener("click", function (e) {
    e.stopPropagation();
    document.getElementById("user-dropdown").classList.toggle("is-open");
  });
  document.addEventListener("click", function () {
    document.getElementById("user-dropdown").classList.remove("is-open");
  });
  document.getElementById("logout-btn").addEventListener("click", function () {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = "index.html";
  });

  var burger = document.getElementById("burger-btn");
  var sidebarEl = document.getElementById("sidebar");
  var overlayEl = document.getElementById("sidebar-overlay");
  function closeSidebar() { sidebarEl.classList.remove("is-open"); overlayEl.classList.remove("is-open"); }
  if (burger) {
    burger.addEventListener("click", function () {
      sidebarEl.classList.toggle("is-open");
      overlayEl.classList.toggle("is-open");
    });
    overlayEl.addEventListener("click", closeSidebar);
  }

  // ---------------------------------------------------------------
  // 3. Sidebar navigation
  // ---------------------------------------------------------------

  function renderSidebar(activeLessonId) {
    var html = "";
    html += '<button class="sidebar__nav-item' + (!activeLessonId ? " is-active" : "") + '" data-go-overview>' +
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>' +
      'Обзор</button>';
    html += '<div class="sidebar__label">Курсы</div>';

    COURSES.forEach(function (course) {
      var isExpanded = activeLessonId && COURSE_OF_LESSON[activeLessonId] === course;
      var done = courseCompletedCount(course);
      var pct = Math.round((done / course.lessons.length) * 100);
      html += '<div class="course-group' + (isExpanded ? " is-expanded" : "") + '" data-course="' + course.id + '">';
      html += '<button class="course-group__head" data-toggle-course="' + course.id + '">';
      html += '<span class="course-group__icon theme-' + course.theme + '">' + course.icon + '</span>';
      html += '<span class="course-group__title">' + course.title + '</span>';
      html += '<svg class="course-group__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 6 15 12 9 18"/></svg>';
      html += '</button>';
      html += '<div class="course-group__progress fill-' + course.theme + '"><i style="width:' + pct + '%"></i></div>';
      html += '<div class="course-group__lessons">';
      course.lessons.forEach(function (lesson) {
        var isDone = !!progress.completed[lesson.id];
        var isActive = lesson.id === activeLessonId;
        html += '<button class="lesson-link' + (isDone ? " is-done" : "") + (isActive ? " is-active" : "") + '" data-go-lesson="' + lesson.id + '">';
        html += '<span class="lesson-link__check"><svg viewBox="0 0 24 24" fill="none" stroke="#08130d" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>';
        html += '<span>' + lesson.title + '</span>';
        html += '</button>';
      });
      html += '</div></div>';
    });

    sidebarNav.innerHTML = html;

    sidebarNav.querySelector("[data-go-overview]").addEventListener("click", function () {
      closeSidebar();
      navigate({ view: "overview" });
    });
    sidebarNav.querySelectorAll("[data-toggle-course]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var group = btn.closest(".course-group");
        group.classList.toggle("is-expanded");
      });
    });
    sidebarNav.querySelectorAll("[data-go-lesson]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        closeSidebar();
        navigate({ view: "lesson", lessonId: btn.getAttribute("data-go-lesson") });
      });
    });
  }

  // ---------------------------------------------------------------
  // 4. Overview view
  // ---------------------------------------------------------------

  function renderOverview() {
    var done = completedCount();
    var total = totalLessons();
    var pct = total ? Math.round((done / total) * 100) : 0;

    var lastLesson = progress.lastVisited && LESSON_INDEX[progress.lastVisited];

    var html = "";
    html += '<div class="hero-card">';
    html += '<h1>Привет, ' + escapeHtml((user.name || "").split(" ")[0] || "будущий экономист") + ' 👋</h1>';
    html += '<p>Проходите короткие уроки, тренируйтесь на интерактивных симуляторах и проверяйте себя квизами — от базовых понятий до личных финансов.</p>';
    html += '<div class="hero-stats">';
    html += '<div><div class="hero-stat__num">' + done + ' / ' + total + '</div><div class="hero-stat__label">уроков пройдено</div></div>';
    html += '<div><div class="hero-stat__num">' + pct + '%</div><div class="hero-stat__label">прогресс курса</div></div>';
    html += '<div><div class="hero-stat__num">' + COURSES.length + '</div><div class="hero-stat__label">курса доступно</div></div>';
    html += '</div>';
    if (lastLesson) {
      html += '<div style="margin-top:22px;position:relative;">' +
        '<button class="btn btn-grad" data-continue="' + lastLesson.id + '">Продолжить: ' + escapeHtml(lastLesson.title) + '</button></div>';
    }
    html += '</div>';

    html += '<div class="section-title">Курсы</div>';
    html += '<div class="course-grid">';
    COURSES.forEach(function (course) {
      var doneC = courseCompletedCount(course);
      var pctC = Math.round((doneC / course.lessons.length) * 100);
      var firstUnfinished = course.lessons.filter(function (l) { return !progress.completed[l.id]; })[0] || course.lessons[0];
      html += '<button class="course-card" data-open-course="' + firstUnfinished.id + '">';
      html += '<div class="course-card__icon theme-' + course.theme + '">' + course.icon + '</div>';
      html += '<div class="course-card__title">' + course.title + '</div>';
      html += '<p class="course-card__desc">' + course.desc + '</p>';
      html += '<div class="course-card__meta"><span>' + doneC + '/' + course.lessons.length + ' уроков</span><span>' + pctC + '%</span></div>';
      html += '<div class="mini-progress fill-' + course.theme + '"><i style="width:' + pctC + '%"></i></div>';
      html += '</button>';
    });
    html += '</div>';

    root.innerHTML = html;

    var cont = root.querySelector("[data-continue]");
    if (cont) cont.addEventListener("click", function () { navigate({ view: "lesson", lessonId: cont.getAttribute("data-continue") }); });

    root.querySelectorAll("[data-open-course]").forEach(function (btn) {
      btn.addEventListener("click", function () { navigate({ view: "lesson", lessonId: btn.getAttribute("data-open-course") }); });
    });
  }

  // ---------------------------------------------------------------
  // 5. Lesson view
  // ---------------------------------------------------------------

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderBlock(b) {
    if (b.p) return "<p>" + b.p + "</p>";
    if (b.h3) return "<h3>" + b.h3 + "</h3>";
    if (b.ul) return "<ul>" + b.ul.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul>";
    if (b.formula) return '<div class="formula">' + b.formula + "</div>";
    if (b.callout) return '<div class="callout callout--' + b.callout + '">' + b.text + "</div>";
    return "";
  }

  function nextLessonId(lessonId) {
    var course = COURSE_OF_LESSON[lessonId];
    var idx = course.lessons.findIndex(function (l) { return l.id === lessonId; });
    if (idx < course.lessons.length - 1) return course.lessons[idx + 1].id;
    var cIdx = COURSES.indexOf(course);
    if (cIdx < COURSES.length - 1) return COURSES[cIdx + 1].lessons[0].id;
    return null;
  }

  function renderLesson(lessonId) {
    var lesson = LESSON_INDEX[lessonId];
    var course = COURSE_OF_LESSON[lessonId];
    if (!lesson) { navigate({ view: "overview" }); return; }

    progress.lastVisited = lessonId;
    saveProgress();

    var html = "";
    html += '<div class="breadcrumb"><button data-go-overview-crumb>Обзор</button> / ' + escapeHtml(course.title) + ' / ' + escapeHtml(lesson.title) + '</div>';
    html += '<div class="lesson-header"><div>';
    html += '<span class="lesson-header__type">' + (lesson.kind.indexOf("interactive") === 0 ? "Интерактивный урок" : "Теория") + '</span>';
    html += '<h1>' + escapeHtml(lesson.title) + '</h1>';
    html += '</div></div>';

    html += '<div class="lesson-block">' + lesson.blocks.map(renderBlock).join("") + '</div>';
    html += '<div id="widget-mount"></div>';
    html += '<div id="quiz-mount"></div>';

    var nxt = nextLessonId(lessonId);
    html += '<div class="lesson-nav"><button class="btn btn-ghost" data-go-overview-2>← К списку курсов</button>';
    if (nxt) html += '<button class="btn btn-ghost" data-next-lesson="' + nxt + '">Следующий урок →</button>';
    html += '</div>';

    root.innerHTML = html;

    root.querySelectorAll("[data-go-overview-crumb], [data-go-overview-2]").forEach(function (el) {
      el.addEventListener("click", function () { navigate({ view: "overview" }); });
    });
    var nextBtn = root.querySelector("[data-next-lesson]");
    if (nextBtn) nextBtn.addEventListener("click", function () { navigate({ view: "lesson", lessonId: nextBtn.getAttribute("data-next-lesson") }); });

    var widgetMount = document.getElementById("widget-mount");
    var widgetFn = WIDGETS[lesson.kind];
    if (widgetFn) widgetFn(widgetMount);

    mountQuiz(document.getElementById("quiz-mount"), lesson);
  }

  // ---------------------------------------------------------------
  // 6. Quiz engine
  // ---------------------------------------------------------------

  function mountQuiz(container, lesson) {
    if (!lesson.quiz || !lesson.quiz.length) return;
    var qs = lesson.quiz;
    var current = 0;
    var results = new Array(qs.length).fill(null); // null | true | false
    var selected = null;
    var confirmed = false;

    function renderProgressLine() {
      return '<div class="quiz-progress-line">' + qs.map(function (_, i) {
        var cls = i === current ? "is-current" : (results[i] === true ? "is-correct" : (results[i] === false ? "is-wrong" : ""));
        return "<i class='" + cls + "'></i>";
      }).join("") + "</div>";
    }

    function renderQuestion() {
      var q = qs[current];
      var letters = ["A", "Б", "В", "Г"];
      var html = '<div class="widget__title"><span class="dot"></span>Проверь себя</div>';
      html += renderProgressLine();
      html += '<div class="quiz-q">' + (current + 1) + '. ' + q.q + '</div>';
      html += '<div class="quiz-options">';
      q.options.forEach(function (opt, i) {
        var cls = "quiz-opt";
        var disabledAttr = "";
        if (confirmed) {
          disabledAttr = "disabled";
          if (i === q.correct) cls += " is-correct";
          else if (i === selected) cls += " is-wrong";
        } else if (i === selected) {
          cls += " is-selected";
        }
        html += '<button class="' + cls + '" data-opt="' + i + '" ' + disabledAttr + '><span class="quiz-opt__letter">' + letters[i] + '</span><span>' + opt + '</span></button>';
      });
      html += '</div>';

      if (confirmed) {
        var isCorrect = selected === q.correct;
        html += '<div class="quiz-reveal is-visible">';
        html += mascotHTML(isCorrect ? "happy" : "sad", isCorrect ? pick(["Отлично! Именно так 🎉", "Верно! Ты молодец!", "Точно в цель!"]) : pick(["Почти! Смотри объяснение 👀", "Не в этот раз, но это нормально!", "Бывает! Разберём вместе"]));
        html += '<div class="quiz-explain is-visible">' + q.explain + '</div>';
        html += '</div>';
        html += '<div class="quiz-footer"><button class="btn btn-grad" id="quiz-next">' + (current === qs.length - 1 ? "Завершить 🏁" : "Дальше →") + '</button></div>';
      } else {
        html += '<div class="quiz-footer"><button class="btn btn-grad" id="quiz-confirm"' + (selected === null ? " disabled" : "") + '>Подтвердить ответ</button></div>';
      }

      container.innerHTML = '<div class="quiz-block">' + html + '</div>';

      var opts = container.querySelectorAll(".quiz-opt");
      opts.forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (confirmed) return;
          selected = Number(btn.getAttribute("data-opt"));
          renderQuestion();
        });
      });

      if (!confirmed) {
        var confirmBtn = container.querySelector("#quiz-confirm");
        if (confirmBtn) {
          confirmBtn.addEventListener("click", function () {
            if (selected === null) return;
            confirmed = true;
            var isCorrect = selected === q.correct;
            results[current] = isCorrect;
            if (isCorrect) {
              progress.stars = (progress.stars || 0) + 1;
              saveProgress();
              updateStreak();
            }
            renderQuestion();
            if (isCorrect) spawnConfetti(18, false);
          });
        }
      } else {
        var nextBtn = container.querySelector("#quiz-next");
        nextBtn.addEventListener("click", function () {
          if (current < qs.length - 1) {
            current += 1;
            selected = null;
            confirmed = false;
            renderQuestion();
          } else {
            finishQuiz();
          }
        });
      }
    }

    function finishQuiz() {
      var correctCount = results.filter(function (r) { return r === true; }).length;
      progress.completed[lesson.id] = true;
      progress.quizScores[lesson.id] = { correct: correctCount, total: qs.length };
      saveProgress();
      renderSidebar(lesson.id);

      var pct = Math.round((correctCount / qs.length) * 100);
      var nxt = nextLessonId(lesson.id);
      var mood = pct >= 80 ? "party" : pct >= 50 ? "happy" : "sad";
      var msg = pct >= 80 ? "Отличный результат! Урок засчитан." : pct >= 50 ? "Неплохо! Урок засчитан — можно повторить теорию выше." : "Урок засчитан. Стоит перечитать материал ещё раз.";

      var html = '<div class="quiz-result">';
      html += mascotHTML(mood, "");
      html += '<div class="quiz-result__score">' + correctCount + '/' + qs.length + '</div>';
      html += '<div class="quiz-result__label">' + msg + '</div>';
      html += '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">';
      html += '<button class="btn btn-ghost" id="quiz-retry">Пройти квиз заново</button>';
      if (nxt) html += '<button class="btn btn-grad" id="quiz-go-next">Следующий урок →</button>';
      html += '</div></div>';
      container.innerHTML = '<div class="quiz-block">' + html + '</div>';

      if (pct >= 80) spawnConfetti(46, true);

      container.querySelector("#quiz-retry").addEventListener("click", function () {
        current = 0; results = new Array(qs.length).fill(null); selected = null; confirmed = false; renderQuestion();
      });
      var goNext = container.querySelector("#quiz-go-next");
      if (goNext) goNext.addEventListener("click", function () { navigate({ view: "lesson", lessonId: nxt }); });
    }

    renderQuestion();
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // ---- Mascot: friendly owl that reacts to answers ----
  function mascotHTML(mood, speech) {
    var eyes, mouth, extra = "";
    if (mood === "happy" || mood === "party") {
      eyes = '<path d="M20 30 Q26 22 32 30" stroke="#080b16" stroke-width="3" fill="none" stroke-linecap="round"/>' +
             '<path d="M44 30 Q50 22 56 30" stroke="#080b16" stroke-width="3" fill="none" stroke-linecap="round"/>';
      mouth = '<path d="M28 44 Q38 54 48 44" stroke="#080b16" stroke-width="3" fill="none" stroke-linecap="round"/>';
    } else if (mood === "sad") {
      eyes = '<circle cx="26" cy="30" r="5" fill="#080b16"/><circle cx="50" cy="30" r="5" fill="#080b16"/>' +
             '<path d="M18 22 Q24 18 30 22" stroke="#080b16" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
             '<path d="M46 22 Q52 18 58 22" stroke="#080b16" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
      mouth = '<path d="M28 48 Q38 40 48 48" stroke="#080b16" stroke-width="3" fill="none" stroke-linecap="round"/>';
    } else {
      eyes = '<circle cx="26" cy="30" r="5" fill="#080b16"/><circle cx="50" cy="30" r="5" fill="#080b16"/>';
      mouth = '<ellipse cx="38" cy="46" rx="6" ry="4" fill="#080b16"/>';
    }
    if (mood === "party") {
      extra = '<text x="10" y="14" font-size="14">✨</text><text x="58" y="18" font-size="14">✨</text><text x="6" y="55" font-size="12">⭐</text>';
    }
    var owl =
      '<svg viewBox="0 0 76 70" xmlns="http://www.w3.org/2000/svg">' +
      '<ellipse cx="17" cy="40" rx="9" ry="14" fill="#7c5cff"/>' +
      '<ellipse cx="59" cy="40" rx="9" ry="14" fill="#7c5cff"/>' +
      '<circle cx="38" cy="36" r="26" fill="#a08cff"/>' +
      '<circle cx="38" cy="38" r="21" fill="#f5f6fb"/>' +
      '<circle cx="26" cy="30" r="9" fill="#ffffff" stroke="#7c5cff" stroke-width="2"/>' +
      '<circle cx="50" cy="30" r="9" fill="#ffffff" stroke="#7c5cff" stroke-width="2"/>' +
      eyes +
      '<path d="M34 36 L38 44 L42 36 Z" fill="#f2b84b"/>' +
      mouth +
      extra +
      '</svg>';
    var speechHtml = speech ? '<div class="mascot-speech">' + speech + '</div>' : "";
    return '<div class="mascot-row"><div class="mascot mascot--' + mood + '">' + owl + '</div>' + speechHtml + '</div>';
  }

  // ---- Confetti burst ----
  function spawnConfetti(count, big) {
    var colors = ["#7c5cff", "#2dd4da", "#e94f9e", "#f2b84b", "#6fe3ab"];
    var holder = document.createElement("div");
    holder.className = "confetti-holder";
    document.body.appendChild(holder);
    for (var i = 0; i < count; i++) {
      var piece = document.createElement("span");
      piece.className = "confetti-piece";
      var size = big ? (6 + Math.random() * 6) : (5 + Math.random() * 4);
      piece.style.left = (Math.random() * 100) + "vw";
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width = size + "px";
      piece.style.height = (size * 1.6) + "px";
      piece.style.animationDuration = (1.6 + Math.random() * 1.4) + "s";
      piece.style.animationDelay = (Math.random() * 0.4) + "s";
      piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      holder.appendChild(piece);
    }
    setTimeout(function () { holder.remove(); }, 3400);
  }

  // ---------------------------------------------------------------
  // 7. Interactive widgets
  // ---------------------------------------------------------------

  function svg(w, h, inner) {
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
  }

  var WIDGETS = {};

  // ---- 7.1 Production Possibility Frontier ----
  WIDGETS["interactive-ppf"] = function (mount) {
    var W = 420, H = 300, PAD = 36;
    var maxBase = 220;

    mount.innerHTML =
      '<div class="widget">' +
      '<div class="widget__title"><span class="dot"></span>Тренажёр: КПВ</div>' +
      '<div class="widget__hint">Двигайте ползунок, чтобы перераспределить ресурсы между «Станками» и «Хлебом». Включите рост экономики, чтобы увидеть сдвиг кривой.</div>' +
      '<div class="widget__grid">' +
      '<div>' +
      '<div class="control"><div class="control__label"><span>Доля ресурсов на «Станки»</span><b id="ppf-val">50%</b></div>' +
      '<input type="range" id="ppf-slider" min="0" max="100" value="50"></div>' +
      '<label class="toggle-row"><input type="checkbox" id="ppf-growth"> Экономический рост (сдвиг КПВ наружу)</label>' +
      '<div class="readout" id="ppf-readout"></div>' +
      '</div>' +
      '<div class="chart-box" id="ppf-chart"></div>' +
      '</div></div>';

    var slider = mount.querySelector("#ppf-slider");
    var growthBox = mount.querySelector("#ppf-growth");
    var valEl = mount.querySelector("#ppf-val");
    var chartEl = mount.querySelector("#ppf-chart");
    var readoutEl = mount.querySelector("#ppf-readout");

    function draw() {
      var pct = Number(slider.value);
      valEl.textContent = pct + "%";
      var growth = growthBox.checked;
      var scale = growth ? 1.3 : 1;
      var maxX = maxBase * scale;
      var maxY = maxBase * scale;

      var x0 = PAD, y0 = H - PAD;
      var xScale = (W - PAD * 2) / maxBase / scale * scale; // keep axes fixed range = maxBase*1.3 max
      var axisMax = maxBase * 1.3;
      function toPx(x) { return x0 + (x / axisMax) * (W - PAD * 2); }
      function toPy(y) { return y0 - (y / axisMax) * (H - PAD * 2); }

      // curve points (quarter ellipse): y = maxY * sqrt(1 - (x/maxX)^2)
      var pathPts = [];
      var steps = 40;
      for (var i = 0; i <= steps; i++) {
        var x = (maxX * i) / steps;
        var y = maxY * Math.sqrt(Math.max(0, 1 - (x / maxX) * (x / maxX)));
        pathPts.push([toPx(x), toPy(y)]);
      }
      var pathD = "M" + pathPts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" L");

      var oldPathD = "";
      if (growth) {
        var oldMax = maxBase;
        var oldPts = [];
        for (var j = 0; j <= steps; j++) {
          var ox = (oldMax * j) / steps;
          var oy = oldMax * Math.sqrt(Math.max(0, 1 - (ox / oldMax) * (ox / oldMax)));
          oldPts.push([toPx(ox), toPy(oy)]);
        }
        oldPathD = "M" + oldPts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" L");
      }

      // point at pct of maxX
      var px = (pct / 100) * maxX;
      var py = maxY * Math.sqrt(Math.max(0, 1 - (px / maxX) * (px / maxX)));

      var inner = "";
      inner += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + (W - PAD) + '" y2="' + y0 + '" stroke="rgba(255,255,255,0.18)"/>';
      inner += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + PAD + '" stroke="rgba(255,255,255,0.18)"/>';
      inner += '<text x="' + (W - PAD) + '" y="' + (y0 + 18) + '" fill="#7c839c" font-size="10" text-anchor="end">Станки</text>';
      inner += '<text x="' + (x0 - 6) + '" y="' + (PAD - 6) + '" fill="#7c839c" font-size="10" text-anchor="start">Хлеб</text>';
      if (oldPathD) inner += '<path d="' + oldPathD + '" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.5" stroke-dasharray="4 4"/>';
      inner += '<path d="' + pathD + '" fill="none" stroke="#2dd4da" stroke-width="2.5"/>';
      inner += '<circle cx="' + toPx(px).toFixed(1) + '" cy="' + toPy(py).toFixed(1) + '" r="5.5" fill="#f2b84b" stroke="#080b16" stroke-width="1.5"/>';

      chartEl.innerHTML = svg(W, H, inner);

      readoutEl.innerHTML =
        '<div class="readout__item"><div class="readout__num" style="color:#2dd4da">' + fmt(px) + '</div><div class="readout__label">ед. станков</div></div>' +
        '<div class="readout__item"><div class="readout__num" style="color:#f2b84b">' + fmt(py) + '</div><div class="readout__label">ед. хлеба</div></div>' +
        '<div class="readout__explain">' + (growth ? "Кривая сдвинулась наружу — при том же распределении ресурсов экономика теперь производит больше обоих товаров." : "Двигая точку по кривой, вы жертвуете одним товаром ради другого — это и есть альтернативные издержки.") + '</div>';
    }

    slider.addEventListener("input", draw);
    growthBox.addEventListener("change", draw);
    draw();
  };

  // ---- 7.2 Supply & Demand equilibrium ----
  WIDGETS["interactive-supply-demand"] = function (mount) {
    var W = 420, H = 300, PAD = 40;

    mount.innerHTML =
      '<div class="widget">' +
      '<div class="widget__title"><span class="dot"></span>Тренажёр: рыночное равновесие</div>' +
      '<div class="widget__hint">Сдвигайте спрос и предложение и смотрите, как меняется равновесная цена и объём.</div>' +
      '<div class="widget__grid">' +
      '<div>' +
      '<div class="control"><div class="control__label"><span>Спрос (доходы, мода, ожидания)</span><b id="sd-demand-val">0</b></div>' +
      '<input type="range" id="sd-demand" min="-40" max="40" value="0"></div>' +
      '<div class="control"><div class="control__label"><span>Предложение (сырьё, технологии)</span><b id="sd-supply-val">0</b></div>' +
      '<input type="range" id="sd-supply" min="-40" max="40" value="0"></div>' +
      '<div class="readout" id="sd-readout"></div>' +
      '</div>' +
      '<div class="chart-box" id="sd-chart"></div>' +
      '</div></div>';

    var demandSlider = mount.querySelector("#sd-demand");
    var supplySlider = mount.querySelector("#sd-supply");
    var demandVal = mount.querySelector("#sd-demand-val");
    var supplyVal = mount.querySelector("#sd-supply-val");
    var chartEl = mount.querySelector("#sd-chart");
    var readoutEl = mount.querySelector("#sd-readout");

    // Demand: P = (100 + shiftD) - 1.0*Q   | Supply: P = (10 + shiftS) + 1.0*Q
    var b = 1.0, d = 1.0;
    var baseA = 100, baseC = 10;
    var maxQ = 100, maxP = 110;

    function draw() {
      var shiftD = Number(demandSlider.value);
      var shiftS = Number(supplySlider.value);
      demandVal.textContent = (shiftD > 0 ? "+" : "") + shiftD;
      supplyVal.textContent = (shiftS > 0 ? "+" : "") + shiftS;

      var a = baseA + shiftD;
      var c = baseC + shiftS;

      var qEq = (a - c) / (b + d);
      var pEq = a - b * qEq;
      qEq = Math.max(0, qEq);
      pEq = Math.max(0, pEq);

      var x0 = PAD, y0 = H - PAD;
      function toPx(q) { return x0 + (q / maxQ) * (W - PAD * 2); }
      function toPy(p) { return y0 - (p / maxP) * (H - PAD * 2); }

      // demand line: Q from 0..a/b (P>=0), clipped to maxQ
      var qDemandEnd = Math.min(maxQ, a / b);
      var demandPts = [[0, a], [qDemandEnd, a - b * qDemandEnd]];
      // supply line: Q from 0..maxQ, P = c + d*Q clipped to maxP
      var qSupplyEnd = Math.min(maxQ, (maxP - c) / d);
      var supplyPts = [[0, c], [qSupplyEnd, c + d * qSupplyEnd]];

      function lineD(pts) {
        return "M" + pts.map(function (p) { return toPx(p[0]).toFixed(1) + "," + toPy(p[1]).toFixed(1); }).join(" L");
      }

      var inner = "";
      inner += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + (W - PAD) + '" y2="' + y0 + '" stroke="rgba(255,255,255,0.18)"/>';
      inner += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + PAD + '" stroke="rgba(255,255,255,0.18)"/>';
      inner += '<text x="' + (W - PAD) + '" y="' + (y0 + 18) + '" fill="#7c839c" font-size="10" text-anchor="end">Объём (Q)</text>';
      inner += '<text x="' + (x0 - 6) + '" y="' + (PAD - 6) + '" fill="#7c839c" font-size="10" text-anchor="start">Цена (P)</text>';
      inner += '<path d="' + lineD(demandPts) + '" fill="none" stroke="#e94f9e" stroke-width="2.5"/>';
      inner += '<path d="' + lineD(supplyPts) + '" fill="none" stroke="#2dd4da" stroke-width="2.5"/>';
      inner += '<line x1="' + toPx(qEq).toFixed(1) + '" y1="' + y0 + '" x2="' + toPx(qEq).toFixed(1) + '" y2="' + toPy(pEq).toFixed(1) + '" stroke="rgba(255,255,255,0.2)" stroke-dasharray="3 3"/>';
      inner += '<line x1="' + x0 + '" y1="' + toPy(pEq).toFixed(1) + '" x2="' + toPx(qEq).toFixed(1) + '" y2="' + toPy(pEq).toFixed(1) + '" stroke="rgba(255,255,255,0.2)" stroke-dasharray="3 3"/>';
      inner += '<circle cx="' + toPx(qEq).toFixed(1) + '" cy="' + toPy(pEq).toFixed(1) + '" r="5.5" fill="#f2b84b" stroke="#080b16" stroke-width="1.5"/>';
      inner += '<text x="' + (W - PAD - 4) + '" y="' + (PAD + 12) + '" fill="#e94f9e" font-size="10" text-anchor="end">Спрос</text>';
      inner += '<text x="' + (W - PAD - 4) + '" y="' + (PAD + 26) + '" fill="#2dd4da" font-size="10" text-anchor="end">Предложение</text>';

      chartEl.innerHTML = svg(W, H, inner);

      readoutEl.innerHTML =
        '<div class="readout__item"><div class="readout__num" style="color:#f2b84b">' + fmt(pEq) + '₽</div><div class="readout__label">равновесная цена</div></div>' +
        '<div class="readout__item"><div class="readout__num" style="color:#f2b84b">' + fmt(qEq) + '</div><div class="readout__label">равновесный объём</div></div>' +
        '<div class="readout__explain">' + explainShift(shiftD, shiftS) + '</div>';
    }

    function explainShift(shiftD, shiftS) {
      if (shiftD === 0 && shiftS === 0) return "Это базовое равновесие рынка. Попробуйте сдвинуть спрос или предложение.";
      var parts = [];
      if (shiftD > 0) parts.push("рост спроса толкает цену и объём вверх");
      if (shiftD < 0) parts.push("падение спроса снижает и цену, и объём");
      if (shiftS > 0) parts.push("рост предложения снижает цену, но увеличивает объём");
      if (shiftS < 0) parts.push("падение предложения повышает цену и снижает объём");
      return "Сейчас: " + parts.join("; ") + ".";
    }

    demandSlider.addEventListener("input", draw);
    supplySlider.addEventListener("input", draw);
    draw();
  };

  // ---- 7.3 Elasticity calculator ----
  WIDGETS["interactive-elasticity"] = function (mount) {
    mount.innerHTML =
      '<div class="widget">' +
      '<div class="widget__title"><span class="dot"></span>Калькулятор эластичности</div>' +
      '<div class="widget__hint">Введите начальную и новую цену/объём — калькулятор посчитает коэффициент эластичности спроса.</div>' +
      '<div class="widget__grid">' +
      '<div>' +
      '<div class="control"><div class="control__label"><span>Цена до, ₽</span></div><input type="number" class="num-input" id="el-p1" value="100"></div>' +
      '<div class="control"><div class="control__label"><span>Цена после, ₽</span></div><input type="number" class="num-input" id="el-p2" value="120"></div>' +
      '<div class="control"><div class="control__label"><span>Объём до, шт</span></div><input type="number" class="num-input" id="el-q1" value="200"></div>' +
      '<div class="control"><div class="control__label"><span>Объём после, шт</span></div><input type="number" class="num-input" id="el-q2" value="160"></div>' +
      '</div>' +
      '<div class="chart-box" id="el-chart"></div>' +
      '</div>' +
      '<div class="readout" id="el-readout"></div>' +
      '</div>';

    var ids = ["el-p1", "el-p2", "el-q1", "el-q2"];
    var inputs = {};
    ids.forEach(function (id) { inputs[id] = mount.querySelector("#" + id); });
    var chartEl = mount.querySelector("#el-chart");
    var readoutEl = mount.querySelector("#el-readout");

    function draw() {
      var p1 = Number(inputs["el-p1"].value) || 0;
      var p2 = Number(inputs["el-p2"].value) || 0;
      var q1 = Number(inputs["el-q1"].value) || 0;
      var q2 = Number(inputs["el-q2"].value) || 0;

      var pctQ = p1 && q1 ? ((q2 - q1) / q1) * 100 : 0;
      var pctP = p1 ? ((p2 - p1) / p1) * 100 : 0;
      var e = pctP !== 0 ? pctQ / pctP : 0;
      var absE = Math.abs(e);
      var kind = absE > 1.05 ? "эластичный" : absE < 0.95 ? "неэластичный" : "с единичной эластичностью";
      var color = absE > 1.05 ? "#e94f9e" : absE < 0.95 ? "#2dd4da" : "#f2b84b";

      var W = 380, H = 220, PAD = 34;
      var maxQ = Math.max(q1, q2) * 1.3 || 10;
      var maxP = Math.max(p1, p2) * 1.3 || 10;
      var x0 = PAD, y0 = H - PAD;
      function toPx(q) { return x0 + (q / maxQ) * (W - PAD * 2); }
      function toPy(p) { return y0 - (p / maxP) * (H - PAD * 2); }

      var inner = "";
      inner += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + (W - PAD) + '" y2="' + y0 + '" stroke="rgba(255,255,255,0.18)"/>';
      inner += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + PAD + '" stroke="rgba(255,255,255,0.18)"/>';
      inner += '<line x1="' + toPx(q1).toFixed(1) + '" y1="' + toPy(p1).toFixed(1) + '" x2="' + toPx(q2).toFixed(1) + '" y2="' + toPy(p2).toFixed(1) + '" stroke="' + color + '" stroke-width="2.5"/>';
      inner += '<circle cx="' + toPx(q1).toFixed(1) + '" cy="' + toPy(p1).toFixed(1) + '" r="5" fill="#7c5cff" stroke="#080b16" stroke-width="1.5"/>';
      inner += '<circle cx="' + toPx(q2).toFixed(1) + '" cy="' + toPy(p2).toFixed(1) + '" r="5" fill="' + color + '" stroke="#080b16" stroke-width="1.5"/>';
      inner += '<text x="' + (W - PAD) + '" y="' + (y0 + 18) + '" fill="#7c839c" font-size="10" text-anchor="end">Объём</text>';
      inner += '<text x="' + (x0 - 6) + '" y="' + (PAD - 6) + '" fill="#7c839c" font-size="10" text-anchor="start">Цена</text>';
      chartEl.innerHTML = svg(W, H, inner);

      readoutEl.innerHTML =
        '<div class="readout__item"><div class="readout__num">' + fmt(pctP, 1) + '%</div><div class="readout__label">изм. цены</div></div>' +
        '<div class="readout__item"><div class="readout__num">' + fmt(pctQ, 1) + '%</div><div class="readout__label">изм. объёма</div></div>' +
        '<div class="readout__item"><div class="readout__num" style="color:' + color + '">' + fmt(e, 2) + '</div><div class="readout__label">Ed, спрос ' + kind + '</div></div>' +
        '<div class="readout__explain">Коэффициент эластичности |Ed| = ' + fmt(absE, 2) + ' — спрос на этот товар ' + kind + '. ' + (absE > 1.05 ? "Небольшое изменение цены заметно меняет объём покупок." : absE < 0.95 ? "Даже сильное изменение цены слабо влияет на объём покупок." : "Изменение объёма пропорционально изменению цены.") + '</div>';
    }

    ids.forEach(function (id) { inputs[id].addEventListener("input", draw); });
    draw();
  };

  // ---- 7.4 Inflation calculator ----
  WIDGETS["interactive-inflation"] = function (mount) {
    mount.innerHTML =
      '<div class="widget">' +
      '<div class="widget__title"><span class="dot"></span>Калькулятор инфляции</div>' +
      '<div class="widget__hint">Задайте текущую стоимость условной корзины товаров, темп инфляции и горизонт — увидите, как растёт цена и падает покупательная способность.</div>' +
      '<div class="widget__grid">' +
      '<div>' +
      '<div class="control"><div class="control__label"><span>Стоимость корзины сегодня, ₽</span></div><input type="number" class="num-input" id="inf-cost" value="5000"></div>' +
      '<div class="control"><div class="control__label"><span>Инфляция в год</span><b id="inf-rate-val">8%</b></div><input type="range" id="inf-rate" min="0" max="30" value="8"></div>' +
      '<div class="control"><div class="control__label"><span>Горизонт</span><b id="inf-years-val">10 лет</b></div><input type="range" id="inf-years" min="1" max="30" value="10"></div>' +
      '</div>' +
      '<div class="chart-box" id="inf-chart"></div>' +
      '</div>' +
      '<div class="readout" id="inf-readout"></div>' +
      '</div>';

    var costInput = mount.querySelector("#inf-cost");
    var rateSlider = mount.querySelector("#inf-rate");
    var yearsSlider = mount.querySelector("#inf-years");
    var rateVal = mount.querySelector("#inf-rate-val");
    var yearsVal = mount.querySelector("#inf-years-val");
    var chartEl = mount.querySelector("#inf-chart");
    var readoutEl = mount.querySelector("#inf-readout");

    function draw() {
      var cost = Number(costInput.value) || 0;
      var rate = Number(rateSlider.value) / 100;
      var years = Number(yearsSlider.value);
      rateVal.textContent = (rate * 100).toFixed(0) + "%";
      yearsVal.textContent = years + (years === 1 ? " год" : years < 5 ? " года" : " лет");

      var futureCost = cost * Math.pow(1 + rate, years);
      var purchasingPower = rate > 0 ? cost / Math.pow(1 + rate, years) : cost;

      var pts = [];
      for (var y = 0; y <= years; y++) pts.push(cost * Math.pow(1 + rate, y));

      var W = 380, H = 220, PAD = 34;
      var maxV = Math.max.apply(null, pts) * 1.1 || 10;
      var x0 = PAD, y0 = H - PAD;
      function toPx(i) { return x0 + (i / Math.max(1, years)) * (W - PAD * 2); }
      function toPy(v) { return y0 - (v / maxV) * (H - PAD * 2); }

      var lineD = "M" + pts.map(function (v, i) { return toPx(i).toFixed(1) + "," + toPy(v).toFixed(1); }).join(" L");
      var areaD = lineD + " L" + toPx(pts.length - 1).toFixed(1) + "," + y0 + " L" + toPx(0).toFixed(1) + "," + y0 + " Z";

      var inner = "";
      inner += '<path d="' + areaD + '" fill="rgba(242,184,75,0.15)"/>';
      inner += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + (W - PAD) + '" y2="' + y0 + '" stroke="rgba(255,255,255,0.18)"/>';
      inner += '<path d="' + lineD + '" fill="none" stroke="#f2b84b" stroke-width="2.5"/>';
      inner += '<circle cx="' + toPx(pts.length - 1).toFixed(1) + '" cy="' + toPy(pts[pts.length - 1]).toFixed(1) + '" r="5" fill="#f2b84b" stroke="#080b16" stroke-width="1.5"/>';
      inner += '<text x="' + x0 + '" y="' + (y0 + 18) + '" fill="#7c839c" font-size="10">сегодня</text>';
      inner += '<text x="' + (W - PAD) + '" y="' + (y0 + 18) + '" fill="#7c839c" font-size="10" text-anchor="end">через ' + years + ' лет</text>';
      chartEl.innerHTML = svg(W, H, inner);

      readoutEl.innerHTML =
        '<div class="readout__item"><div class="readout__num" style="color:#f2b84b">' + fmt(futureCost) + '₽</div><div class="readout__label">корзина через ' + years + ' лет</div></div>' +
        '<div class="readout__item"><div class="readout__num" style="color:#e94f9e">' + fmt(purchasingPower) + '₽</div><div class="readout__label">во что превратятся ' + fmt(cost) + '₽ сегодня</div></div>' +
        '<div class="readout__explain">При инфляции ' + (rate * 100).toFixed(0) + '% в год корзина за ' + fmt(cost) + '₽ подорожает до ' + fmt(futureCost) + '₽ через ' + years + ' лет. Если хранить деньги «под матрасом», ' + fmt(cost) + '₽ сегодня по покупательной способности будут эквивалентны лишь ' + fmt(purchasingPower) + '₽ через это время.</div>';
    }

    [costInput, rateSlider, yearsSlider].forEach(function (el) { el.addEventListener("input", draw); });
    draw();
  };

  // ---- 7.5 Compound interest ----
  WIDGETS["interactive-compound"] = function (mount) {
    mount.innerHTML =
      '<div class="widget">' +
      '<div class="widget__title"><span class="dot"></span>Калькулятор сложного процента</div>' +
      '<div class="widget__hint">Стартовая сумма, ежемесячное пополнение и доходность — посмотрите, как накопления растут по годам.</div>' +
      '<div class="widget__grid">' +
      '<div>' +
      '<div class="control"><div class="control__label"><span>Стартовая сумма, ₽</span></div><input type="number" class="num-input" id="ci-principal" value="50000"></div>' +
      '<div class="control"><div class="control__label"><span>Пополнение в месяц, ₽</span></div><input type="number" class="num-input" id="ci-monthly" value="10000"></div>' +
      '<div class="control"><div class="control__label"><span>Доходность в год</span><b id="ci-rate-val">12%</b></div><input type="range" id="ci-rate" min="0" max="30" value="12"></div>' +
      '<div class="control"><div class="control__label"><span>Срок</span><b id="ci-years-val">15 лет</b></div><input type="range" id="ci-years" min="1" max="40" value="15"></div>' +
      '</div>' +
      '<div class="chart-box" id="ci-chart"></div>' +
      '</div>' +
      '<div class="readout" id="ci-readout"></div>' +
      '</div>';

    var principalInput = mount.querySelector("#ci-principal");
    var monthlyInput = mount.querySelector("#ci-monthly");
    var rateSlider = mount.querySelector("#ci-rate");
    var yearsSlider = mount.querySelector("#ci-years");
    var rateVal = mount.querySelector("#ci-rate-val");
    var yearsVal = mount.querySelector("#ci-years-val");
    var chartEl = mount.querySelector("#ci-chart");
    var readoutEl = mount.querySelector("#ci-readout");

    function draw() {
      var principal = Number(principalInput.value) || 0;
      var monthly = Number(monthlyInput.value) || 0;
      var annualRate = Number(rateSlider.value) / 100;
      var years = Number(yearsSlider.value);
      rateVal.textContent = (annualRate * 100).toFixed(0) + "%";
      yearsVal.textContent = years + (years === 1 ? " год" : years < 5 ? " года" : " лет");

      var monthlyRate = annualRate / 12;
      var balance = principal;
      var contributed = principal;
      var yearlyBalances = [balance];
      for (var y = 1; y <= years; y++) {
        for (var m = 0; m < 12; m++) {
          balance = balance * (1 + monthlyRate) + monthly;
          contributed += monthly;
        }
        yearlyBalances.push(balance);
      }
      var finalBalance = balance;
      var totalGain = finalBalance - contributed;

      var W = 380, H = 220, PAD = 34;
      var maxV = Math.max.apply(null, yearlyBalances) * 1.08 || 10;
      var x0 = PAD, y0 = H - PAD;
      function toPx(i) { return x0 + (i / Math.max(1, years)) * (W - PAD * 2); }
      function toPy(v) { return y0 - (v / maxV) * (H - PAD * 2); }

      var lineD = "M" + yearlyBalances.map(function (v, i) { return toPx(i).toFixed(1) + "," + toPy(v).toFixed(1); }).join(" L");
      var areaD = lineD + " L" + toPx(yearlyBalances.length - 1).toFixed(1) + "," + y0 + " L" + toPx(0).toFixed(1) + "," + y0 + " Z";
      var contribLineY = toPy(contributed).toFixed(1);

      var inner = "";
      inner += '<path d="' + areaD + '" fill="rgba(233,79,158,0.14)"/>';
      inner += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + (W - PAD) + '" y2="' + y0 + '" stroke="rgba(255,255,255,0.18)"/>';
      inner += '<line x1="' + x0 + '" y1="' + contribLineY + '" x2="' + (W - PAD) + '" y2="' + contribLineY + '" stroke="rgba(255,255,255,0.25)" stroke-dasharray="4 4"/>';
      inner += '<path d="' + lineD + '" fill="none" stroke="#e94f9e" stroke-width="2.5"/>';
      inner += '<circle cx="' + toPx(yearlyBalances.length - 1).toFixed(1) + '" cy="' + toPy(finalBalance).toFixed(1) + '" r="5" fill="#e94f9e" stroke="#080b16" stroke-width="1.5"/>';
      inner += '<text x="' + (x0 + 4) + '" y="' + (Number(contribLineY) - 5) + '" fill="#b9bfd4" font-size="9">внесено: ' + fmt(contributed) + '₽</text>';
      chartEl.innerHTML = svg(W, H, inner);

      readoutEl.innerHTML =
        '<div class="readout__item"><div class="readout__num" style="color:#e94f9e">' + fmt(finalBalance) + '₽</div><div class="readout__label">итоговая сумма</div></div>' +
        '<div class="readout__item"><div class="readout__num">' + fmt(contributed) + '₽</div><div class="readout__label">внесено своих денег</div></div>' +
        '<div class="readout__item"><div class="readout__num" style="color:#6fe3ab">' + fmt(totalGain) + '₽</div><div class="readout__label">заработано на процентах</div></div>' +
        '<div class="readout__explain">Из ' + fmt(finalBalance) + '₽ вы внесли ' + fmt(contributed) + '₽, а ' + fmt(totalGain) + '₽ — это результат работы сложного процента. Чем длиннее горизонт, тем сильнее заметен эффект.</div>';
    }

    [principalInput, monthlyInput, rateSlider, yearsSlider].forEach(function (el) { el.addEventListener("input", draw); });
    draw();
  };

  // ---- 7.6 Budget allocator (50/30/20) ----
  WIDGETS["interactive-budget"] = function (mount) {
    mount.innerHTML =
      '<div class="widget">' +
      '<div class="widget__title"><span class="dot"></span>Тренажёр бюджета</div>' +
      '<div class="widget__hint">Укажите доход и настройте распределение — сумма долей всегда приводится к 100%.</div>' +
      '<div class="widget__grid">' +
      '<div>' +
      '<div class="control"><div class="control__label"><span>Доход в месяц, ₽</span></div><input type="number" class="num-input" id="bg-income" value="80000"></div>' +
      '<div class="control"><div class="control__label"><span>Обязательные траты</span><b id="bg-needs-val">50%</b></div><input type="range" id="bg-needs" min="0" max="100" value="50"></div>' +
      '<div class="control"><div class="control__label"><span>Желания</span><b id="bg-wants-val">30%</b></div><input type="range" id="bg-wants" min="0" max="100" value="30"></div>' +
      '<div class="control"><div class="control__label"><span>Накопления</span><b id="bg-save-val">20%</b></div><input type="range" id="bg-save" min="0" max="100" value="20"></div>' +
      '</div>' +
      '<div class="chart-box" id="bg-chart"></div>' +
      '</div>' +
      '<div class="readout" id="bg-readout"></div>' +
      '</div>';

    var incomeInput = mount.querySelector("#bg-income");
    var needsSlider = mount.querySelector("#bg-needs");
    var wantsSlider = mount.querySelector("#bg-wants");
    var saveSlider = mount.querySelector("#bg-save");
    var chartEl = mount.querySelector("#bg-chart");
    var readoutEl = mount.querySelector("#bg-readout");
    var lastChanged = needsSlider;

    [needsSlider, wantsSlider, saveSlider].forEach(function (s) {
      s.addEventListener("mousedown", function () { lastChanged = s; });
      s.addEventListener("touchstart", function () { lastChanged = s; });
    });

    function normalize() {
      var n = Number(needsSlider.value), w = Number(wantsSlider.value), s = Number(saveSlider.value);
      var total = n + w + s;
      if (total === 0) { needsSlider.value = 34; wantsSlider.value = 33; saveSlider.value = 33; return; }
      if (total === 100) return;
      // adjust the two sliders that weren't last changed, proportionally
      var others = [needsSlider, wantsSlider, saveSlider].filter(function (x) { return x !== lastChanged; });
      var diff = 100 - total;
      var othersSum = others.reduce(function (acc, el) { return acc + Number(el.value); }, 0);
      others.forEach(function (el) {
        var share = othersSum > 0 ? Number(el.value) / othersSum : 0.5;
        var newVal = Math.max(0, Math.round(Number(el.value) + diff * share));
        el.value = newVal;
      });
      // final correction to guarantee exact 100
      var finalTotal = Number(needsSlider.value) + Number(wantsSlider.value) + Number(saveSlider.value);
      var correction = 100 - finalTotal;
      if (correction !== 0) lastChanged.value = Math.max(0, Number(lastChanged.value) + correction);
    }

    function draw() {
      normalize();
      var income = Number(incomeInput.value) || 0;
      var n = Number(needsSlider.value), w = Number(wantsSlider.value), s = Number(saveSlider.value);
      mount.querySelector("#bg-needs-val").textContent = n + "%";
      mount.querySelector("#bg-wants-val").textContent = w + "%";
      mount.querySelector("#bg-save-val").textContent = s + "%";

      var needsAmt = income * n / 100, wantsAmt = income * w / 100, saveAmt = income * s / 100;

      // donut chart
      var W = 260, H = 220;
      var cx = W / 2, cy = H / 2, r = 78, sw = 26;
      var circumference = 2 * Math.PI * r;
      function seg(pct, offset, color) {
        var len = (pct / 100) * circumference;
        return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + sw + '" ' +
          'stroke-dasharray="' + len.toFixed(1) + ' ' + (circumference - len).toFixed(1) + '" stroke-dashoffset="' + (-offset).toFixed(1) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>';
      }
      var offN = 0, offW = (n / 100) * circumference, offS = ((n + w) / 100) * circumference;
      var inner = "";
      inner += seg(n, offN, "#7c5cff");
      inner += seg(w, offW, "#f2b84b");
      inner += seg(s, offS, "#2dd4da");
      inner += '<text x="' + cx + '" y="' + (cy - 2) + '" fill="#f5f6fb" font-size="16" font-weight="700" text-anchor="middle" font-family="Space Grotesk, sans-serif">' + fmt(income) + '₽</text>';
      inner += '<text x="' + cx + '" y="' + (cy + 16) + '" fill="#7c839c" font-size="10" text-anchor="middle">в месяц</text>';
      chartEl.innerHTML = svg(W, H, inner);

      readoutEl.innerHTML =
        '<div class="readout__item"><div class="readout__num" style="color:#7c5cff">' + fmt(needsAmt) + '₽</div><div class="readout__label">обязательное (' + n + '%)</div></div>' +
        '<div class="readout__item"><div class="readout__num" style="color:#f2b84b">' + fmt(wantsAmt) + '₽</div><div class="readout__label">желания (' + w + '%)</div></div>' +
        '<div class="readout__item"><div class="readout__num" style="color:#2dd4da">' + fmt(saveAmt) + '₽</div><div class="readout__label">накопления (' + s + '%)</div></div>' +
        '<div class="readout__explain">За год откладывая по ' + fmt(saveAmt) + '₽ в месяц, вы накопите ' + fmt(saveAmt * 12) + '₽ без учёта процентов — а с инвестиционным доходом сумма будет больше за счёт сложного процента.</div>';
    }

    [incomeInput, needsSlider, wantsSlider, saveSlider].forEach(function (el) { el.addEventListener("input", draw); });
    draw();
  };

  // ---------------------------------------------------------------
  // 8. Router
  // ---------------------------------------------------------------

  function updateStreak() {
    // simple deterministic "streak" based on days with any completed lesson activity
    var count = completedCount();
    streakNumEl.textContent = count > 0 ? Math.min(count, 30) : 0;
    starsNumEl.textContent = progress.stars || 0;
  }

  function navigate(state) {
    if (state.view === "lesson") {
      renderSidebar(state.lessonId);
      renderLesson(state.lessonId);
    } else {
      renderSidebar(null);
      renderOverview();
    }
    updateStreak();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // initial route
  if (progress.lastVisited && LESSON_INDEX[progress.lastVisited]) {
    renderSidebar(null);
  }
  navigate({ view: "overview" });

})();
