const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // copy req.query
  const reqQuery = { ...req.query };

  // fields to exclude - don't want to be matched on filtering
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // loop over removeFields and delete select from the reQuery parameters
  removeFields.forEach((param) => delete reqQuery[param]);

  // create query string
  let queryStr = JSON.stringify(reqQuery);

  // create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // finding resource
  query = model.find(JSON.parse(queryStr));

  // select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // pagination - comes in as a string, we want an integer
  const page = parseInt(req.query.page, 10) || 1;
  // 10 resources per page
  const limit = parseInt(req.query.limit, 10) || 25;
  // startIndex
  const startIndex = (page - 1) * limit;
  // endIndex
  const endIndex = page * limit;
  // total amount of resorces
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // populate
  if (populate) {
    query = query.populate(populate);
  }

  // executing query
  const results = await query;

  // pagination result
  const pagination = {};

  // if we don't have a previous or last page, don't show them
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit: limit,
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
