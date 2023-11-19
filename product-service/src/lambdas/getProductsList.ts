import { buildResponse } from "./utils";
import { APIGatewayEvent } from "aws-lambda";
import { products } from "./mocks";

export const handler = async (event: APIGatewayEvent) => {
  try {
    //console.log("Event fom Get Products List Lambda: ", event)

    return buildResponse({ statusCode: 200, body: products });
  } catch (error: any) {
    return buildResponse({ statusCode: 500, body: { message: error.message || "" }});
  }
};