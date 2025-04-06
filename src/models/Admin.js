import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Create a function to get the Admin model
const getAdminModel = () => {
  if (mongoose.models.Admin) {
    return mongoose.models.Admin;
  }
  return mongoose.model('Admin', adminSchema);
};

export default getAdminModel; 