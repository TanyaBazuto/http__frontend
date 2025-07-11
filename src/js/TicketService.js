/**
 *  Класс для связи с сервером.
 *  Содержит методы для отправки запросов на сервер и получения ответов
 * */
import createRequest from "./api/createRequest";

export default class TicketService {
  async list() {
    return await createRequest({ method: "allTickets" });
  }

  async get(id) {
    return await createRequest({ method: "ticketById", id });
  }

  async create(data) {
    return await createRequest({ method: "createTicket", data });
  }

  async update(id, data) {
    return await createRequest({ method: "updateById", id, data });
  }

  async delete(id) {
    return await createRequest({ method: "deleteById", id });
  }
}
