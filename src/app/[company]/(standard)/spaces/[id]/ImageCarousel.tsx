"use client";
import React from "react";
import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext,
} from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";
import Image from "next/image";
export default function ImageCarousel({
  imagesList,
  officeName,
}: {
  imagesList: string[];
  officeName: string;
}) {
  return (
    <div className="w-full h-full ">
      <CarouselProvider
        naturalSlideWidth={992}
        naturalSlideHeight={605}
        totalSlides={imagesList.length}
        isPlaying
        interval={3000}
        infinite
        className="w-full h-full"
      >
        <Slider className="w-full h-full cCarousel">
          {imagesList.map((image, i) => (
            <Slide index={i} key={i} className="h-full w-full">
              <Image
                src={image}
                alt={`${officeName}_${i + 1}`}
                fill
                className="object-cover h-full w-full"
              />
            </Slide>
          ))}
        </Slider>
      </CarouselProvider>
    </div>
  );
}
