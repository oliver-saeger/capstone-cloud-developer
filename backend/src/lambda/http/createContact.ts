import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateContactRequest } from '../../requests/CreateContactRequest'
import { getUserId } from '../utils';
import { createContact } from '../../businessLogic/contacts'
import { createLogger } from "../../utils/logger";

const logger = createLogger('contacts')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("Create Contact event: " + JSON.stringify(event))
    const createContactRequest: CreateContactRequest = JSON.parse(event.body)
    const userId = getUserId(event);

    const newContactItem = await createContact(userId, createContactRequest)
    logger.info("New contact item: " + JSON.stringify(newContactItem))

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: newContactItem
      })
    }
  })

handler.use(
  cors({
    credentials: true
  })
)
