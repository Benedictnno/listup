"use client";
import React from "react";
import Image from "next/image";
import { FaPhoneAlt } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
interface ProductInfoProps {
  listing: {
    id: string;
    title: string;
    price: number;
    images: string[];
    location: string;
    createdAt: string;
    category: { id: string; name: string; slug: string };
    seller: { id: string; name: string };
    condition:string,
    description:string,
    
  };
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  listing: { title, price, location, seller, images ,condition
},
}) => {
  return (
    <div className="w-full lg:w-3/4 bg-white rounded-xl shadow-sm p-6">
      {/* Product Images */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* <div className="relative h-72 md:h-96 rounded-lg overflow-hidden"> */}
          {/* <Image
            src={images[0]}
            alt={title}
            sizes=""
            fill
            className="object-cover"
          /> */}
        {/* </div> */}
        <div className="grid grid-cols-2 gap-2">
          {images.slice(1, 5).map((img, idx) => (
            <div
              key={idx}
              className="relative h-36 rounded-lg overflow-hidden"
            >
              <Image
                src={img}
                alt={`${title}-${idx}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {images.slice(1, 5).map((img, idx) => (
            <div
              key={idx}
              className="relative h-36 rounded-lg overflow-hidden"
            >
              <Image
                src={img}
                alt={`${title}-${idx}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Product Details */}
      <div className="mt-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-3xl font-semibold text-green-600 mt-2">
          ₦{price.toLocaleString()}
        </p>

        <div className="flex items-center mt-3 space-x-3 text-gray-500">
          <MdLocationOn />
          <span>{location}</span>
        </div>

        {/* <p className="mt-4 text-gray-700 leading-relaxed">{description}</p> */}

        {/* Seller Info */}
        <div className="mt-6 border-t pt-4">
          <p className="text-gray-600 text-sm">Seller</p>
          <p className="font-medium">{seller.name}</p>
          <button className="mt-3 flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg">
            <FaPhoneAlt /> <span>Show Contact</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
