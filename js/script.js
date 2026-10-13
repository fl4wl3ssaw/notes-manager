// Крок 3: Перевірка підключення файлу
console.log('script.js підключено');

// Крок 4: Оголошення даних Варіанта 13 (масив об'єктів нотаток)
const notes = [
    { title: 'Паролі від сервісів', category: 'Паролі' },
    { title: 'Ідеї для проєкту', category: 'Ідеї' },
    { title: 'Пін-код від офісу', category: 'Паролі' },
    { title: 'Список покупок', category: 'Особисте' },
    { title: 'План на тиждень', category: 'Особисте' }
];

// Крок 5 та 9: Підрахунок кількості нотаток у кожній категорії за допомогою циклу for
// Функція приймає масив нотаток, проходить по ньому циклом for та виводить підсумкову кількість нотаток за категоріями
function countNotesByCategory(notesArray) {
    const categoryCounts = {};

    for (let i = 0; i < notesArray.length; i++) {
        const cat = notesArray[i].category;
        if (categoryCounts[cat]) {
            categoryCounts[cat]++;
        } else {
            categoryCounts[cat] = 1;
        }
    }

    console.log('Кількість нотаток за категоріями:', categoryCounts);
    return categoryCounts;
}

// Виклики для перевірки
countNotesByCategory(notes);

// Крок 6 та 9: Умовна перевірка довжини пароля
// Функція приймає пароль і виводить попередження в консоль, якщо його довжина менша за 8 символів
function checkPasswordLength(password) {
    if (password.length < 8) {
        console.warn(`Попередження: Пароль "${password}" занадто короткий (менше 8 символів)!`);
    } else {
        console.log(`Пароль "${password}" має належну довжину.`);
    }
}

// Виклики для перевірки
checkPasswordLength('admin123');
checkPasswordLength('4321');

// Крок 7 та 9: Стрілочна функція перевірки надійності пароля (Вимога Варіанта 13)
// Стрілочна функція перевіряє, чи є пароль надійним (довжина >= 8), та повертає true або false
const isStrongPassword = password => password.length >= 8;

// Викликаємо та виводимо результат у консоль
console.log('Чи надійний "admin123":', isStrongPassword('admin123'));
console.log('Чи надійний "4321":', isStrongPassword('4321'));