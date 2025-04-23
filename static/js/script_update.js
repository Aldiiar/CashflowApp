let initialCategories = [];

// ------------------------
// Глобальная функция для CSRF
// ------------------------
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// ------------------------
// Получение данных с сервера
// ------------------------

function fetchStatuses() {
    return fetch('/api/v1/get-statuses/')
        .then(response => response.json())
        .then(data => data.statuses)
        .catch(error => {
            console.error('Ошибка при получении статусов:', error);
            return [];
        });
}

function fetchTypes() {
    return fetch('/api/v1/get-types/')
        .then(response => response.json())
        .then(data => data.types)
        .catch(error => {
            console.error('Ошибка при получении типов:', error);
            return [];
        });
}

function fetchAllCategories() {
    return fetch('/api/v1/get-categories/')
        .then(response => response.json())
        .then(data => {
            initialCategories = data.categories;
        })
        .catch(error => console.error('Ошибка при получении всех категорий:', error));
}

function fetchCategories(typeId) {
    if (!typeId) {
        return Promise.resolve(initialCategories);
    }
    return fetch(`/api/v1/get-categories/?type_id=${typeId}`)
        .then(response => response.json())
        .then(data => data.categories)
        .catch(error => {
            console.error('Ошибка при получении категорий по типу:', error);
            return [];
        });
}

function fetchSubcategories(categoryId) {
    if (!categoryId) {
        return Promise.resolve([]);
    }
    return fetch(`/api/v1/get-subcategories/?category_id=${categoryId}`)
        .then(response => response.json())
        .then(data => data.subcategories)
        .catch(error => {
            console.error('Ошибка при получении подкатегорий:', error);
            return [];
        });
}

// ------------------------
// Заполнение выпадающих списков
// ------------------------

function fillStatuses() {
    const statusSelect = document.getElementById('status');
    fetchStatuses().then(statuses => {
        statuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status.id;
            option.textContent = status.name;
            statusSelect.appendChild(option);
        });
    });
}

function fillTypes() {
    const typeSelect = document.getElementById('type');
    fetchTypes().then(types => {
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = type.name;
            typeSelect.appendChild(option);
        });
    });
}

// ------------------------
// Слушатели событий
// ------------------------

document.getElementById('type').addEventListener('change', function() {
    const selectedTypeId = this.value;
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '<option value="">Выберите категорию</option>';

    fetchCategories(selectedTypeId).then(categories => {
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    });
});

document.getElementById('category').addEventListener('change', function() {
    const selectedCategoryId = this.value;
    const subcategorySelect = document.getElementById('subcategory');
    subcategorySelect.innerHTML = '<option value="">Выберите подкатегорию</option>';

    fetchSubcategories(selectedCategoryId).then(subcategories => {
        subcategories.forEach(subcategory => {
            const option = document.createElement('option');
            option.value = subcategory.id;
            option.textContent = subcategory.name;
            subcategorySelect.appendChild(option);
        });
    });
});

// ------------------------
// Отправка формы
// ------------------------

document.getElementById('update-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Получаем id из элемента формы или из контекста страницы
    const cashflowId = document.getElementById('cashflow-id').value; // Здесь предполагается, что id будет в скрытом поле с id="cashflow-id"

    if (!cashflowId) {
        alert('ID записи не найдено!');
        return;
    }

    fetch(`/api/v1/cashflows/update/${cashflowId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(responseData => {
        if (responseData.redirect) {
            window.location.href = responseData.redirect;
        } else if (responseData.message) {
            alert(responseData.message);
        } else {
            alert('Ошибка при обновлении записи');
        }
    })
    .catch(error => {
        console.error('Ошибка при отправке запроса:', error);
        alert('Произошла ошибка');
    });
});

// ------------------------
// Инициализация страницы
// ------------------------

document.addEventListener('DOMContentLoaded', function() {
    // fillStatuses();
    // fillTypes();
    fetchAllCategories().then(() => {
        const typeSelect = document.getElementById('type');
        const selectedTypeId = typeSelect.value;
        fetchCategories(selectedTypeId).then(categories => {
            const categorySelect = document.getElementById('category');
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        });
    });
});

// Удаление записи
document.getElementById('delete-button').addEventListener('click', function () {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) {
        return;
    }

    // Получаем ID из URL, предполагая что путь вида /cashflow/update/11/
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const pk = pathParts[pathParts.length - 1];

    // Собираем URL к DRF API
    const apiUrl = `/api/v1/cashflows/update/${pk}/`;

    fetch(apiUrl, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Accept': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка на сервере');
        }
        return response.json();
    })
    .then(responseData => {
        if (responseData.redirect) {
            window.location.href = responseData.redirect;
        } else if (responseData.message) {
            alert(responseData.message);
        } else {
            alert('Ошибка при удалении записи');
        }
    })
    .catch(error => {
        console.error('Ошибка при удалении:', error);
        alert('Произошла ошибка при удалении');
    });
});
