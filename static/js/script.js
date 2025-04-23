function displayRecords(records) {
  const tableBody = document.getElementById("records-table-body")

  tableBody.innerHTML = "" // Очищаем таблицу

  records.forEach((record) => {
    const row = document.createElement("tr")

    row.innerHTML = `
            <td>${record.custom_date}</td>
            <td>${record.status_name}</td>
            <td>${record.type_name}</td>
            <td>${record.category_name}</td>
            <td>${record.subcategory_name}</td>
            <td class="text-right">${record.amount} ₽</td>
            <td>${record.comment || "Нет комментария"}</td>
            <td><a href="/cashflow/update/${record.id}/">Изменить</a></td>
        `

    tableBody.appendChild(row)
  })
}

// Функция для загрузки данных с API
fetch("http://127.0.0.1:8000/api/v1/cashflows/", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((response) => response.json())
  .then((data) => {
    displayRecords(data) // Отображаем данные
  })
  .catch((error) => console.error("Error:", error))

function getFilters() {
  const status = document.getElementById("status").value
  const type = document.getElementById("type").value
  const category = document.getElementById("category").value
  const subcategory = document.getElementById("subcategory").value
  const dateFrom = document.getElementById("date_from").value
  const dateTo = document.getElementById("date_to").value

  // Возвращаем объект с фильтрами
  return {
    status,
    type,
    category,
    subcategory,
    date_from: dateFrom,
    date_to: dateTo,
  }
}

// Функция для отображения данных в таблице
// function displayRecords(records) {
//     const tableBody = document.getElementById('records-table-body');
//     tableBody.innerHTML = '';  // Очищаем таблицу

//     records.forEach(record => {
//         const row = document.createElement('tr');
//         row.innerHTML = `
//             <td>${record.custom_date}</td>
//             <td>${record.status_name}</td>
//             <td>${record.type_name}</td>
//             <td>${record.category_name}</td>
//             <td>${record.subcategory_name}</td>
//             <td class="text-right">${record.amount} ₽</td>
//             <td>${record.comment || 'Нет комментария'}</td>
//             <td><a href="record_form.html?id=${record.id}">Изменить</a></td>
//         `;
//         tableBody.appendChild(row);
//     });
// }

// Функция для загрузки данных с API с учётом фильтров
function loadRecords() {
  const filters = getFilters() // Получаем фильтры из формы
  const queryParams = new URLSearchParams(filters).toString() // Преобразуем фильтры в строку параметров

  fetch(`http://127.0.0.1:8000/api/v1/cashflows/?${queryParams}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      displayRecords(data) // Отображаем данные
    })
    .catch((error) => console.error("Error:", error))
}

// Обработчик для формы фильтрации
document.getElementById("filter-form").addEventListener("submit", (event) => {
  event.preventDefault() // Отменяем стандартное поведение формы
  loadRecords() // Загружаем данные с учётом фильтров
})

// Загрузим записи при первой загрузке страницы
loadRecords()
