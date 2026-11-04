// Крок 1: Задайте перевірений endpoint JSONPlaceholder для нотаток користувача 1.
const API_URL = 'https://jsonplaceholder.typicode.com/posts?userId=1';

// Крок 2: Зберігайте отримані з API та додані через форму нотатки в одному масиві.
const notes = [];

const form = document.querySelector('.form');
const listContainer = document.querySelector('#notes-list');
const notesCount = document.querySelector('#notes-count');
const titleInput = document.querySelector('#title');
const excerptInput = document.querySelector('#excerpt');
const excerptCounter = document.querySelector('#excerpt-counter');
const loadingIndicator = document.querySelector('#loading-indicator');
const errorContainer = document.querySelector('#notes-error');
const errorMessage = document.querySelector('#notes-error-message');
const retryButton = document.querySelector('#retry-button');

// Крок 6: Оновлюйте кількість нотаток після отримання чи додавання записів.
function updateNotesCount() {
    notesCount.textContent = `Кількість нотаток: ${notes.length}`;
}

// Крок 6: Відобразіть у DOM назву та текст body кожної нотатки.
function renderNotes() {
    listContainer.replaceChildren();

    for (const [index, note] of notes.entries()) {
        const article = document.createElement('article');
        const category = document.createElement('p');
        const title = document.createElement('h3');
        const body = document.createElement('p');
        const date = document.createElement('p');

        article.classList.add('note-card');
        category.classList.add('note-category');
        title.classList.add('note-title');
        body.classList.add('note-text');
        date.classList.add('note-date');

        category.textContent = `Категорія: ${note.category || 'API'}`;
        title.textContent = note.title;
        body.textContent = note.body;
        date.textContent = note.date ? `Дата: ${note.date}` : '';

        article.dataset.id = index + 1;
        article.tabIndex = 0;
        article.setAttribute('role', 'button');
        article.setAttribute('aria-label', `Переглянути нотатку: ${note.title}`);
        article.append(category, title, body, date);
        listContainer.append(article);
    }

    updateNotesCount();
}

// Крок 7: Під час запиту покажіть індикатор завантаження та заблокуйте повторний клік.
function setLoading(isLoading) {
    loadingIndicator.hidden = !isLoading;
    retryButton.disabled = isLoading;
}

// Запит використовує публічний JSONPlaceholder API: https://jsonplaceholder.typicode.com/.
// Кроки 2–4, 8: Асинхронно завантажте нотатки, дочекайтеся fetch і перевірте HTTP-статус.
async function loadData() {
    setLoading(true);
    errorContainer.hidden = true;

    try {
        // Крок 3: Виконайте GET-запит і дочекайтеся відповіді сервера.
        const response = await fetch(API_URL);

        // Крок 4: Перетворіть неуспішний HTTP-статус на помилку для блоку catch.
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        // Крок 5: Розберіть JSON і виведіть його структуру в консоль для перевірки.
        const data = await response.json();
        console.log('Дані нотаток із JSONPlaceholder:', data);

        if (!Array.isArray(data)) {
            throw new Error('API повернув дані не у форматі масиву.');
        }

        // Крок 6: Перенесіть поля id, title і body з відповіді API до масиву нотаток.
        notes.splice(0, notes.length, ...data.map((post) => ({
            id: post.id,
            title: post.title,
            body: post.body,
            category: 'API'
        })));

        // Крок 6: Оновіть список на сторінці отриманими даними.
        renderNotes();
        document.querySelector('#selected-title').textContent = 'Нотатку не вибрано';
        document.querySelector('#selected-category').textContent = 'Натисніть на нотатку у списку';
        document.querySelector('#selected-text').textContent = 'Повний текст вибраної нотатки з’явиться тут.';
        document.querySelector('#selected-date').textContent = '';
    } catch (error) {
        // Кроки 8–9: Offline або інша помилка потрапляє сюди; покажіть повідомлення й запишіть деталі в консоль.
        console.error('Не вдалося завантажити нотатки:', error);
        errorMessage.textContent = 'Нотатки недоступні офлайн.';
        errorContainer.hidden = false;
    } finally {
        // Крок 7: Приховайте індикатор після успіху або помилки.
        setLoading(false);
    }
}

// Попередня лабораторна: Покажіть вибрану нотатку у блоці перегляду через делегований click.
listContainer.addEventListener('click', (event) => {
    const noteCard = event.target.closest('.note-card[data-id]');

    if (!noteCard || !listContainer.contains(noteCard)) {
        return;
    }

    const note = notes[Number(noteCard.dataset.id) - 1];
    if (!note) {
        return;
    }

    document.querySelector('#selected-title').textContent = note.title;
    document.querySelector('#selected-category').textContent = `Категорія: ${note.category || 'API'}`;
    document.querySelector('#selected-text').textContent = note.body;
    document.querySelector('#selected-date').textContent = note.date ? `Дата: ${note.date}` : '';
});

// Попередня лабораторна: Збережіть доступ до вибору нотатки з клавіатури.
listContainer.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.note-card[data-id]')) {
        event.preventDefault();
        event.target.click();
    }
});

// Попередня лабораторна: Перевіряйте назву й лічильник уривка під час введення.
function validateTitle() {
    titleInput.setCustomValidity(titleInput.value.trim() ? '' : 'Введіть назву нотатки.');
}

function updateExcerptCounter() {
    const length = excerptInput.value.length;
    const nearLimit = length >= 270;

    excerptCounter.textContent = `${length} / 300 символів`;
    excerptCounter.classList.toggle('near-limit', nearLimit);
    excerptInput.classList.toggle('near-limit', nearLimit);
    excerptInput.setCustomValidity(length <= 300 ? '' : 'Уривок не може містити більше ніж 300 символів.');
}

titleInput.addEventListener('input', validateTitle);
excerptInput.addEventListener('input', updateExcerptCounter);

// Попередня лабораторна: Додайте нотатку з форми без перезавантаження сторінки.
form.addEventListener('submit', (event) => {
    event.preventDefault();
    validateTitle();
    updateExcerptCounter();

    if (!form.reportValidity()) {
        return;
    }

    notes.push({
        id: Date.now(),
        title: titleInput.value.trim(),
        body: excerptInput.value.trim(),
        date: document.querySelector('#date').value || new Date().toISOString().slice(0, 10),
        category: document.querySelector('#category').value
    });

    renderNotes();
    form.reset();
    excerptInput.setCustomValidity('');
    titleInput.setCustomValidity('');
    updateExcerptCounter();
});

// Крок 10: Дозвольте повторно запустити loadData кнопкою без перезавантаження сторінки.
retryButton.addEventListener('click', loadData);

// Крок 2: Запустіть перший запит до API під час завантаження сторінки.
loadData();

// Попередня лабораторна: Початкове значення лічильника символів.
updateExcerptCounter();
