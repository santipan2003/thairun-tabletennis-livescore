import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image"; // Assuming you are using Next.js for images

// Mock data for table tennis matches
const matches = [
  {
    stage: "Group Stage · Group A",
    player1: { name: "Timo Boll", flag: "/flags/germany.png" },
    player2: { name: "Ma Long", flag: "/flags/china.png" },
    score1: 3,
    score2: 0,
    status: "Final",
  },
  {
    stage: "Group Stage · Group B",
    player1: { name: "Tomokazu Harimoto", flag: "/flags/japan.png" },
    player2: { name: "Hugo Calderano", flag: "/flags/brazil.png" },
    score1: 3,
    score2: 2,
    status: "Final",
  },
  {
    stage: "Group Stage · Group C",
    player1: { name: "Fan Zhendong", flag: "/flags/china.png" },
    player2: { name: "Mattias Falck", flag: "/flags/sweden.png" },
    score1: 2,
    score2: 3,
    status: "Final",
  },
  {
    stage: "Group Stage · Group D",
    player1: { name: "Jang Woo-jin", flag: "/flags/korea.png" },
    player2: { name: "Dimitrij Ovtcharov", flag: "/flags/germany.png" },
    score1: 1,
    score2: 3,
    status: "Final",
  },
  {
    stage: "Group Stage · Group E",
    player1: { name: "Simon Gauzy", flag: "/flags/france.png" },
    player2: { name: "Patrick Franziska", flag: "/flags/germany.png" },
    score1: 3,
    score2: 0,
    status: "Final",
  },
  {
    stage: "Group Stage · Group F",
    player1: { name: "Kanak Jha", flag: "/flags/usa.png" },
    player2: { name: "Omar Assar", flag: "/flags/egypt.png" },
    score1: 0,
    score2: 3,
    status: "Final",
  },
  {
    stage: "Group Stage · Group G",
    player1: { name: "Liam Pitchford", flag: "/flags/uk.png" },
    player2: { name: "Chuang Chih-Yuan", flag: "/flags/taiwan.png" },
    score1: 2,
    score2: 3,
    status: "Final",
  },
  {
    stage: "Group Stage · Group H",
    player1: { name: "Quadri Aruna", flag: "/flags/nigeria.png" },
    player2: { name: "Jun Mizutani", flag: "/flags/japan.png" },
    score1: 3,
    score2: 1,
    status: "Final",
  },
  {
    stage: "Group Stage · Group I",
    player1: { name: "Lin Yun-Ju", flag: "/flags/taiwan.png" },
    player2: { name: "Marcos Freitas", flag: "/flags/portugal.png" },
    score1: 3,
    score2: 0,
    status: "Final",
  },
];

export default function MatchCarousel() {
  return (
    <div className="w-full">
      <Carousel className="w-full">
        <CarouselPrevious />
        <CarouselContent className="flex">
          {matches.map((match, index) => (
            <CarouselItem key={index} className="basis-1/3">
              <Card className="p-4">
                <CardContent className="flex flex-col">
                  {/* Header Section */}
                  <div className="flex justify-between mb-4">
                    <div className="text-left">
                      <p className="text-xs text-gray-600">{match.stage}</p>
                    </div>
                    <div className="text-right ml-16">
                      <p className="text-xs font-bold text-blue-500">
                        {match.status}
                      </p>
                    </div>
                  </div>

                  {/* Player and Score Section */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <Image
                        src={match.player1.flag}
                        alt={match.player1.name}
                        width={24}
                        height={16}
                      />
                      <p className="text-md font-semibold">
                        {match.player1.name}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-right">
                      {match.score1}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center space-x-4">
                      <Image
                        src={match.player2.flag}
                        alt={match.player2.name}
                        width={24}
                        height={16}
                      />
                      <p className="text-md font-semibold">
                        {match.player2.name}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-right">
                      {match.score2}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNext />
      </Carousel>
    </div>
  );
}
