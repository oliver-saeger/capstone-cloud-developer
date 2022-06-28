import { apiEndpoint } from '../config'
import { Todo } from '../types/Todo';
import { CreateTodoRequest } from '../types/CreateTodoRequest';
import Axios from 'axios'
import { UpdateTodoRequest } from '../types/UpdateTodoRequest';
import {Contact} from "../types/Contact";
import {CreateContactRequest} from "../types/CreateContactRequest";

export async function getTodos(idToken: string): Promise<Todo[]> {
  console.log('Fetching todos')

  const response = await Axios.get(`${apiEndpoint}/todos`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Todos:', response.data)
  return response.data.items
}

export async function createTodo(
  idToken: string,
  newTodo: CreateTodoRequest
): Promise<Todo> {
  const response = await Axios.post(`${apiEndpoint}/todos`,  JSON.stringify(newTodo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchTodo(
  idToken: string,
  todoId: string,
  updatedTodo: UpdateTodoRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/todos/${todoId}`, JSON.stringify(updatedTodo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteTodo(
  idToken: string,
  todoId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/todos/${todoId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  contactId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/contacts/${contactId}/picture`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}

export async function createContact(
  idToken: string,
  newContact: CreateContactRequest
): Promise<Contact> {
  const response = await Axios.post(`${apiEndpoint}/contacts`,  JSON.stringify(newContact), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function deleteContact(idToken: string, contactId: string): Promise<void> {
  await Axios.delete(`${apiEndpoint}/contacts/${contactId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getContacts(idToken: string): Promise<Contact[]> {
  console.log('Fetching contacts')

  const response = await Axios.get(`${apiEndpoint}/contacts`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Contacts:', response.data)
  return response.data.items
}

export async function getMockContacts(idToken: string): Promise<Contact[]> {
  console.log('Fetching contacts')

  const contacts: Contact[] = []

  for (let i = 0; i < 5; i++) {
    const contact: Contact = {
      contactId: i.toString(),
      name:'Peter Parker',
      phone:'01234 567890',
      createdAt:'2022-06-28',
      pictureUrl:'https://www.parisbeacon.com/wp-content/uploads/2022/03/Spider-Man-No-Way-Home-traje-final.jpg'
    }

    contacts.push(contact)
  }

  return contacts
}
