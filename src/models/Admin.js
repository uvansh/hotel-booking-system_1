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

// Create the model directly instead of using a function
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

export default Admin; 