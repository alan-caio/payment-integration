module.exports = {
  slug: 'categories',
  labels: {
    singular: 'Category',
    plural: 'Categories',
  },
  useAsTitle: 'title',
  policies: {
    create: (req, res, next) => {
      return next();
    },
    read: (req, res, next) => {
      return next();
    },
    update: (req, res, next) => {
      return next();
    },
    destroy: (req, res, next) => {
      return next();
    },
  },
  fields: [
    {
      name: 'title',
      label: 'Category Title',
      type: 'input',
      maxLength: 100,
      required: true,
      unique: false,
      localized: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      height: 100,
      required: true,
      localized: true,
    },
  ],
  timestamps: true,
};
