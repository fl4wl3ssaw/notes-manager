// Крок 1: Описуйте нотатку полями id, title і text; реальні паролі не зберігайте.
const DB_NAME = 'notes';
const DB_VERSION = 1;
const STORE_NAME = 'notes';
const STORAGE_KEY = 'notes';
const MIGRATION_KEY = 'notes-indexeddb-migrated';
const API_URL = 'https://jsonplaceholder.typicode.com/posts?userId=1';

let databasePromise;

// Крок 2: Зберігайте масив нотаток у localStorage як JSON-рядок.
function saveToLocalStorage(items) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        return true;
    } catch (error) {
        console.error('Не вдалося зберегти нотатки в localStorage:', error);
        return false;
    }
}

// Крок 2: Читайте JSON із localStorage і безпечно обробляйте пошкоджені дані.
function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .map((note, index) => ({
                id: note.id ?? `legacy-${Date.now()}-${index}`,
                title: String(note.title ?? ''),
                text: String(note.text ?? note.body ?? note.excerpt ?? '')
            }))
            .filter((note) => note.title.trim() && note.text.trim());
    } catch (error) {
        console.error('Не вдалося прочитати нотатки з localStorage:', error);
        return [];
    }
}

// Крок 5: Спроєктуйте базу notes v1 зі сховищем notes і ключем id.
// Крок 6: Відкрийте IndexedDB та створіть сховище під час першого запуску/оновлення версії.
function openDB() {
    if (!databasePromise) {
        databasePromise = new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error('IndexedDB недоступна в цьому браузері.'));
                return;
            }

            const request = window.indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const database = event.target.result;
                if (!database.objectStoreNames.contains(STORE_NAME)) {
                    database.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error('Не вдалося відкрити IndexedDB.'));
            request.onblocked = () => reject(new Error('Відкриття IndexedDB заблоковане іншою вкладкою.'));
        }).catch((error) => {
            databasePromise = null;
            throw error;
        });
    }

    return databasePromise;
}

// Крок 7: Запишіть нову нотатку в IndexedDB через readwrite-транзакцію.
async function addItem(note) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).add(note);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error || new Error('Не вдалося додати нотатку.'));
        transaction.onabort = () => reject(transaction.error || new Error('Додавання нотатки перервано.'));
    });
}

// Крок 7: Оновіть наявний запис через put із незмінним id.
async function updateItem(note) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).put(note);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error || new Error('Не вдалося оновити нотатку.'));
        transaction.onabort = () => reject(transaction.error || new Error('Оновлення нотатки перервано.'));
    });
}

// Крок 7: Отримайте всі нотатки через readonly-транзакцію.
async function getAllItems() {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readonly');
        const request = transaction.objectStore(STORE_NAME).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('Не вдалося прочитати нотатки.'));
        transaction.onerror = () => reject(transaction.error || new Error('Помилка читання IndexedDB.'));
    });
}

// Крок 7: Видаліть нотатку за id через readwrite-транзакцію.
async function deleteItem(id) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).delete(id);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error || new Error('Не вдалося видалити нотатку.'));
        transaction.onabort = () => reject(transaction.error || new Error('Видалення нотатки перервано.'));
    });
}

function isMigrationComplete() {
    try {
        return localStorage.getItem(MIGRATION_KEY) === 'true';
    } catch (error) {
        console.error('Не вдалося прочитати прапорець міграції:', error);
        return false;
    }
}

function markMigrationComplete() {
    try {
        localStorage.setItem(MIGRATION_KEY, 'true');
    } catch (error) {
        console.error('Не вдалося зберегти прапорець міграції:', error);
    }
}

// Крок 8: Перенесіть localStorage-нотатки пакетно лише один раз, якщо IndexedDB порожня.
async function migrateLocalStorageToIndexedDB(databaseItems) {
    const migrationDone = isMigrationComplete();
    if (databaseItems.length > 0) {
        if (!migrationDone) markMigrationComplete();
        return databaseItems;
    }

    if (migrationDone) return databaseItems;

    const legacyItems = loadFromLocalStorage();
    if (legacyItems.length > 0) {
        const database = await openDB();
        await new Promise((resolve, reject) => {
            const transaction = database.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            legacyItems.forEach((note) => store.put(note));
            transaction.oncomplete = resolve;
            transaction.onerror = () => reject(transaction.error || new Error('Не вдалося перенести нотатки.'));
            transaction.onabort = () => reject(transaction.error || new Error('Міграцію перервано.'));
        });
    }

    markMigrationComplete();
    return getAllItems();
}

// Крок 12: Додайте короткі коментарі до IndexedDB-функцій і збережіть роботу.
function App() {
    const [notes, setNotes] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [storageWarning, setStorageWarning] = React.useState('');
    const [title, setTitle] = React.useState('');
    const [text, setText] = React.useState('');
    const [editingId, setEditingId] = React.useState(null);
    const [saving, setSaving] = React.useState(false);
    const formSectionRef = React.useRef(null);

    // Крок 9: Завантажте список зі сховища й оновлюйте React state отриманими записами.
    const loadData = React.useCallback(async () => {
        setLoading(true);
        setError('');
        let indexedDBAvailable = true;
        let savedNotes = [];

        try {
            const databaseItems = await getAllItems();
            savedNotes = await migrateLocalStorageToIndexedDB(databaseItems);
            if (savedNotes.length > 0) saveToLocalStorage(savedNotes);
        } catch (databaseError) {
            // Крок 11: Поясніть, коли IndexedDB недоступна, і спробуйте localStorage.
            console.error('IndexedDB недоступна:', databaseError);
            indexedDBAvailable = false;
            setStorageWarning('IndexedDB недоступна; використовую localStorage.');
            savedNotes = loadFromLocalStorage();
        }

        if (savedNotes.length > 0) {
            setNotes(savedNotes);
            setLoading(false);
            return;
        }

        try {
            // Крок 9: Якщо локальні сховища порожні, завантажте початкові нотатки з API.
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const posts = await response.json();
            if (!Array.isArray(posts)) throw new Error('API повернув некоректний список нотаток.');

            const remoteNotes = posts.map((post) => ({
                id: post.id,
                title: post.title,
                text: post.body
            }));

            setNotes(remoteNotes);
            if (!saveToLocalStorage(remoteNotes)) {
                setStorageWarning('Не вдалося зберегти копію нотаток у localStorage.');
            }

            if (indexedDBAvailable) {
                try {
                    const database = await openDB();
                    await new Promise((resolve, reject) => {
                        const transaction = database.transaction(STORE_NAME, 'readwrite');
                        const store = transaction.objectStore(STORE_NAME);
                        remoteNotes.forEach((note) => store.put(note));
                        transaction.oncomplete = resolve;
                        transaction.onerror = () => reject(transaction.error || new Error('Не вдалося зберегти API-нотатки.'));
                    });
                } catch (databaseWriteError) {
                    console.error('Не вдалося зберегти API-нотатки в IndexedDB:', databaseWriteError);
                    setStorageWarning('Нотатки завантажено, але IndexedDB недоступна; збережено копію в localStorage.');
                }
            }
        } catch (requestError) {
            console.error('Не вдалося завантажити нотатки:', requestError);
            setError('Нотатки недоступні офлайн.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Крок 4 і 10: Перевіряйте localStorage та IndexedDB у DevTools після перезавантаження.
    React.useEffect(() => {
        loadData();
    }, [loadData]);

    function createId() {
        return window.crypto?.randomUUID?.() ?? `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    // Крок 3: Збережіть кожне додавання, редагування чи видалення в обох сховищах.
    async function saveMutation(nextNotes, operation) {
        setSaving(true);
        setStorageWarning('');
        if (!saveToLocalStorage(nextNotes)) {
            setStorageWarning('Не вдалося зберегти зміни в localStorage.');
        }

        try {
            await operation();
            const storedNotes = await getAllItems();
            setNotes(storedNotes);
            if (!saveToLocalStorage(storedNotes)) {
                setStorageWarning('Нотатку збережено в IndexedDB, але не вдалося оновити localStorage.');
            }
        } catch (databaseError) {
            // Крок 11: Залиште localStorage як резерв, якщо CRUD-операція IndexedDB не вдалася.
            console.error('Не вдалося зберегти зміни в IndexedDB:', databaseError);
            setNotes(nextNotes);
            setStorageWarning('IndexedDB недоступна; зміни збережені лише в localStorage.');
        } finally {
            setSaving(false);
        }
    }

    // Крок 3: Додайте новий запис у localStorage та IndexedDB.
    async function handleSubmit(event) {
        event.preventDefault();
        if (!title.trim() || !text.trim()) return;

        const note = {
            id: editingId ?? createId(),
            title: title.trim(),
            text: text.trim()
        };
        const nextNotes = editingId === null
            ? [...notes, note]
            : notes.map((currentNote) => currentNote.id === editingId ? note : currentNote);

        await saveMutation(nextNotes, () => editingId === null ? addItem(note) : updateItem(note));
        setTitle('');
        setText('');
        setEditingId(null);
    }

    // Крок 3: Завантажте нотатку у форму редагування, зберігши її id.
    function handleEdit(note) {
        setEditingId(note.id);
        setTitle(note.title);
        setText(note.text);
        formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    // Крок 3: Видаліть нотатку з обох сховищ і повторно прочитайте список.
    async function handleDelete(noteId) {
        const nextNotes = notes.filter((note) => note.id !== noteId);
        await saveMutation(nextNotes, () => deleteItem(noteId));
        if (editingId === noteId) {
            setEditingId(null);
            setTitle('');
            setText('');
        }
    }

    const nearLimit = text.length >= 270;

    return (
        <>
            <header className="header">
                <h1 className="header-title">Менеджер нотаток</h1>
                <nav className="nav">
                    <a href="#new" className="nav-link">Нова нотатка</a>
                    <a href="#list" className="nav-link">Мої нотатки</a>
                </nav>
            </header>

            <div className="layout-wrapper">
                <main className="main">
                    <section className="section" id="new" ref={formSectionRef}>
                        <h2 className="section-title">{editingId === null ? 'Нова нотатка' : 'Редагувати нотатку'}</h2>
                        <form className="form" onSubmit={handleSubmit}>
                            <label htmlFor="title" className="form-label">Заголовок:</label>
                            <input id="title" className="form-input" value={title} onChange={(event) => setTitle(event.target.value)} required />
                            <label htmlFor="text" className="form-label">Текст (до 300 символів):</label>
                            <textarea
                                id="text"
                                className={`form-input form-textarea${nearLimit ? ' near-limit' : ''}`}
                                value={text}
                                onChange={(event) => setText(event.target.value.slice(0, 300))}
                                maxLength={300}
                                required
                                aria-describedby="text-counter"
                            />
                            <p id="text-counter" className={`character-counter${nearLimit ? ' near-limit' : ''}`} aria-live="polite">
                                {text.length} / 300 символів
                            </p>
                            <div className="form-actions">
                                <button type="submit" className="form-button" disabled={saving}>
                                    {saving ? 'Збереження…' : editingId === null ? 'Додати нотатку' : 'Зберегти зміни'}
                                </button>
                                {editingId !== null && (
                                    <button type="button" className="form-button form-button--secondary" onClick={() => { setEditingId(null); setTitle(''); setText(''); }}>
                                        Скасувати
                                    </button>
                                )}
                            </div>
                        </form>
                    </section>

                    <section className="section" id="list">
                        <h2 className="section-title">Мої нотатки</h2>
                        {loading && <p className="loading-indicator" role="status">Завантаження нотаток…</p>}
                        {error && (
                            <div className="notes-error" role="alert">
                                <p>{error}</p>
                                <button type="button" className="form-button" onClick={loadData} disabled={loading}>Оновити</button>
                            </div>
                        )}
                        {storageWarning && <p className="storage-warning" role="status">{storageWarning}</p>}
                        <p className="notes-count">Кількість нотаток: {notes.length}</p>
                        <div className="cards-container" id="notes-list">
                            {notes.map((note) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    disabled={saving}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </section>
                </main>
            </div>

            <footer className="footer">
                <p className="footer-text">Автор проєкту: Лаба Іван, 2026</p>
            </footer>
        </>
    );
}

// Крок 3: Редагуйте або видаляйте нотатку з картки без зміни її ідентифікатора.
function NoteCard({ note, disabled, onEdit, onDelete }) {
    // Крок 6: Керуйте розгортанням тексту локальним станом компонента.
    const [expanded, setExpanded] = React.useState(false);
    const preview = note.text.length > 100 ? `${note.text.slice(0, 100)}…` : note.text;

    return (
        <article className="note-card note-card--cat-api">
            <h3 className="note-title">{note.title}</h3>
            <p className="note-text">{expanded ? note.text : preview}</p>
            <button type="button" className="note-expand-button" onClick={() => setExpanded((value) => !value)}>
                {expanded ? 'Згорнути' : 'Читати повністю'}
            </button>
            <div className="note-actions">
                <button type="button" className="form-button" onClick={() => onEdit(note)} disabled={disabled}>Редагувати</button>
                <button type="button" className="form-button form-button--danger" onClick={() => onDelete(note.id)} disabled={disabled}>Видалити</button>
            </div>
        </article>
    );
}

// Крок 12: Запустіть React-компонент у кореневому елементі сторінки.
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
