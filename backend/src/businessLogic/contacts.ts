import {
  createContactItem,
  deleteContactItem,
  getContactItemsPerUser,
  updateAttachmentUrl,
  updateContactItem
} from '../dataLayer/contactsAccess'
import { getAttachmentBucketUrl, createAttachmentPresignedUrl } from '../helpers/attachmentUtils';
import { ContactItem } from '../models/ContactItem'
import { CreateContactRequest } from '../requests/CreateContactRequest'
import { UpdateContactRequest } from '../requests/UpdateContactRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const logger = createLogger('contacts')

export async function getAllContactsForUser(userId: string): Promise<ContactItem[]> {
  return getContactItemsPerUser(userId)
}

export async function createContact(userId: string, createContactRequest: CreateContactRequest): Promise<ContactItem> {
  const contactId = uuid.v4();

  const newContactItem: ContactItem = {
    contactId: contactId,
    userId: userId,
    createdAt: new Date().toISOString(),
    ...createContactRequest
  }

  logger.info('Storing new contact item: ' + newContactItem)
  return createContactItem(newContactItem);
}

export async function updateContact(userId: string, contactId: string, updateContactRequest: UpdateContactRequest): Promise<ContactItem> {
  logger.info('Update contact item: ', {userId: userId, contactId: contactId, updateContactRequest: updateContactRequest})
  return updateContactItem(userId, contactId, updateContactRequest);
}

export async function deleteContact(userId: string, contactId: string): Promise<void> {
  logger.info('Delete contact item: ', {userId: userId, contactId: contactId})
  return deleteContactItem(userId, contactId)
}

export async function createUploadUrl(attachmentId: string): Promise<string> {
  logger.info('Create new pre-signed upload url for contactId: ' + attachmentId)
  const url = createAttachmentPresignedUrl(attachmentId)
  logger.info("Upload URL: " + url)
  return url;
}

export async function addAttachmentToContact(userId: string, contactId: string, attachmentId: string): Promise<void> {
  const attachmentUrl = getAttachmentBucketUrl(attachmentId);
  logger.info('Get attachment URL: ' + attachmentUrl)
  await updateAttachmentUrl(userId, contactId, attachmentUrl)
}