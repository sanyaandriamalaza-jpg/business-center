import { Building2, MapPin } from "lucide-react";
import React from "react";
import Card from "../components/card";
import { SplitText } from "@/src/components/global/SplitText";
import { AnimatedContent } from "@/src/components/global/AnimatedContent";
import DomeGallery from "@/src/components/global/DomeGallery";

export default function Landing() {
  const handleAnimationComplete = () => {
    console.log("All letters have animated!");
  };
  return (
    <>
      <div className="absolute inset-0 z-2" >
        <div className="bg-[url('/officebg.png')] bg-cover bg-center absolute top-0 left-0 right-0 bottom-0 opacity-25 "></div>
        {/* <DomeGallery/> */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent z-to" />
      </div>
      <div className="w-full mx-auto px-4 z-10 text-center ">
        <AnimatedContent
          distance={150}
          direction="horizontal"
          reverse={true}
          duration={1.2}
          initialOpacity={0.2}
          animateOpacity
          scale={1.1}
          threshold={0.2}
          delay={0.3}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mt-20 mb-6">
            La solution parfaite pour votre{" "}
            <span className="text-emerald-400">Entreprise</span>
          </h1>
        </AnimatedContent>

        <SplitText
          text="Obtenez une addresse de domiciliation légale et professionnelle pour
          votre entreprise"
          className="text-xl text-indigo-100 mb-16 max-w-3xl mx-auto md:text-2xl"
          delay={20}
          duration={0.2}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
          onLetterAnimationComplete={handleAnimationComplete}
        />

        <div className=" max-w-4xl mx-auto hover:scale-100 mt-16">
          {/* <Card
            icon={<Building2 className="text-emerald-400 mb-4 w-12 h-12" />}
            title={"Espaces de travail"}
            description={
              " Bureaux privés, salles de réunion et espaces de coworking équipés et flexibles"
            }
            link={"/"}
            buttonText={"Découvrir les espaces "}
          /> */}
          <AnimatedContent
            distance={150}
            direction="vertical"
            reverse={true}
            duration={1.2}
            initialOpacity={0.2}
            animateOpacity
            scale={1.1}
            threshold={0.2}
            delay={0.3}
          >
            <Card
              icon={<MapPin className="text-emerald-400 mb-4 w-12 h-12" />}
              title={"Confiez-nous votre entreprise"}
              description={
                "Une adresse professionnelle prestigieuse avec gestion complète de votre courrier."
              }
              link={"/business-address"}
              buttonText={"Voir les Offres"}
            />
          </AnimatedContent>
        </div>
      </div>
    </>
  );
}
