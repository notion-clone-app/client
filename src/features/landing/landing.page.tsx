import { type FC } from "react";
import { HeroSection, LandingContainer } from "./ui";
import { LandingLayout } from "./ui/layout/landing.layout";
import { Marquee } from "./ui/marquee";

const LandingPage: FC = () => {
  return (
    <LandingLayout>
      <HeroSection />
      <section>
        <LandingContainer>
          <h2 className="text-[40px] text-center">Стек</h2>
          <Marquee items={[<div>React</div>, <div>Typescript</div>]} />
          <Marquee direction="right" items={[<div>Golang</div>, <div>Kafka</div>, <div>Microservices</div>]} />
          <Marquee items={[<div>Kubernetes</div>, <div>Ansible</div>, <div>Terraform</div>, <div>Prometheus</div>, <div>Graphana</div>, <div>Open Telemetry</div>]} />
        </LandingContainer>
      </section>
      <section></section>
    </LandingLayout>
  );
};

export const Component = LandingPage;
