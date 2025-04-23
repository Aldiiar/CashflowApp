function toggleForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.classList.toggle("active");
    if (form.classList.contains("active")) {
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  } else {
    console.error(`Форма с id ${formId} не найдена`);
  }
}

function fillAndOpenForm(type, data) {
  const idField = document.getElementById(`${type}-id`);
  const nameField = document.getElementById(`${type}-name`);

  if (idField && nameField) {
    idField.value = data.id || "";
    nameField.value = data.name || "";

    if (type === "category") {
      const categoryType = document.getElementById("category-type");
      if (categoryType) categoryType.value = data.type || "";
    }

    if (type === "subcategory") {
      const subcategoryCategory = document.getElementById("subcategory-category");
      if (subcategoryCategory) subcategoryCategory.value = data.category || "";
    }

    const formTitle = document.getElementById(`${type}-form-title`);
    if (formTitle) {
      formTitle.textContent = data.id ? `Изменить ${type}` : `Добавить ${type}`;
    }

    toggleForm(`${type}-form`);
  } else {
    console.error(`Не удалось найти поля формы для ${type}`);
  }
}

function editItem(type, data) {
  fillAndOpenForm(type, data);
}

const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
function confirmDelete(type, id, name) {
  const modal = document.getElementById("delete-modal");
  const message = document.getElementById("delete-message");
  const confirmButton = document.getElementById("confirm-delete-button");

  const typeText = {
    status: "статус",
    type: "тип",
    category: "категорию",
    subcategory: "подкатегорию",
  }[type];

  if (message && confirmButton) {
    message.textContent = `Вы уверены, что хотите удалить ${typeText} "${name}"?`;
    confirmButton.onclick = () => {
      deleteItem(type, id);
      closeModal();
    };
    modal.style.display = "block";
  }
}

function closeModal() {
  const modal = document.getElementById("delete-modal");
  if (modal) modal.style.display = "none";
}


function deleteItem(type, id) {
  fetch(`/api/v1/${type}/${id}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken && { "X-CSRFToken": csrfToken }),
    },
  })
    .then((response) => {
      if (response.ok) {
        alert(`${type} удален`);
        const row = document.querySelector(`#${type}-row-${id}`);
        if (row) row.remove();
        window.location.reload();
      } else {
        alert("Ошибка при удалении.");
      }
    })
    .catch((err) => {
      console.error("Ошибка:", err);
      alert("Ошибка при удалении.");
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");

  ["status", "type", "category", "subcategory"].forEach((type) => {
    const formElement = document.getElementById(`${type}-form-element`);
    if (formElement) {
      formElement.addEventListener("submit", function (e) {
        e.preventDefault();

        const id = document.getElementById(`${type}-id`)?.value;
        const name = document.getElementById(`${type}-name`)?.value;

        if (!name) {
          alert("Название не может быть пустым");
          return;
        }

        let payload = { name };
        if (type === "category") {
          payload.type = document.getElementById("category-type")?.value || "";
        } else if (type === "subcategory") {
          payload.category = document.getElementById("subcategory-category")?.value || "";
        }

        const method = id ? "PUT" : "POST";
        const url = id ? `/api/v1/${type}/${id}/` : `/api/v1/${type}/`;

        fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...(csrfToken && { "X-CSRFToken": csrfToken }),
          },
          body: JSON.stringify(payload),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data && data.id) {
              alert(`${type.charAt(0).toUpperCase() + type.slice(1)} успешно сохранен!`);
              this.reset();
              const formTitle = document.getElementById(`${type}-form-title`);
              if (formTitle) formTitle.textContent = `Добавить ${type}`;
              toggleForm(`${type}-form`);
              window.location.reload();
            } else {
              alert("Ошибка при сохранении.");
            }
          })
          .catch((err) => {
            console.error("Ошибка:", err);
            alert("Ошибка при отправке данных.");
          });
      });
    }
  });

  // Закрытие модального окна при клике вне его
  window.onclick = (event) => {
    const modal = document.getElementById("delete-modal");
    if (event.target == modal) {
      closeModal();
    }
  };
});
