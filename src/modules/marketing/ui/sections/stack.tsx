import type { FC } from "react";
import { LandingContainer } from "../container";
import { Marquee } from "../marquee";
import { TypographyH2, TypographyLead } from "@/shared/ui/typography";
import { useTranslation } from "@/shared/model/localization";

const frontendStack = ["React", "Typescript", "Tailwind CSS", "Zustand"];
const backendStack = ["Golang", "Kafka", "Microservices", "PostgreSQL", "Redis"];
const devopsStack = [
  "Kubernetes",
  "Ansible",
  "Terraform",
  "Prometheus",
  "Grafana",
  "OpenTelemetry",
];

const StackItem: FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center justify-center rounded-full border border-border/50 bg-secondary/50 px-6 py-3 font-medium text-secondary-foreground backdrop-blur-sm">
    {title}
  </div>
);

export const StackSection: FC = () => {
  const { t } = useTranslation();
  return (
    <section className="overflow-hidden border-t border-border/50 bg-background py-24 md:py-32">
      <LandingContainer>
        <div className="flex flex-col gap-16">
          <div className="flex flex-col items-center gap-6 text-center">
            <TypographyH2>{t("landing:stack.title")}</TypographyH2>
            <TypographyLead>{t("landing:stack.description")}</TypographyLead>
          </div>

          <div className="relative flex flex-col gap-2">
            <Marquee
              items={frontendStack.map((item) => (
                <StackItem key={item} title={item} />
              ))}
              speedInSeconds={30}
            />
            <Marquee
              direction="right"
              items={backendStack.map((item) => (
                <StackItem key={item} title={item} />
              ))}
              speedInSeconds={35}
            />
            <Marquee
              items={devopsStack.map((item) => (
                <StackItem key={item} title={item} />
              ))}
              speedInSeconds={40}
            />
          </div>
        </div>
      </LandingContainer>
    </section>
  );
};
