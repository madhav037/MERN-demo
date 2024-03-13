import mongoose from "mongoose";

const listingSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    regularPrice: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    furnished: {
      type: Boolean,
      required: true,
    },
    parking: {
      type: Boolean,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    offer: {
      type: Boolean,
      required: true,
    },
    imageUrls: {
      type: Array,
      required: true,
    },
    lease : {
      type: Boolean,
      required: true,
      default : false
    },
    leasePeriod : {
      type: Number,
      required: false,
      default : 0
    },
    isSold: {
      type: Boolean,
      required: true,
      default: false,
    },
    userRef: {
      type: String,
      required: true,
    },
  },
  { timeStamps: true }
);

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
