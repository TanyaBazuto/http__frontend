// const createRequest = async (options = {}) => {};

export default async function createRequest({ method, id, data }) {
  const url = new URL("http://localhost:7070/");
  url.searchParams.set("method", method);
  if (id) url.searchParams.set("id", id);

  const options = {
    method: data ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : null,
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
