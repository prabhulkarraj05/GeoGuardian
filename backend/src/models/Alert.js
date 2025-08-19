const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['sos', 'geofence_enter', 'geofence_exit', 'low_battery', 'speed_limit', 'panic', 'custom'],
    index: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  location: {
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
  address: {
    type: String,
    default: null
  },
  // Related entities
  geofence: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Geofence',
    default: null
  },
  // Recipients (guardians who should receive this alert)
  recipients: [{
    guardian: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notificationMethod: {
      type: String,
      enum: ['sms', 'email', 'push', 'call'],
      default: 'sms'
    },
    sentAt: {
      type: Date,
      default: null
    },
    deliveredAt: {
      type: Date,
      default: null
    },
    acknowledgedAt: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed', 'acknowledged'],
      default: 'pending'
    }
  }],
  // Alert lifecycle
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved', 'dismissed'],
    default: 'active',
    index: true
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  // Auto-resolution settings
  autoResolve: {
    type: Boolean,
    default: false
  },
  resolveAfter: {
    type: Number, // minutes
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Additional data based on alert type
  metadata: {
    batteryLevel: Number,
    speed: Number,
    sosMethod: {
      type: String,
      enum: ['button', 'voice', 'gesture', 'automatic']
    },
    deviceInfo: {
      userAgent: String,
      platform: String
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
alertSchema.index({ user: 1, createdAt: -1 });
alertSchema.index({ status: 1, createdAt: -1 });
alertSchema.index({ type: 1, severity: 1 });
alertSchema.index({ location: '2dsphere' });

// Auto-resolve alerts after specified time
alertSchema.methods.checkAutoResolve = function() {
  if (this.autoResolve && this.resolveAfter && this.status === 'active') {
    const resolveTime = new Date(this.createdAt.getTime() + (this.resolveAfter * 60 * 1000));
    if (new Date() > resolveTime) {
      this.status = 'resolved';
      this.resolvedAt = new Date();
      return this.save();
    }
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model('Alert', alertSchema);
