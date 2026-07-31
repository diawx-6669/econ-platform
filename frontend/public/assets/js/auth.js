(function () {
  "use strict";

  var API_BASE = window.__API_BASE__ || "http://localhost:4000/api";

  var tabsWrap = document.querySelector(".tabs");
  var tabLogin = document.getElementById("tab-login");
  var tabRegister = document.getElementById("tab-register");
  var panelLogin = document.getElementById("panel-login");
  var panelRegister = document.getElementById("panel-register");

  function activate(which) {
    var isRegister = which === "register";

    tabLogin.classList.toggle("is-active", !isRegister);
    tabRegister.classList.toggle("is-active", isRegister);
    tabLogin.setAttribute("aria-selected", String(!isRegister));
    tabRegister.setAttribute("aria-selected", String(isRegister));

    panelLogin.classList.toggle("is-active", !isRegister);
    panelRegister.classList.toggle("is-active", isRegister);

    tabsWrap.classList.toggle("state-register", isRegister);
  }

  tabLogin.addEventListener("click", function () { activate("login"); });
  tabRegister.addEventListener("click", function () { activate("register"); });

  document.querySelectorAll("[data-switch]").forEach(function (btn) {
    btn.addEventListener("click", function () { activate(btn.getAttribute("data-switch")); });
  });

  // ---------- Password visibility ----------

  document.querySelectorAll(".toggle-pass").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetId = btn.getAttribute("data-target");
      var input = document.getElementById(targetId);
      var isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      btn.classList.toggle("is-visible", isPassword);
      btn.setAttribute("aria-label", isPassword ? "Скрыть пароль" : "Показать пароль");
    });
  });

  // ---------- Password strength (register) ----------

  var regPassword = document.getElementById("reg-password");
  var strengthBar = document.querySelector(".pass-strength__bar i");
  var strengthLabel = document.querySelector(".pass-strength__label");

  function scorePassword(value) {
    var score = 0;
    if (value.length >= 8) score += 1;
    if (value.length >= 12) score += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    return Math.min(score, 4);
  }

  var strengthMeta = [
    { width: "0%", color: "#e94f9e", label: "Минимум 8 символов" },
    { width: "25%", color: "#e94f9e", label: "Слабый пароль" },
    { width: "50%", color: "#f2b84b", label: "Средний пароль" },
    { width: "75%", color: "#2dd4da", label: "Хороший пароль" },
    { width: "100%", color: "#6fe3ab", label: "Надёжный пароль" }
  ];

  if (regPassword) {
    regPassword.addEventListener("input", function () {
      var s = regPassword.value.length ? scorePassword(regPassword.value) : 0;
      var meta = strengthMeta[s];
      strengthBar.style.width = meta.width;
      strengthBar.style.background = meta.color;
      strengthLabel.textContent = meta.label;
    });
  }

  // ---------- Validation helpers ----------

  function setError(inputId, message) {
    var el = document.querySelector('.field-error[data-for="' + inputId + '"]');
    if (el) el.textContent = message || "";
  }

  function markTouched(input) {
    input.classList.add("touched");
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  document.querySelectorAll(".field input").forEach(function (input) {
    input.addEventListener("blur", function () { markTouched(input); });
  });

  function setFormMessage(form, text, kind) {
    var el = document.querySelector('.form-message[data-form="' + form + '"]');
    if (!el) return;
    el.textContent = text || "";
    el.classList.remove("is-error", "is-success");
    if (kind) el.classList.add(kind);
  }

  function setLoading(button, loading) {
    button.classList.toggle("is-loading", loading);
  }

  async function postJSON(path, payload) {
    var res = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    var data = null;
    try { data = await res.json(); } catch (e) { /* no body */ }
    if (!res.ok) {
      var msg = (data && data.message) || "Что-то пошло не так. Попробуйте ещё раз.";
      throw new Error(msg);
    }
    return data;
  }

  // ---------- Login submit ----------

  panelLogin.addEventListener("submit", async function (e) {
    e.preventDefault();
    var email = document.getElementById("login-email");
    var password = document.getElementById("login-password");
    markTouched(email); markTouched(password);

    var ok = true;
    setError("login-email", ""); setError("login-password", "");

    if (!isValidEmail(email.value)) { setError("login-email", "Введите корректный email"); ok = false; }
    if (password.value.length < 6) { setError("login-password", "Минимум 6 символов"); ok = false; }
    if (!ok) return;

    var button = panelLogin.querySelector(".btn-primary");
    setLoading(button, true);
    setFormMessage("login", "");

    try {
      await postJSON("/auth/login", { email: email.value, password: password.value });
      setFormMessage("login", "Готово! Перенаправляем в кабинет…", "is-success");
    } catch (err) {
      setFormMessage("login", err.message, "is-error");
    } finally {
      setLoading(button, false);
    }
  });

  // ---------- Register submit ----------

  panelRegister.addEventListener("submit", async function (e) {
    e.preventDefault();
    var name = document.getElementById("reg-name");
    var email = document.getElementById("reg-email");
    var password = document.getElementById("reg-password");
    var terms = document.getElementById("terms");

    [name, email, password].forEach(markTouched);
    setError("reg-name", ""); setError("reg-email", ""); setError("reg-password", ""); setError("terms", "");

    var ok = true;
    if (name.value.trim().length < 2) { setError("reg-name", "Введите имя"); ok = false; }
    if (!isValidEmail(email.value)) { setError("reg-email", "Введите корректный email"); ok = false; }
    if (password.value.length < 8) { setError("reg-password", "Минимум 8 символов"); ok = false; }
    if (!terms.checked) { setError("terms", "Нужно принять условия"); ok = false; }
    if (!ok) return;

    var button = panelRegister.querySelector(".btn-primary");
    setLoading(button, true);
    setFormMessage("register", "");

    try {
      await postJSON("/auth/register", {
        name: name.value.trim(),
        email: email.value,
        password: password.value
      });
      setFormMessage("register", "Аккаунт создан! Теперь войдите.", "is-success");
      setTimeout(function () { activate("login"); }, 1200);
    } catch (err) {
      setFormMessage("register", err.message, "is-error");
    } finally {
      setLoading(button, false);
    }
  });

})();
