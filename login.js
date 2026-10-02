const USERS_KEY = 'nikeUsers';
const SESSION_KEY = 'nikeSession';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const headlines = {
    login: 'WELCOME\nBACK.',
    register: 'JOIN\nTHE\nTEAM.'
};
const title = document.getElementById('auth-title');
const tabsBar = document.getElementById('auth-tabs');
const tabs = document.querySelectorAll('.auth-tab');
const forms = document.querySelectorAll('.auth-form');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const welcome = document.getElementById('welcome');
const welcomeName = document.getElementById('welcome-name');
const logoutButton = document.getElementById('logout');
const rules = {
    name: (value) => {
        if (value.trim().length < 3) {
            return 'Digite seu nome com pelo menos 3 caracteres.';
        }
        return '';
    },
    email: (value) => {
        if (!EMAIL_PATTERN.test(value.trim())) {
            return 'Digite um e-mail válido.';
        }
        return '';
    },
    password: (value) => {
        if (value === '') {
            return 'Digite sua senha.';
        }
        return '';
    },
    newPassword: (value) => {
        if (value.length < 8 || !/\d/.test(value)) {
            return 'Use pelo menos 8 caracteres, com um número.';
        }
        return '';
    },
    confirm: (value, form) => {
        if (value !== form.elements.password.value) {
            return 'As senhas não coincidem.';
        }
        return '';
    }
};
function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch {
        return [];
    }
}
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function setFieldError(input, message) {
    document.getElementById(`${input.id}-error`).textContent = message;
    input.classList.toggle('invalid', message !== '');
    input.setAttribute('aria-invalid', message !== '');
}
function setFormMessage(form, text, type) {
    const element = form.querySelector('.form-message');
    element.textContent = text;
    element.dataset.type = type;
}
function validateInput(input) {
    const message = rules[input.dataset.rule](input.value, input.form);
    setFieldError(input, message);
    return message === '';
}
function validateForm(form) {
    let isValid = true;
    form.querySelectorAll('[data-rule]').forEach((input) => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });
    if (!isValid) {
        form.querySelector('.invalid').focus();
    }
    return isValid;
}
function clearForm(form) {
    form.reset();
    form.querySelectorAll('[data-rule]').forEach((input) => setFieldError(input, ''));
    setFormMessage(form, '', '');
}
function showTab(name) {
    tabs.forEach((tab) => {
        const isActive = tab.dataset.tab === name;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', isActive);
    });
    forms.forEach((form) => {
        form.hidden = form.dataset.form !== name;
    });
    title.textContent = headlines[name];
}
function showWelcome(name) {
    welcomeName.textContent = `Olá, ${name}!`;
    tabsBar.hidden = true;
    forms.forEach((form) => {
        form.hidden = true;
    });
    welcome.hidden = false;
}
function showAuth() {
    welcome.hidden = true;
    tabsBar.hidden = false;
    showTab('login');
}
tabs.forEach((tab) => {
    tab.addEventListener('click', () => showTab(tab.dataset.tab));
});
document.querySelectorAll('.toggle-password').forEach((button) => {
    button.addEventListener('click', () => {
        const input = document.getElementById(button.dataset.target);
        const isHidden = input.type === 'password';
        if (isHidden) {
            input.type = 'text';
            button.textContent = 'Ocultar';
        } else {
            input.type = 'password';
            button.textContent = 'Mostrar';
        }
        button.setAttribute('aria-pressed', isHidden);
    });
});
forms.forEach((form) => {
    form.addEventListener('focusout', (event) => {
        if (event.target.matches('[data-rule]')) {
            validateInput(event.target);
        }
    });
    form.addEventListener('input', (event) => {
        if (event.target.classList.contains('invalid')) {
            validateInput(event.target);
        }
    });
});
registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateForm(registerForm)) {
        return;
    }

    const name = registerForm.elements.name.value.trim();
    const email = registerForm.elements.email.value.trim().toLowerCase();
    const password = registerForm.elements.password.value;
    const users = getUsers();

    if (users.some((user) => user.email === email)) {
        setFormMessage(registerForm, 'Este e-mail já está cadastrado.', 'error');
        return;
    }

    users.push({ name, email, password });
    saveUsers(users);
    clearForm(registerForm);
    showTab('login');
    setFormMessage(loginForm, 'Conta criada. Entre com seu e-mail e senha.', 'success');
});
loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateForm(loginForm)) {
        return;
    }

    const email = loginForm.elements.email.value.trim().toLowerCase();
    const password = loginForm.elements.password.value;
    const user = getUsers().find((item) => item.email === email && item.password === password);

    if (!user) {
        setFormMessage(loginForm, 'E-mail ou senha incorretos.', 'error');
        return;
    }

    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }));
    clearForm(loginForm);
    showWelcome(user.name);
});
logoutButton.addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    showAuth();
});
const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
if (session) {
    showWelcome(session.name);
}
