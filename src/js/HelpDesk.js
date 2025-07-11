/**
 *  Основной класс приложения
 * */
import TicketView from "./TicketView";
import TicketForm from "./TicketForm";

export default class HelpDesk {
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
      this.tickets.forEach((ticket) => {
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
      const form = new TicketForm(
        async (data) => {
          try {
            const newTicket = await this.ticketService.create(data);
            this.tickets.push(newTicket);
            this.renderTickets();
          } catch (error) {
            console.error("Ошибка при создании тикета:", error.message);
            alert("Не удалось создать тикет. Попробуйте позже.");
          }
        },
        {
          isAddTicket: true,
          title: "Добавить тикет",
          submitText: "Ок",
        },
      );
      form.showModal();
    });

    // Клик на контейнер
    this.container.addEventListener("click", async (event) => {
      const target = event.target;
      const ticketElement = target.closest(".ticket");
      if (!ticketElement) return;

      const ticketId = ticketElement.dataset.id;

      if (target.classList.contains("delete-btn")) {
        // Удалить тикет
        const confirmForm = new TicketForm(
          async () => {
            try {
              await this.ticketService.delete(ticketId);
              this.tickets = this.tickets.filter(
                (ticket) => ticket.id !== ticketId,
              );
              this.renderTickets();
            } catch (error) {
              console.error("Ошибка при удалении тикета:", error.message);
              alert("Не удалось удалить тикет. Попробуйте позже.");
            }
          },
          {
            isConfirm: true,
            title: "Удаление тикета",
            message:
              "Вы уверены, что хотите удалить тикет? Это действие необратимо.",
            submitText: "Ок",
          },
        );
        confirmForm.showModal();
      } else if (target.classList.contains("edit-btn")) {
        // Редактировать тикет
        const ticket = await this.ticketService.get(ticketId);
        const form = new TicketForm(
          async (data) => {
            await this.ticketService.update(ticketId, data);
            const updatedTicket = await this.ticketService.get(ticketId);
            this.tickets = this.tickets.map((t) =>
              t.id === ticketId ? updatedTicket : t,
            );
            this.renderTickets();
          },
          {
            isEdit: true,
            title: "Изменить тикет",
            initialData: ticket,
            submitText: "Ok",
          },
        );
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
      const ticket = this.tickets.find((t) => t.id === ticketId);
      if (!ticket) return;

      const updatedStatus = !ticket.status; // Переключаем статус
      await this.ticketService.update(ticketId, {
        ...ticket,
        status: updatedStatus,
      });

      // Обновляем локальный массив тикетов
      this.tickets = this.tickets.map((t) =>
        t.id === ticketId ? { ...t, status: updatedStatus } : t,
      );

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
