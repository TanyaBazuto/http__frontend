/**
 *  Класс для создания формы создания нового тикета
 * */
export default class TicketForm {
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
        if (descriptionInput)
          descriptionInput.value = this.options.initialData.description || "";
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

    form.addEventListener("submit", (event) => this.handleSubmit(event));
    return form;
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.options.isAddTicket || this.options.isEdit) {
      // Добавление/редактирование тикета
      const formData = new FormData(event.target);
      const ticketData = {
        name: formData.get("name"),
        description: formData.get("description") || "",
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
    this.modal.addEventListener("click", (event) => {
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
