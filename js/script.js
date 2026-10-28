// Крок 1: Початковий масив нотаток варіанта 13 із назвою, уривком, датою та категорією.
const notes = [
    {
        title: 'Паролі від сервісів',
        excerpt: 'Робоча пошта: пароль збережено у захищеному менеджері.',
        date: '2026-10-20',
        category: 'Паролі'
    },
    {
        title: 'Ідеї для проєкту',
        excerpt: 'Зробити редизайн сторінки нотаток.',
        date: '2026-10-19',
        category: 'Ідеї'
    },
    {
        title: 'Пін-код від офісу',
        excerpt: 'Пін-код збережено у захищеному менеджері.',
        date: '2026-10-18',
        category: 'Паролі'
    },
    {
        title: 'Список покупок',
        excerpt: 'Кава, чай і молоко.',
        date: '2026-10-17',
        category: 'Особисте'
    },
    {
        title: 'План на тиждень',
        excerpt: 'Підготувати завдання та впорядкувати нотатки.',
        date: '2026-10-16',
        category: 'Особисте'
    }
];

// Крок 2: Приберіть статичні картки та знайдіть форму, список і елементи інтерфейсу.
document.querySelectorAll('.static-example').forEach((staticNote) => staticNote.remove());

const form = document.querySelector('.form');
const listContainer = document.querySelector('#notes-list');
const notesCount = document.querySelector('#notes-count');
const titleInput = document.querySelector('#title');
const excerptInput = document.querySelector('#excerpt');
const excerptCounter = document.querySelector('#excerpt-counter');

// Крок 3: Оновлюйте підсумок кількості нотаток після кожної зміни масиву.
function updateNotesCount() {
    notesCount.textContent = `Кількість нотаток: ${notes.length}`;
}

// Крок 4: Побудуйте картки списку з нотаток, збережених у масиві.
function renderNotes() {
    listContainer.replaceChildren();

    for (const [index, note] of notes.entries()) {
        // Крок 5: Створіть елементи картки та заповніть їх даними нотатки.
        const article = document.createElement('article');
        const category = document.createElement('p');
        const title = document.createElement('h3');
        const excerpt = document.createElement('p');
        const date = document.createElement('p');

        article.classList.add('note-card');
        category.classList.add('note-category');
        title.classList.add('note-title');
        excerpt.classList.add('note-text');
        date.classList.add('note-date');

        category.textContent = `Категорія: ${note.category}`;
        title.textContent = note.title;
        excerpt.textContent = note.excerpt;
        date.textContent = `Дата: ${note.date}`;

        // Крок 6: Позначте картку ідентифікатором для делегованої події click.
        article.dataset.id = index + 1;
        article.classList.add(`note-card--cat-${note.category.toLowerCase()}`);
        article.tabIndex = 0;
        article.setAttribute('role', 'button');
        article.setAttribute('aria-label', `Переглянути нотатку: ${note.title}`);

        // Крок 7: Додайте картку до контейнера списку.
        article.append(category, title, excerpt, date);
        listContainer.append(article);
    }
}

// Крок 8: Відобразіть стартові нотатки після завантаження сторінки.
renderNotes();
updateNotesCount();

// Крок 9: Перевіряйте назву й лічильник уривка під час введення.
function validateTitle() {
    titleInput.setCustomValidity(
        titleInput.value.trim() ? '' : 'Введіть назву нотатки.'
    );
}

function updateExcerptCounter() {
    const length = excerptInput.value.length;
    const nearLimit = length >= 270;

    excerptCounter.textContent = `${length} / 300 символів`;
    excerptCounter.classList.toggle('near-limit', nearLimit);
    excerptInput.classList.toggle('near-limit', nearLimit);
    excerptInput.setCustomValidity(
        length <= 300 ? '' : 'Уривок не може містити більше ніж 300 символів.'
    );
}

// Подія input для назви: не дозволяйте надсилати рядок лише з пробілів.
titleInput.addEventListener('input', validateTitle);

// Подія input для уривка: оновлюйте лічильник і попереджайте про наближення до ліміту.
excerptInput.addEventListener('input', updateExcerptCounter);

// Крок 10: Обробіть submit без перезавантаження, додайте об'єкт і очистьте форму.
form.addEventListener('submit', (event) => {
    event.preventDefault();
    validateTitle();
    updateExcerptCounter();

    if (!form.reportValidity()) {
        return;
    }

    // Крок 11: Створіть нову нотатку з даних форми та додайте її до масиву.
    notes.push({
        title: titleInput.value.trim(),
        excerpt: excerptInput.value.trim(),
        date: document.querySelector('#date').value || new Date().toISOString().slice(0, 10),
        category: document.querySelector('#category').value
    });

    // Крок 12: Повторно відрендерте список, оновіть лічильник і скиньте форму.
    renderNotes();
    updateNotesCount();
    form.reset();
    excerptInput.setCustomValidity('');
    titleInput.setCustomValidity('');
    updateExcerptCounter();
});

// Крок 13: Делегуйте click на контейнері та покажіть повний текст вибраної нотатки.
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
    document.querySelector('#selected-category').textContent = `Категорія: ${note.category}`;
    document.querySelector('#selected-text').textContent = note.excerpt;
    document.querySelector('#selected-date').textContent = `Дата: ${note.date}`;
});

// Дозвольте відкрити нотатку клавішами Enter або Space.
listContainer.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.note-card[data-id]')) {
        event.preventDefault();
        event.target.click();
    }
});

// Відобразіть правильне значення лічильника символів при першому завантаженні.
updateExcerptCounter();
