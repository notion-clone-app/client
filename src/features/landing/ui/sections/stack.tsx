import type { FC } from "react"
import { LandingContainer } from "../container"
import { Marquee } from "../marquee"
import { TypographyH2, TypographyLead } from "@/shared/ui/typography"

const frontendStack = ["React", "Typescript", "Tailwind CSS", "Zustand"]
const backendStack = ["Golang", "Kafka", "Microservices", "PostgreSQL", "Redis"]
const devopsStack = ["Kubernetes", "Ansible", "Terraform", "Prometheus", "Grafana", "OpenTelemetry"]

const StackItem: FC<{ title: string }> = ({ title }) => (
    <div className="flex items-center justify-center px-6 py-3 bg-secondary/50 border border-border/50 rounded-full text-secondary-foreground font-medium backdrop-blur-sm">
        {title}
    </div>
)

export const StackSection: FC = () => {
    return (
        <section className="py-24 md:py-32 bg-background overflow-hidden border-t border-border/50">
            <LandingContainer>
                <div className="flex flex-col gap-16">
                    <div className="flex flex-col items-center gap-6 text-center">
                        <TypographyH2>Стек технологий</TypographyH2>
                        <TypographyLead className="max-w-2xl">
                            Мы используем современные и надежные инструменты для создания масштабируемых решений
                        </TypographyLead>
                    </div>

                    <div className="flex flex-col gap-6 relative">
                        <Marquee 
                            items={frontendStack.map(item => <StackItem key={item} title={item} />)} 
                            speedInSeconds={30} 
                        />
                        <Marquee 
                            direction="right" 
                            items={backendStack.map(item => <StackItem key={item} title={item} />)} 
                            speedInSeconds={35} 
                        />
                        <Marquee 
                            items={devopsStack.map(item => <StackItem key={item} title={item} />)} 
                            speedInSeconds={40} 
                        />
                    </div>
                </div>
            </LandingContainer>
        </section>
    )
}
