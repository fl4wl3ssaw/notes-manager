// Крок 1: Підготуйте дані варіанта 13 — назву, текст, дату й категорію кожної нотатки.
const notes = [
    {
        title: 'Паролі від сервісів',
        text: 'Робоча пошта: пароль збережено у захищеному менеджері.',
        date: '2026-10-20',
        category: 'Паролі'
    },
    {
        title: 'Ідеї для проєкту',
        text: 'Зробити редизайн сторінки нотаток.',
        date: '2026-10-19',
        category: 'Ідеї'
    },
    {
        title: 'Пін-код від офісу',
        text: 'Пін-код збережено у захищеному менеджері.',
        date: '2026-10-18',
        category: 'Паролі'
    },
    {
        title: 'Список покупок',
        text: 'Кава, чай і молоко.',
        date: '2026-10-17',
        category: 'Особисте'
    },
    {
        title: 'План на тиждень',
        text: 'Підготувати завдання та впорядкувати нотатки.',
        date: '2026-10-16',
        category: 'Особисте'
    }
];

// Крок 2: Прибрати статичний приклад через querySelector i .remove()
const staticNote = document.querySelector('.static-example');
if (staticNote) {
    staticNote.remove();
}

// Знайдіть контейнер списку й елемент підсумку за їхніми id в HTML (#notes-list, #notes-count)
const listContainer = document.querySelector('#notes-list');
const notesCount = document.querySelector('#notes-count');
const noteForm = document.querySelector('.form');

// Крок 3: Порахуйте кількість нотаток у масиві та оновіть наявний лічильник p#notes-count.
function updateNotesCount() {
    notesCount.textContent = `Кількість нотаток: ${notes.length}`;
}

// Крок 4: Пройдіть масив нотаток циклом і створіть для кожної окрему картку.
function renderNotes(notesArray) {
    listContainer.replaceChildren();

    // Використовуємо entries() для отримання індексу (потрібно для data-id)
    for (const [index, note] of notesArray.entries()) {
        // Крок 5: Створіть елементи картки (article, h3, p)
        const article = document.createElement('article');
        const category = document.createElement('p'); // p за вимогами Варіанта 13
        const title = document.createElement('h3');
        const text = document.createElement('p');
        const date = document.createElement('p');

        article.classList.add('note-card');
        category.classList.add('note-category');
        title.classList.add('note-title');
        text.classList.add('note-text');
        date.classList.add('note-date');

        category.textContent = `Категорія: ${note.category}`;
        title.textContent = note.title;
        text.textContent = note.text;
        date.textContent = `Дата: ${note.date}`;

        // Крок 6: Додайте атрибут data-id та клас категорії
        article.dataset.id = index + 1; // Установлює атрибут data-id="1", data-id="2"...
        article.classList.add(`note-card--cat-${note.category.toLowerCase()}`);

        // Крок 7: Додайте всі створені елементи до картки, а картку — до контейнера списку.
        article.append(category, title, text, date);
        listContainer.append(article);
    }
}

// Крок 8: Викличте рендер одразу під час завантаження сторінки.
renderNotes(notes);
updateNotesCount();

// Крок 9: Дозвольте додавати нотатку через форму й одразу оновлюйте список та лічильник.
if (noteForm) {
    noteForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const titleInput = document.querySelector('#title');
        const textInput = document.querySelector('#textarea');
        const categoryInput = document.querySelector('#category');
        const dateInput = document.querySelector('#date');

        if (!titleInput.value.trim() || !textInput.value.trim()) {
            return;
        }

        notes.push({
            title: titleInput.value.trim(),
            text: textInput.value.trim(),
            date: dateInput.value || new Date().toISOString().slice(0, 10),
            category: categoryInput.value
        });

        renderNotes(notes);
        updateNotesCount();
        noteForm.reset();
    });
}