import { buildResponse } from "./utils";

export const handler = async (event: any) => {
  try {
    //console.log("Event fom Get Products List Lambda: ", event)

    return buildResponse( statusCode: 200, body: {
      products: [],
    });
  } catch (error) {
    return buildResponse( statusCode: 500, body: {
      message: error.message,
    });
  }
};