// Крок 1: Оберіть React для props і локального реактивного стану карток.
const API_URL = 'https://jsonplaceholder.typicode.com/posts?userId=1';

// Крок 4: Створіть компонент нотатки, який отримує title та excerpt через props.
function NoteCard({ title, excerpt }) {
    // Крок 6: Зберігайте стан розгортання всередині окремої картки.
    const [expanded, setExpanded] = React.useState(false);
    const preview = excerpt.length > 100 ? `${excerpt.slice(0, 100)}…` : excerpt;

    function toggleExpanded() {
        setExpanded((currentValue) => !currentValue);
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleExpanded();
        }
    }

    return (
        <article
            className="note-card note-card--cat-api"
            role="button"
            tabIndex={0}
            aria-expanded={expanded}
            onClick={toggleExpanded}
            onKeyDown={ handleKeyDown}
        >
            <h3 className="note-title">{title}</h3>
            <p className="note-text">{expanded ? excerpt : preview}</p>
            <span className="note-expand-hint">{expanded ? 'Згорнути' : 'Читати повністю'}</span>
        </article>
    );
}

function App() {
    // Крок 3: Зберігайте отримані записи в реактивному стані React.
    const [notes, setNotes] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [title, setTitle] = React.useState('');
    const [excerpt, setExcerpt] = React.useState('');

    // Крок 2: Завантажуйте API-дані асинхронно після монтування компонента.
    const loadData = React.useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            // Крок 3: Виконайте fetch-запит і дочекайтеся відповіді.
            const response = await fetch(API_URL);

            // Крок 4: Перевірте HTTP-статус відповіді перед читанням JSON.
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            // Крок 5: Розберіть JSON і виведіть масив у консоль для перевірки.
            const posts = await response.json();
            console.log('Нотатки з JSONPlaceholder:', posts);

            if (!Array.isArray(posts)) {
                throw new Error('API повернув дані не у форматі списку.');
            }

            // Крок 6: Перетворіть поля API title і body на props нотатки.
            setNotes(posts.map((post) => ({
                id: post.id,
                title: post.title,
                excerpt: post.body
            })));
        } catch (requestError) {
            // Крок 8: Покажіть зрозуміле повідомлення та запишіть деталі в консоль.
            console.error('Не вдалося завантажити нотатки:', requestError);
            setError('Нотатки недоступні офлайн.');
        } finally {
            // Крок 7: Завершіть стан завантаження після відповіді або помилки.
            setLoading(false);
        }
    }, []);

    // Крок 3: Завантажте початковий список після першого рендерингу.
    React.useEffect(() => {
        loadData();
    }, [loadData]);

    function handleSubmit(event) {
        event.preventDefault();
        if (!title.trim() || !excerpt.trim()) return;

        setNotes((currentNotes) => [
            ...currentNotes,
            {
                id: `local-${Date.now()}`,
                title: title.trim(),
                excerpt: excerpt.trim()
            }
        ]);
        setTitle('');
        setExcerpt('');
    }

    const nearLimit = excerpt.length >= 270;

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
                    <section className="section" id="new">
                        <h2 className="section-title">Нова нотатка</h2>
                        <form className="form" onSubmit={handleSubmit}>
                            <label htmlFor="title" className="form-label">Заголовок:</label>
                            <input
                                id="title"
                                className="form-input"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                required
                            />

                            <label htmlFor="excerpt" className="form-label">Текст (до 300 символів):</label>
                            <textarea
                                id="excerpt"
                                className={`form-input form-textarea${nearLimit ? ' near-limit' : ''}`}
                                value={excerpt}
                                onChange={(event) => setExcerpt(event.target.value.slice(0, 300))}
                                maxLength={300}
                                required
                                aria-describedby="excerpt-counter"
                            />
                            <p id="excerpt-counter" className={`character-counter${nearLimit ? ' near-limit' : ''}`} aria-live="polite">
                                {excerpt.length} / 300 символів
                            </p>
                            <button type="submit" className="form-button">Додати нотатку</button>
                        </form>
                    </section>

                    <section className="section" id="list">
                        <h2 className="section-title">Мої нотатки</h2>

                        {/* Крок 7: Замініть ручний DOM-рендер декларативним JSX. */}
                        {loading && <p className="loading-indicator" role="status">Завантаження нотаток…</p>}
                        {error && (
                            <div className="notes-error" role="alert">
                                <p>{error}</p>
                                <button type="button" className="form-button" onClick={loadData} disabled={loading}>
                                    Оновити
                                </button>
                            </div>
                        )}
                        <p className="notes-count">Кількість нотаток: {notes.length}</p>

                        {/* Крок 5: Створіть картки через map з унікальним key та потрібними props. */}
                        <div className="cards-container" id="notes-list">
                            {notes.map((note) => (
                                <NoteCard key={note.id} title={note.title} excerpt={note.excerpt} />
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

// Крок 8: Переконайтеся, що React оновлює список після зміни стану без ручного DOM-коду.
// Крок 9: Перевірте дерево App і NoteCard та їхній state у React Developer Tools.
// Крок 10: Оберіть React за декларативний рендеринг і керування локальним state.
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
