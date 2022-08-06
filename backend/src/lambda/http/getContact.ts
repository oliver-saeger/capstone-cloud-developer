import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import {getContactForUserWithContactId} from '../../businessLogic/contacts'
import { getUserId } from '../utils';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);
    const contactId = event.pathParameters.contactId

    const contact = await getContactForUserWithContactId(userId, contactId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        item: contact
      })
    }
  })

handler.use(
  cors({
    credentials: true
  })
)