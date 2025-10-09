import { CommentType } from "@/src/lib/type";
import { Star } from "lucide-react";
import React from "react";

export default function CommentCard({ comment, name, job }: CommentType) {
  return (
    <div className="bg-indigo-800 rounded-xl p-8">
      <div className="flex mb-4">
        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
      </div>
      <p className="text-indigo-100 mb-4">{comment}</p>
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full mr-3 text-indigo-500"></div>
        <div>
          <h3 className="font-medium">{name}</h3>
          <p className="text-indigo-300 text-sm">{job}</p>
        </div>
      </div>
    </div>
  );
}
