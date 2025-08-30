// This file contains the API functions for the clients (CRUD); interacts with the backend

// Import the axios library, a promise-based HTTP client
import api from "./axios";

// define the structure of a client 
export type Client = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
};

// structure for basic pagination
export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

export type ListClientsQuery = { page?: number; limit?: number; q?: string };

export async function listClients(params: ListClientsQuery = {}): Promise<Paginated<Client>> {
  // data retreived from GET request sent to the backend API
  const { data } = await api.get('/api/clients', { params });

  console.log('listClients(): data = \n', data);

  // Response structure: { message: string, clients: Client[] }
  if (Array.isArray(data.clients)) {
    const items = data.clients;
    return {
      items,
      page: params.page ?? 1,
      limit: params.limit ?? items.length,
      total: items.length,
    };
  }

  // fallback in case shape changes
  return { items: [], page: 1, limit: 10, total: 0 };
}

export type CreateClientInput = { name: string; email: string; phone?: string };
export async function createClient(
  payload: CreateClientInput
): Promise<Client> {
  const { data } = await api.post("/api/clients", payload);
  return data;
}


// My application does not retreive a client by its id
export async function getClient(id: number): Promise<Client> {
  const { data } = await api.get(`/api/clients/${id}`);
  return data;
}




export type UpdateClientInput = {
  name?: string;
  email?: string;
  phone?: string;
};
export async function updateClient(
  id: number,
  payload: UpdateClientInput
): Promise<Client> {
  const { data } = await api.patch(`/api/clients/${id}`, payload);
  return data;
}


