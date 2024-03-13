import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";
import sendEmail from "../utils/sendEmail.js";

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return next(errorHandler(404, "Listing not found"));

  if (req.user.id !== listing.userRef)
    return next(errorHandler(401, "you can only delete your own listings"));

  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json("deleted!");
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  console.log("HII");
  const listing = await Listing.findById(req.params.id);
  if (!listing) return next(errorHandler(404, "Listing not found"));

  if (req.user.id !== listing.userRef)
    return next(errorHandler(401, "you can only update your own listings"));

  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(errorHandler(404, "Listing not found"));

    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    let offer = req.query.offer;
    if (offer === undefined || offer === "false") {
      offer = { $in: [false, true] };
    }

    let furnished = req.query.furnished;
    if (furnished === undefined || furnished === "false") {
      furnished = { $in: [false, true] };
    }

    let parking = req.query.parking;
    if (parking === undefined || parking === "false") {
      parking = { $in: [false, true] };
    }

    let type = req.query.type;
    if (type === undefined || type === "all") {
      type = { $in: ["sale", "rent"] };
    }

    let lease = req.query.lease;
    if (lease === undefined || lease === "false") {
      lease = { $in: [false, true] };
    }

    const searchTerm = req.query.searchTerm || "";

    const sort = req.query.sort || "createdAt";

    const order = req.query.order || "desc";

    const listings = await Listing.find({
      name: { $regex: searchTerm, $options: "i" },
      offer,
      furnished,
      parking,
      type,
      lease,
    })
      .sort({
        [sort]: order,
      })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

export const sendOTP = async (req, res, next) => {
  const { ownerEmail, clientEmail } = req.body;
  const otp = generateOTP();
  try{
    await sendEmail({
      from: ownerEmail,
      to: clientEmail,
      subject: "OTP for verification",
      text: `Your OTP is ${otp}`,
    });
    res.status(200).json(otp);
  }
  catch (error) {
    next(error);
  }
}



export const makePayment = async (req, res, next) => {
  const { listingId, amount, ownerId } = req.body;

  try {
    const listing = await Listing.findById(listingId);
    if (!listing) return next(errorHandler(404, "Listing not found"));

    if (listing.isSold) return next(errorHandler(400, "Listing is already sold"));

    listing.isSold = true;
    listing.save();

    
    const owner = await User.findById(ownerId);
    owner.totalAmount += amount * 0.02;
    owner.save();
    res.status(200).json("Payment successful");

  }catch (error) {
    next(error);
  }
}; 
