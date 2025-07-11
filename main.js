/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/js/TicketView.js
/**
 *  Класс для отображения тикетов на странице.
 *  Он содержит методы для генерации разметки тикета.
 * */

class TicketView {
  static render(ticket) {
    const ticketEl = document.createElement("div");
    ticketEl.classList.add("ticket");
    ticketEl.dataset.id = ticket.id;

    // Статус тикета
    const status = document.createElement("div");
    status.className = `ticket-status ${ticket.status ? "checked" : ""}`;
    status.textContent = ticket.status ? "✓" : "";

    // Содержание тикета
    const contentWrapper = document.createElement("div");
    contentWrapper.className = "ticket-content-wrapper";
    const title = document.createElement("div");
    title.className = "ticket-title";
    title.textContent = ticket.name;
    const description = document.createElement("div");
    description.className = "ticket-description hidden";
    description.textContent = ticket.description || "—";
    contentWrapper.append(title, description);

    // Дата
    const date = document.createElement("div");
    date.className = "ticket-date";
    const createdDate = new Date(ticket.created);
    date.textContent = `${createdDate.toLocaleDateString("ru-RU")} ${createdDate.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit"
    })}`;

    // Редактировать/удалить тикет
    const actions = document.createElement("div");
    actions.className = "ticket-actions";
    actions.innerHTML = `
      <div class="action-btn edit-btn" data-action="edit">✎</div>
      <div class="action-btn delete-btn" data-action="delete">✖</div>
    `;

    // Сбор тикета
    ticketEl.append(status, contentWrapper, date, actions);
    return ticketEl;
  }
}
;// ./src/js/TicketForm.js
/**
 *  Класс для создания формы создания нового тикета
 * */
class TicketForm {
  constructor(onSubmit, options = {}) {
    this.onSubmit = onSubmit;
    this.options = options;
    this.form = this.createForm();
  }
  createForm() {
    const form = document.createElement("form");
    if (this.options.isAddTicket || this.options.isEdit) {
      // Создать/редактировать тикет
      form.innerHTML = `
        <h2>${this.options.title}</h2>
        <div class="form-group">
          <label for="name">Краткое описание</label>
          <input type="text" id="name" name="name" placeholder="Введите краткое описание" required />
        </div>
        <div class="form-group">
          <label for="description">Подробное описание</label>
          <textarea id="description" name="description" placeholder="Введите подробное описание"></textarea>
        </div>
        <div class="modal-buttons">
          <button type="button" class="btn btn-secondary">Отменить</button>
          <button type="submit" class="btn btn-primary">${this.options.submitText || "Ok"}</button>
        </div>
      `;

      // Заполнение тикета
      if (this.options.isEdit && this.options.initialData) {
        const nameInput = form.querySelector("#name");
        const descriptionInput = form.querySelector("#description");
        if (nameInput) nameInput.value = this.options.initialData.name || "";
        if (descriptionInput) descriptionInput.value = this.options.initialData.description || "";
      }
    } else if (this.options.isConfirm) {
      // Окно удаления тикета
      form.innerHTML = `
        <h2>${this.options.title}</h2>
        <p>${this.options.message}</p>
        <div class="modal-buttons">
          <button type="button" class="btn btn-secondary">Отменить</button>
          <button type="submit" class="btn btn-primary">${this.options.submitText || "Ok"}</button>
        </div>
      `;
    }
    form.addEventListener("submit", event => this.handleSubmit(event));
    return form;
  }
  handleSubmit(event) {
    event.preventDefault();
    if (this.options.isAddTicket || this.options.isEdit) {
      // Добавление/редактирование тикета
      const formData = new FormData(event.target);
      const ticketData = {
        name: formData.get("name"),
        description: formData.get("description") || ""
      };
      this.onSubmit(ticketData);
      event.target.reset();
    } else if (this.options.isConfirm) {
      // Подтвердить удаление
      this.onSubmit();
    }
    // Закрыть окно
    this.closeModal();
  }
  showModal() {
    this.modal = document.createElement("div");
    this.modal.className = "modal";
    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    modalContent.appendChild(this.form);
    this.modal.appendChild(modalContent);
    document.body.appendChild(this.modal);

    // Закрыть окно при клике вне области
    this.modal.addEventListener("click", event => {
      if (event.target === this.modal) this.closeModal();
    });

    // Закрыть окно нажатием на кнопку Отменить
    const cancelButton = this.form.querySelector(".btn-secondary");
    if (cancelButton) {
      cancelButton.addEventListener("click", () => this.closeModal());
    }
  }
  closeModal() {
    if (this.modal) {
      this.modal.remove();
    }
  }
}
;// ./src/js/HelpDesk.js
/**
 *  Основной класс приложения
 * */


class HelpDesk {
  constructor(container, ticketService) {
    this.container = container;
    this.ticketService = ticketService;
    this.tickets = [];
    this.renderTickets();
    this.addEventListeners();
  }
  init() {
    console.info("init");
    this.renderTickets();
  }
  async renderTickets() {
    try {
      this.tickets = await this.ticketService.list();
      this.container.innerHTML = "";
      this.tickets.forEach(ticket => {
        // рендеринг
        const ticketEl = TicketView.render(ticket);
        this.container.appendChild(ticketEl);
      });
    } catch (error) {
      console.error("Ошибка при загрузке тикетов:", error.message);
      alert("Не удалось загрузить тикеты. Попробуйте позже.");
    }
  }
  addEventListeners() {
    // Кнопка Добавить тикет
    document.getElementById("add-ticket-btn").addEventListener("click", () => {
      const form = new TicketForm(async data => {
        try {
          const newTicket = await this.ticketService.create(data);
          this.tickets.push(newTicket);
          this.renderTickets();
        } catch (error) {
          console.error("Ошибка при создании тикета:", error.message);
          alert("Не удалось создать тикет. Попробуйте позже.");
        }
      }, {
        isAddTicket: true,
        title: "Добавить тикет",
        submitText: "Ок"
      });
      form.showModal();
    });

    // Клик на контейнер
    this.container.addEventListener("click", async event => {
      const target = event.target;
      const ticketElement = target.closest(".ticket");
      if (!ticketElement) return;
      const ticketId = ticketElement.dataset.id;
      if (target.classList.contains("delete-btn")) {
        // Удалить тикет
        const confirmForm = new TicketForm(async () => {
          try {
            await this.ticketService.delete(ticketId);
            this.tickets = this.tickets.filter(ticket => ticket.id !== ticketId);
            this.renderTickets();
          } catch (error) {
            console.error("Ошибка при удалении тикета:", error.message);
            alert("Не удалось удалить тикет. Попробуйте позже.");
          }
        }, {
          isConfirm: true,
          title: "Удаление тикета",
          message: "Вы уверены, что хотите удалить тикет? Это действие необратимо.",
          submitText: "Ок"
        });
        confirmForm.showModal();
      } else if (target.classList.contains("edit-btn")) {
        // Редактировать тикет
        const ticket = await this.ticketService.get(ticketId);
        const form = new TicketForm(async data => {
          await this.ticketService.update(ticketId, data);
          const updatedTicket = await this.ticketService.get(ticketId);
          this.tickets = this.tickets.map(t => t.id === ticketId ? updatedTicket : t);
          this.renderTickets();
        }, {
          isEdit: true,
          title: "Изменить тикет",
          initialData: ticket,
          submitText: "Ok"
        });
        form.showModal();
      } else if (target.classList.contains("ticket-status")) {
        // Переключить статус
        this.toggleStatus(ticketId);
      } else if (target.closest(".ticket-content-wrapper")) {
        // Показ/скрытие описания
        this.toggleDescription(ticketId);
      }
    });
  }
  async toggleStatus(ticketId) {
    try {
      const ticket = this.tickets.find(t => t.id === ticketId);
      if (!ticket) return;
      const updatedStatus = !ticket.status; // Переключаем статус
      await this.ticketService.update(ticketId, {
        ...ticket,
        status: updatedStatus
      });

      // Обновляем локальный массив тикетов
      this.tickets = this.tickets.map(t => t.id === ticketId ? {
        ...t,
        status: updatedStatus
      } : t);

      // Обновляем DOM
      const ticketElement = document.querySelector(`[data-id="${ticketId}"]`);
      if (ticketElement) {
        const statusIndicator = ticketElement.querySelector(".ticket-status");
        statusIndicator.classList.toggle("checked");
        statusIndicator.textContent = updatedStatus ? "✓" : "";
      }
    } catch (error) {
      console.error("Ошибка при изменении статуса тикета:", error.message);
      alert("Не удалось изменить статус тикета. Попробуйте позже.");
    }
  }
  toggleDescription(ticketId) {
    const ticketElement = document.querySelector(`[data-id="${ticketId}"]`);
    if (!ticketElement) return;
    const description = ticketElement.querySelector(".ticket-description");
    if (description) {
      description.classList.toggle("hidden");
    }
  }
}
;// ./src/js/api/createRequest.js
// const createRequest = async (options = {}) => {};

async function createRequest({
  method,
  id,
  data
}) {
  const url = new URL("http://localhost:7070/");
  url.searchParams.set("method", method);
  if (id) url.searchParams.set("id", id);
  const options = {
    method: data ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json"
    },
    body: data ? JSON.stringify(data) : null
  };
  try {
    const response = await fetch(url.toString(), options);
    if (!response.ok) {
      throw new Error(`Ошибка ${response.status}: ${await response.text()}`);
    }
    if (response.status === 204) {
      return null;
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error.message);
    throw error;
  }
}
;// ./src/js/TicketService.js
/**
 *  Класс для связи с сервером.
 *  Содержит методы для отправки запросов на сервер и получения ответов
 * */

class TicketService {
  async list() {
    return await createRequest({
      method: "allTickets"
    });
  }
  async get(id) {
    return await createRequest({
      method: "ticketById",
      id
    });
  }
  async create(data) {
    return await createRequest({
      method: "createTicket",
      data
    });
  }
  async update(id, data) {
    return await createRequest({
      method: "updateById",
      id,
      data
    });
  }
  async delete(id) {
    return await createRequest({
      method: "deleteById",
      id
    });
  }
}
;// ./src/js/app.js


const root = document.getElementById("root");
const ticketService = new TicketService();
const app = new HelpDesk(root, ticketService);
app.init();
;// ./src/index.js


/******/ })()
;