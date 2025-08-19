const mongoose = require('mongoose');

const guardianSchema = new mongoose.Schema({
  guardian: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relationship: {
    type: String,
    required: true,
    enum: ['parent', 'child', 'spouse', 'sibling', 'friend', 'caregiver', 'colleague', 'other']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'blocked'],
    default: 'pending'
  },
  permissions: {
    viewLocation: {
      type: Boolean,
      default: true
    },
    receiveAlerts: {
      type: Boolean,
      default: true
    },
    createGeofences: {
      type: Boolean,
      default: true
    },
    sendMessages: {
      type: Boolean,
      default: true
    }
  },
  invitedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate relationships
guardianSchema.index({ guardian: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Guardian', guardianSchema);
