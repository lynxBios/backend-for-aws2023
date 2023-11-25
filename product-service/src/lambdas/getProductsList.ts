import { buildResponse } from "./utils";
//import { APIGatewayEvent } from "aws-lambda";
import { findAll } from "../services/productsService";

export const handler = async () => {
  try {
    return buildResponse({ statusCode: 200, body: findAll() });
  } catch (error: any) {
    return buildResponse({ statusCode: 500, body: { message: error.message || "" }});
  }
};
