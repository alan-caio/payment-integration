const httpStatus = require('http-status');
const formatErrorResponse = require('../../express/responses/formatError');
const formatSuccessResponse = require('../../express/responses/formatSuccess');
const { update } = require('../operations');

const updateHandler = async (req, res) => {
  try {
    const doc = await update({
      req,
      Model: req.collection.Model,
      config: req.collection.config,
      id: req.params.id,
      data: req.body,
    });

    return res.status(httpStatus.OK).json({
      ...formatSuccessResponse('Updated successfully.', 'message'),
      doc,
    });
  } catch (error) {
    return res.status(error.status || httpStatus.INTERNAL_SERVER_ERROR).json(formatErrorResponse(error));
  }
};

module.exports = updateHandler;
