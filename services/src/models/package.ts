import mongoose from 'mongoose';

interface PackageAttrs {
  name: string;
  description: string;
  salePrice?: number;
  featured?: boolean;
  discount?: number;
  isDeleted?: boolean;
}
interface PackageDoc extends mongoose.Document {
  name: string;
  description: string;
  salePrice?: number;
  featured?: boolean;
  discount?: number;
  isDeleted?: boolean;
  version: number;
}
interface PackageModel extends mongoose.Model<PackageDoc> {
  build(attrs: PackageAttrs): PackageDoc;
}

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  salePrice: {
    type: Number,
    required: true,
  },
});
