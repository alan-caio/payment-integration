import httpStatus from 'http-status';
import { Response } from 'express';
import { Logger } from 'pino';
import { Config } from '../../config/types';
import formatErrorResponse, { ErrorResponse } from '../responses/formatError';
import { PayloadRequest } from '../types/payloadRequest';
import APIError from '../../errors/APIError';

export type ErrorHandler = (err: Error, req: PayloadRequest, res: Response) => Promise<Response<ErrorResponse> | void>

// NextFunction must be passed for Express to use this middleware as error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (config: Config, logger: Logger) => async (err: APIError, req: PayloadRequest, res: Response): Promise<void> => {
  let response = formatErrorResponse(err);
  let status = err.status || httpStatus.INTERNAL_SERVER_ERROR;

  logger.error(err.stack);

  if (config.debug && config.debug === true) {
    response.stack = err.stack;
  }

  if (req.collection && typeof req.collection.config.hooks.afterError === 'function') {
    ({ response, status } = await req.collection.config.hooks.afterError(err, response) || { response, status });
  }

  if (typeof config.hooks.afterError === 'function') {
    ({ response, status } = await config.hooks.afterError(err, response) || { response, status });
  }

  res.status(status).send(response);
};

export default errorHandler;
