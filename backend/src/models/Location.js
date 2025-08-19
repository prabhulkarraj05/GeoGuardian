const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  accuracy: {
    type: Number,
    default: null
  },
  speed: {
    type: Number,
    default: null
  },
  heading: {
    type: Number,
    default: null
  },
  altitude: {
    type: Number,
    default: null
  },
  battery: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  address: {
    type: String,
    default: null
  },
  city: {
    type: String,
    default: null
  },
  country: {
    type: String,
    default: null
  },
  isManual: {
    type: Boolean,
    default: false
  },
  deviceInfo: {
    userAgent: String,
    platform: String,
    appVersion: String
  }
}, {
  timestamps: true
});

// GeoJSON index for location queries
locationSchema.index({ coordinates: '2dsphere' });

// Index for efficient user location queries
locationSchema.index({ user: 1, createdAt: -1 });

// TTL index to automatically delete old location data (30 days)
locationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Location', locationSchema);
