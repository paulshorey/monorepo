import React from "react";
import Styled from "./AboutUs.styled.js";
import Image from "next/image";
import HorizontalCarousel from "@techytools/ui/components/HorizontalCarousel";

export default function AboutUs() {
  return (
    <Styled>
      <HorizontalCarousel>
        <div className="slides">
          <Image height={280} width={280} src="/photos/aboutus.jpg" />
          <Image height={280} width={280} src="/photos/desk-paul.jpg" />
          <Image height={280} width={386} src="/photos/desk-samira.jpg" />
          <Image height={280} width={334} src="/photos/city-samira-paul.jpg" />
          <Image height={280} width={280} src="/photos/aboutus-utah-road.jpg" />
          <Image height={280} width={280} src="/photos/about-paul-rocks.jpg" />
        </div>
      </HorizontalCarousel>
    </Styled>
  );
}
