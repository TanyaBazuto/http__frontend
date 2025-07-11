/**
 *  Класс для отображения тикетов на странице.
 *  Он содержит методы для генерации разметки тикета.
 * */

export default class TicketView {
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
    date.textContent = `${createdDate.toLocaleDateString("ru-RU")} ${createdDate.toLocaleTimeString(
      "ru-RU",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    )}`;

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
