import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getAllContactsForUser } from '../../businessLogic/contacts'
import { getUserId } from '../utils';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);
    const contacts = await getAllContactsForUser(userId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: contacts
      })
    }
})

handler.use(
  cors({
    credentials: true
  })
)
