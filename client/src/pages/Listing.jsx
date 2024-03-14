import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import Contact from "../components/Contact";
// https://sabe.io/blog/javascript-format-numbers-commas#:~:text=The%20best%20way%20to%20format,format%20the%20number%20with%20commas.

export default function Listing() {
  const params = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [contact, setContact] = useState(false);
  const [showOTPmenu, setShowOTPmenu] = useState(false);
  const [OTP, setOTP] = useState(0);
  const [clientOTP, setClientOTP] = useState(0);
  SwiperCore.use([Navigation]);
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${params.listingId}`);

        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);
        loading(false);
        setError(false);
      } catch (error) {
        setError(false);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  const getOTP = async() => {
    try {
      const res = await fetch(`/api/listing/getOTP`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ownerEmail : listing.userRef, clientEmail: currentUser.email})
      })
      const data = await res.json()
      if (data.success === false) {
        console.log(data)
        return;
      }
      setOTP(data)
    } catch (error) {
      console.log(error)
    }
  }

  const handlePayment = async() => {
    try {
      if (OTP == clientOTP) {
          const ans = confirm('Make payment?')
          if (ans) {
            const res = await fetch(`/api/listing/makepayment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({listingId : listing._id, ownerId: listing.userRef, amount: listing.offer ? listing.discountPrice : listing.regularPrice, clientEmail: currentUser.email})
            })
            const data = await res.json()
            if (data.success === false) {
              console.log(data)
              return;
            }
            alert('Payment successful')
            setShowOTPmenu(false)
            console.log(data)
          }else {
            setShowOTPmenu(false)
          }
        }else {
          alert('Invalid OTP...try again!')
        }
      }catch (error) {
      console.log(error)
    }
  }
  return (
    <main>
      {loading && <p className="text-center my-7 text-2xl">Loading...</p>}
      {error && (
        <p className="text-center my-7 text-2xl text-red-700">
          something went wrong
        </p>
      )}
      {listing && !loading && !error && (
        <div>
          <Swiper navigation>
            {listing.imageUrls.map((url) => (
              <SwiperSlide key={url}>
                <div
                  className="h-[550px]"
                  style={{
                    background: `url(${url}) center no-repeat`,
                    backgroundSize: "cover",
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer">
            <FaShare
              className="text-slate-500"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}
            />
          </div>
          {copied && (
            <p className="fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2">
              Link copied!
            </p>
          )}
          <div className="flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4">
            <p className="text-2xl font-semibold">
              {listing.name} - ${" "}
              {listing.offer
                ? listing.discountPrice.toLocaleString("en-US")
                : listing.regularPrice.toLocaleString("en-US")}
              {listing.type === "rent" && " / month"}
            </p>
            <p className="flex items-center mt-6 gap-2 text-slate-600  text-sm">
              <FaMapMarkerAlt className="text-green-700" />
              {listing.address}
            </p>
            <div className="flex gap-4">
              <p className="bg-red-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                {listing.type === "rent" ? "For Rent" : "For Sale"}
              </p>
              <p className="bg-red-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                {listing.lease
                  ? `For Lease ( ${listing.leasePeriod} year/s )`
                  : "No Lease"}
              </p>
              {listing.offer && (
                <p className="bg-green-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                  ${+listing.regularPrice - +listing.discountPrice}
                </p>
              )}
            </div>
            <p className="text-slate-800">
              <span className="font-semibold text-black">Description - </span>
              {listing.description}
            </p>
            <ul className="text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6">
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaBed className="text-lg" />
                {listing.bedrooms > 1
                  ? `${listing.bedrooms} beds `
                  : `${listing.bedrooms} bed `}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaBath className="text-lg" />
                {listing.bathrooms > 1
                  ? `${listing.bathrooms} baths `
                  : `${listing.bathrooms} bath `}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaParking className="text-lg" />
                {listing.parking ? "Parking spot" : "No Parking"}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaChair className="text-lg" />
                {listing.furnished ? "Furnished" : "Unfurnished"}
              </li>
            </ul>
            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <button
                onClick={() => setContact(true)}
                className="bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 p-3"
              >
                Contact LandLord
              </button>
            )}
            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <button disabled={listing.isSold ? true : false} className="bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 p-3" onClick={() => setShowOTPmenu(true)}>
                {listing.isSold ? `Bought by : ${currentUser.username}` : "Buy Now"}
              </button>
            )}
            {showOTPmenu && (
              <div className="z-20 absolute w-1/2 h-fit bg-slate-700 top-1/2 left-1/2 rounded-lg p-5" style={{transform: 'translate(-50%, -50%)'}}>
                <div className="flex flex-row justify-between align-middle w-full mb-5">
                  <button className="bg-slate-500 w-fit h-fit text-white rounded-lg uppercase hover:opacity-95 p-3" onClick={() => getOTP()}>get OTP</button>
                  <button className="bg-slate-500 w-fit h-fit text-white rounded-lg uppercase hover:opacity-95 p-3" onClick={() => setShowOTPmenu(false)}>Close</button>
                </div>
                <div className="flex flex-row justify-center">
                <input className="bg-slate-300 w-fit h-fit text-white rounded-lg uppercase hover:opacity-95 p-3 mr-4" placeholder="OTP" type="text" onChange={(e) => {
                  const re = /^[0-9.\b]+$/;
                  if (!re.test(e.target.value)) {
                    e.target.value = e.target.value.slice(0, -1);
                    alert('Please enter a valid OTP')
                  }
                  else {
                    setClientOTP(e.target.value)
                  }
                }}/>
                <button className="bg-slate-500 w-fit h-fit text-white rounded-lg uppercase hover:opacity-95 p-3" onClick={() => {handlePayment()}}>Pay</button>
                </div>
              </div>
            )}
            {contact && <Contact listing={listing} />}
          </div>
        </div>
      )}
    </main>
  );
}
