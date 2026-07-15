import { type FC } from "react";
import { HeroSection } from "./ui";
import { LandingLayout } from "./ui/layout/landing.layout";
import { StackSection } from "./ui/sections/stack";

const LandingPage: FC = () => {
  return (
    <LandingLayout>
      <HeroSection />
      <StackSection />
    </LandingLayout>
  );
};

export const Component = LandingPage;
