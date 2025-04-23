document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("add-form");

    const statusSelect = document.getElementById("status");
    const typeSelect = document.getElementById("type");
    const categorySelect = document.getElementById("category");
    const subcategorySelect = document.getElementById("subcategory");

    // Загружаем категории при изменении типа
    typeSelect.addEventListener("change", () => {
        const typeId = typeSelect.value;
        if (typeId) {
            fetch(`/api/v1/get-categories/?type_id=${typeId}`)
                .then(res => res.json())
                .then(data => {
                    fillSelect(categorySelect, data.categories);
                    clearSelect(subcategorySelect);
                });
        } else {
            clearSelect(categorySelect);
            clearSelect(subcategorySelect);
        }
    });

    // Загружаем подкатегории при изменении категории
    categorySelect.addEventListener("change", () => {
        const categoryId = categorySelect.value;
        if (categoryId) {
            fetch(`/api/v1/get-subcategories/?category_id=${categoryId}`)
                .then(res => res.json())
                .then(data => fillSelect(subcategorySelect, data.subcategories));
        } else {
            clearSelect(subcategorySelect);
        }
    });

    // Обработка формы
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const data = {
            status: statusSelect.value,
            type: typeSelect.value,
            category: categorySelect.value,
            subcategory: subcategorySelect.value,
            amount: document.getElementById("amount").value,
            comment: document.getElementById("comment").value
        };

        fetch("/api/v1/cashflows/create/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json().then(body => ({ status: res.status, body })))
        .then(({ status, body }) => {
            if (status === 201) {
                showMessage("Запись успешно добавлена!", "success");
                form.reset();
                clearSelect(categorySelect);
                clearSelect(subcategorySelect);

                // Перенаправление на главную страницу
                if (body.redirect_url) {
                    window.location.href = body.redirect_url;
                }
            } else {
                showMessage(body.detail || "Ошибка при создании записи", "error");
            }
        })
        .catch(error => {
            console.error("Ошибка при отправке:", error);
            showMessage("Ошибка сети. Попробуйте позже.", "error");
        });
    });

    function fillSelect(select, items) {
        clearSelect(select); // Очистка select перед добавлением новых опций

        // Добавляем "Выберите" только один раз
        const placeholder = document.createElement("option");
        placeholder.textContent = "Выберите";
        placeholder.value = "";
        select.appendChild(placeholder); // Теперь мы добавляем пустую опцию только один раз

        // Добавляем реальные опции категорий
        items.forEach(item => {
            const option = document.createElement("option");
            option.value = item.id;
            option.textContent = item.name;
            select.appendChild(option);
        });
    }


    function clearSelect(select) {
        select.innerHTML = "";  // Очистим select от всех предыдущих опций, но без добавления пустого элемента
    }

    function showMessage(text, type) {
        const messagesDiv = document.querySelector(".messages") || createMessagesDiv();
        messagesDiv.innerHTML = "";

        const alert = document.createElement("div");
        alert.className = `alert alert-${type}`;
        alert.textContent = text;
        messagesDiv.appendChild(alert);
    }

    function createMessagesDiv() {
        const messagesDiv = document.createElement("div");
        messagesDiv.className = "messages";
        form.prepend(messagesDiv);
        return messagesDiv;
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== "") {
            const cookies = document.cookie.split(";");
            for (let cookie of cookies) {
                cookie = cookie.trim();
                if (cookie.startsWith(name + "=")) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
