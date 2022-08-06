import {apiEndpoint} from '../config'
import Axios from 'axios'
import {UpdateContactRequest} from '../types/UpdateContactRequest';
import {Contact} from "../types/Contact";
import {CreateContactRequest} from "../types/CreateContactRequest";

export async function patchContact(
  idToken: string,
  contactId: string,
  updatedContact: UpdateContactRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/contacts/${contactId}`, JSON.stringify(updatedContact), {
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
  const response = await Axios.post(`${apiEndpoint}/contacts/${contactId}/attachment`, '', {
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

export async function getContactById(idToken: string, contactId: string): Promise<Contact> {
  console.log('Fetching contact with id:' + contactId)

  const response = await Axios.get(`${apiEndpoint}/contacts/${contactId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Contact:', response.data)
  return response.data.items
}

export async function getMockContactById(contactId: string): Promise<Contact> {
  return {
    contactId: contactId,
    name: 'Peter Parker',
    phoneNumber: '01234 567890',
    createdAt: '2022-06-28',
    attachmentUrl: 'https://www.parisbeacon.com/wp-content/uploads/2022/03/Spider-Man-No-Way-Home-traje-final.jpg'
  };
}

export async function getMockContacts(): Promise<Contact[]> {
  console.log('Fetching contacts')

  const contacts: Contact[] = []

  for (let i = 0; i < 5; i++) {
    const contact: Contact = {
      contactId: i.toString(),
      name:'Peter Parker',
      phoneNumber:'01234 567890',
      createdAt:'2022-06-28',
      attachmentUrl:'https://www.parisbeacon.com/wp-content/uploads/2022/03/Spider-Man-No-Way-Home-traje-final.jpg'
    }

    contacts.push(contact)
  }

  return contacts
}
