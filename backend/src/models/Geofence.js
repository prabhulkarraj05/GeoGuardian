const mongoose = require('mongoose');

const geofenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Geofence name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  geometry: {
    type: {
      type: String,
      enum: ['Polygon', 'Circle'],
      required: true
    },
    // For circles: center point [longitude, latitude] and radius
    center: {
      type: [Number], // [longitude, latitude]
      required: function() {
        return this.geometry.type === 'Circle';
      }
    },
    radius: {
      type: Number, // in meters
      required: function() {
        return this.geometry.type === 'Circle';
      },
      min: [1, 'Radius must be at least 1 meter'],
      max: [50000, 'Radius cannot exceed 50km']
    },
    // For polygons: array of coordinates
    coordinates: {
      type: [[[Number]]], // GeoJSON polygon format
      required: function() {
        return this.geometry.type === 'Polygon';
      }
    }
  },
  alertSettings: {
    onEnter: {
      type: Boolean,
      default: true
    },
    onExit: {
      type: Boolean,
      default: true
    },
    notifyGuardians: {
      type: Boolean,
      default: true
    },
    notifyUser: {
      type: Boolean,
      default: false
    }
  },
  schedule: {
    isActive: {
      type: Boolean,
      default: true
    },
    activeHours: {
      start: {
        type: String, // Format: "HH:MM"
        default: "00:00"
      },
      end: {
        type: String, // Format: "HH:MM"
        default: "23:59"
      }
    },
    activeDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for geospatial queries
geofenceSchema.index({ 'geometry.center': '2dsphere' });
geofenceSchema.index({ creator: 1, isActive: 1 });

module.exports = mongoose.model('Geofence', geofenceSchema);
