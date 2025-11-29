import React from "react";
import Image from "next/image";

interface ItemCardProps {
  name?: string;
  subname?: string;
  image?: string;
}

const ItemCard = ({ name = "Name", subname = "Subname", image }: ItemCardProps) => {
  return (
    <div className="flex w-full h-32 border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
      {/* Left: Photo */}
      <div className="w-1/3 bg-black text-white flex items-center justify-center border-r-2 border-black relative overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 33vw, 200px"
          />
        ) : (
          <span className="font-mono text-xs text-gray-400">&lt;Photo&gt;</span>
        )}
      </div>

      {/* Right: Content */}
      <div className="w-2/3 p-4 flex flex-col justify-center">
        <h3 className="font-black text-lg leading-tight">{name}</h3>
        <p className="font-mono text-sm text-gray-500 mt-1">{subname}</p>
      </div>
    </div>
  );
};

export default ItemCard;
