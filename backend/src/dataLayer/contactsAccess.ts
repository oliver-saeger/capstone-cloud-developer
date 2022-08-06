import * as AWS from 'aws-sdk'
import { createLogger } from '../utils/logger'
import { ContactItem } from '../models/ContactItem'
import {ContactUpdate} from "../models/ContactUpdate";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import UpdateItemInput = DocumentClient.UpdateItemInput;
import QueryInput = DocumentClient.QueryInput;
import PutItemInput = DocumentClient.PutItemInput;
import DeleteItemInput = DocumentClient.DeleteItemInput;

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('contactsAccess')

const dbClient: DocumentClient = new XAWS.DynamoDB.DocumentClient();
const contactsTable = process.env.CONTACTS_TABLE

export async function getContactItemsPerUser(userId: string): Promise<ContactItem[]> {
  logger.info("Getting all contacts for user: " + userId)

  const params: QueryInput = {
    TableName: contactsTable,
    IndexName: process.env.CONTACTS_CREATED_AT_INDEX,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  }

  const result = await dbClient.query(params).promise()
  const contactItems = result.Items as ContactItem[]
  logger.info("Returning contacts: " + contactItems)
  return contactItems
}

export async function createContactItem(contactItem: ContactItem): Promise<ContactItem> {
  const params : PutItemInput = {
    TableName: contactsTable,
    Item: contactItem
  }

  await dbClient.put(params).promise()
  return contactItem
}

export async function updateContactItem(userId: string, contactId: string, contactUpdate: ContactUpdate): Promise<ContactItem> {
  const params: UpdateItemInput = {
    TableName: contactsTable,
    Key: {
      userId: userId,
      contactId: contactId
    },
    ExpressionAttributeNames: {
      "#N": "name"
    },
    UpdateExpression: "set #N = :contactName, phoneNumber = :phoneNumber",
    ExpressionAttributeValues: {
      ":contactName": contactUpdate.name,
      ":phoneNumber": contactUpdate.phoneNumber
    },
    ReturnValues: "ALL_NEW"
  }

  const updatedItem = await dbClient.update(params).promise()
  return updatedItem.Attributes as ContactItem
}

export async function deleteContactItem(userId: string, contactId: string): Promise<void> {
  const params: DeleteItemInput = {
    TableName: contactsTable,
    Key: {
      userId: userId,
      contactId: contactId
    }
  }

  await dbClient.delete(params).promise()
}

export async function updateAttachmentUrl(userId: string, contactId: string, attachmentUrl: string): Promise<void> {
  await dbClient.update({
    TableName: contactsTable,
    Key: {
      userId,
      contactId: contactId
    },
    UpdateExpression: 'set attachmentUrl = :attachmentUrl',
    ExpressionAttributeValues: {
      ':attachmentUrl': attachmentUrl
    }
  }).promise()
}
