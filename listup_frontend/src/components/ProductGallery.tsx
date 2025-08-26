"use client";
import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images }: { images: string[] }) {
  const [selected, setSelected] = useState(images[0]);

  return (
    <div>
      <div className="relative w-full h-[400px] bg-gray-100 rounded-xl overflow-hidden">
        <Image src={selected} alt="Product" fill className="object-cover" />
      </div>
      <div className="flex gap-2 mt-3 overflow-x-auto">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelected(img)}
            className={`w-20 h-20 relative rounded-lg border ${
              selected === img ? "border-indigo-600" : "border-gray-200"
            }`}
          >
            <Image src={img} alt="thumb" fill className="object-cover rounded-lg" />
          </button>
        ))}
      </div>
    </div>
  );
}
