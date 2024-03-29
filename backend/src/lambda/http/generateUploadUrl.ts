import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import * as uuid from 'uuid'

import { createUploadUrl, addAttachmentToContact } from '../../businessLogic/contacts'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const contactId = event.pathParameters.contactId
    const userId = getUserId(event)
    const attachmentId = uuid.v4();

    const uploadUrl = await createUploadUrl(attachmentId)
    await addAttachmentToContact(userId, contactId, attachmentId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: uploadUrl
      }),
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
