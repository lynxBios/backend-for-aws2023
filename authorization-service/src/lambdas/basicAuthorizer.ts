import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import * as base64 from 'base-64';
import { config } from 'dotenv';

config();

// export const headers = {
//   "Access-Control-Allow-Credentials": true,
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers": "*",
// };

export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
    console.log('BasicAuthorizer:', JSON.stringify(event));
    
    const token = event.authorizationToken;

    if (!token) {
      console.log('No Authorization header provided');
      throw new Error('Unauthorized');
    }

    const generatePolicy = (
      principalId: string,
      effect: 'Allow' | 'Deny',
      resource: string
    ): APIGatewayAuthorizerResult => {
      return {
        principalId,
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Action: 'execute-api:Invoke',
              Effect: effect,
              Resource: resource,
            },
          ],
        },
      };
    };
    const authType = event.authorizationToken.split(' ')[0];
    const encodedToken = event.authorizationToken.split(' ')[1];  
    
    if (authType !== 'Basic' || !encodedToken) {
      return generatePolicy(token, 'Deny', event.methodArn);
    }

    const [username, password] = Buffer.from(encodedToken, 'base64')
      .toString('utf8')
      .split(':');

    const storedPassword = process.env[username.toLowerCase()];

    const effect =
      storedPassword && storedPassword === password ? 'Allow' : 'Deny';

    const policy = generatePolicy(token, effect, event.methodArn);
    return policy;
  } catch (err: unknown) {
    const error = err as Error;
    console.error('An error occurred:', error.message);
    throw new Error('Unauthorized');
  }
};
