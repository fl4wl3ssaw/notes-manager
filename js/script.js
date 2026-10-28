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

document.querySelectorAll('.static-example').forEach((staticNote) => staticNote.remove());

const form = document.querySelector('.form');
const listContainer = document.querySelector('#notes-list');
const notesCount = document.querySelector('#notes-count');
const titleInput = document.querySelector('#title');
const excerptInput = document.querySelector('#excerpt');
const excerptCounter = document.querySelector('#excerpt-counter');

function updateNotesCount() {
    notesCount.textContent = `Кількість нотаток: ${notes.length}`;
}

function renderNotes() {
    listContainer.replaceChildren();

    for (const [index, note] of notes.entries()) {
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

        article.dataset.id = index + 1;
        article.classList.add(`note-card--cat-${note.category.toLowerCase()}`);
        article.tabIndex = 0;
        article.setAttribute('role', 'button');
        article.setAttribute('aria-label', `Переглянути нотатку: ${note.title}`);

        article.append(category, title, excerpt, date);
        listContainer.append(article);
    }
}


renderNotes();
updateNotesCount();

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

titleInput.addEventListener('input', validateTitle);

excerptInput.addEventListener('input', updateExcerptCounter);

form.addEventListener('submit', (event) => {
    event.preventDefault();
    validateTitle();
    updateExcerptCounter();

    if (!form.reportValidity()) {
        return;
    }

    notes.push({
        title: titleInput.value.trim(),
        excerpt: excerptInput.value.trim(),
        date: document.querySelector('#date').value || new Date().toISOString().slice(0, 10),
        category: document.querySelector('#category').value
    });

    renderNotes();
    updateNotesCount();
    form.reset();
    excerptInput.setCustomValidity('');
    titleInput.setCustomValidity('');
    updateExcerptCounter();
});

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

listContainer.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.note-card[data-id]')) {
        event.preventDefault();
        event.target.click();
    }
});

updateExcerptCounter();
