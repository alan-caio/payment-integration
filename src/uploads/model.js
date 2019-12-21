import mongoose from 'mongoose';
import buildQueryPlugin from '../mongoose/buildQuery';
import paginate from '../mongoose/paginate';
import localizationPlugin from '../localization/plugin';

const uploadModelLoader = (config) => {

  const UploadSchema = new mongoose.Schema({
    filename: { type: String },
  }, {
    timestamps: true,
    discriminatorKey: 'type'
  });

  UploadSchema.plugin(paginate);
  UploadSchema.plugin(buildQueryPlugin);
  UploadSchema.plugin(localizationPlugin, config.localization);

  return mongoose.model('Upload', UploadSchema);
};

export default uploadModelLoader;