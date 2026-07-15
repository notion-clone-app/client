import { type FC, useRef } from "react"
import { motion, useScroll, useTransform, useInView } from "motion/react"
import { LandingContainer } from "../container"
import { TypographyH2, TypographyLead } from "@/shared/ui/typography"
import { useTranslation } from "@/shared/model/localization"
import {
    Atom, FileCode2, Paintbrush, Package, Sparkles, Navigation,
    Binary, Cpu, HardDrive, Database, Radio as RadioIcon, Boxes,
    Container, Box, Globe2, Wrench, Activity, BarChart3, Waypoints
} from "lucide-react"

// --- Data ---

interface TechItem {
    key: string
    icon: FC<{ className?: string }>
}

interface LayerConfig {
    id: "frontend" | "backend" | "infrastructure"
    accentColor: string
    borderColor: string
    glowColor: string
    bgColor: string
    items: TechItem[]
}

const LAYERS: LayerConfig[] = [
    {
        id: "frontend",
        accentColor: "text-blue-400",
        borderColor: "border-blue-500/30",
        glowColor: "shadow-blue-500/10",
        bgColor: "from-blue-500/5 to-transparent",
        items: [
            { key: "react",      icon: Atom },
            { key: "typescript", icon: FileCode2 },
            { key: "tailwind",   icon: Paintbrush },
            { key: "zustand",    icon: Package },
            { key: "motion",     icon: Sparkles },
            { key: "router",     icon: Navigation },
        ],
    },
    {
        id: "backend",
        accentColor: "text-emerald-400",
        borderColor: "border-emerald-500/30",
        glowColor: "shadow-emerald-500/10",
        bgColor: "from-emerald-500/5 to-transparent",
        items: [
            { key: "golang",  icon: Binary },
            { key: "grpc",    icon: Cpu },
            { key: "kafka",   icon: HardDrive },
            { key: "postgres",icon: Database },
            { key: "redis",   icon: RadioIcon },
            { key: "micro",   icon: Boxes },
        ],
    },
    {
        id: "infrastructure",
        accentColor: "text-amber-400",
        borderColor: "border-amber-500/30",
        glowColor: "shadow-amber-500/10",
        bgColor: "from-amber-500/5 to-transparent",
        items: [
            { key: "k8s",        icon: Container },
            { key: "docker",     icon: Box },
            { key: "terraform",  icon: Globe2 },
            { key: "ansible",    icon: Wrench },
            { key: "prometheus", icon: Activity },
            { key: "grafana",    icon: BarChart3 },
            { key: "otel",       icon: Waypoints },
        ],
    },
]

// --- Tech Card ---

const TechCard: FC<{
    layerId: string
    item: TechItem
    accentColor: string
    index: number
    isInView: boolean
}> = ({ layerId, item, accentColor, index, isInView }) => {
    const { t } = useTranslation()
    const Icon = item.icon
    const name = t(`landing:architecture.layers.${layerId}.items.${item.key}.name`)
    const reason = t(`landing:architecture.layers.${layerId}.items.${item.key}.reason`)

    return (
        <motion.div
            className="group relative"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 + index * 0.06, duration: 0.4, ease: "easeOut" }}
        >
            <div className={`
                relative flex flex-col gap-3 rounded-xl border p-4
                transition-all duration-300
                border-border/40 bg-card/50 dark:bg-white/[0.02]
                hover:border-border hover:bg-secondary/30 dark:hover:bg-white/[0.05]
                hover:shadow-lg hover:-translate-y-1
            `}>
                {/* Icon */}
                <div className={`
                    flex items-center justify-center w-10 h-10 rounded-lg
                    bg-secondary/80 dark:bg-white/5
                    group-hover:${accentColor}
                    transition-colors duration-300
                `}>
                    <Icon className={`h-5 w-5 text-muted-foreground group-hover:${accentColor} transition-colors duration-300`} />
                </div>

                {/* Name */}
                <span className="font-medium text-sm text-foreground">{name}</span>

                {/* Reason - shown on hover */}
                <span className="text-xs leading-relaxed text-muted-foreground">
                    {reason}
                </span>
            </div>
        </motion.div>
    )
}

// --- Layer Row ---

const LayerRow: FC<{
    layer: LayerConfig
    index: number
    yOffset: ReturnType<typeof useTransform>
}> = ({ layer, index, yOffset }) => {
    const { t } = useTranslation()
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: true, margin: "-50px" })

    const label = t(`landing:architecture.layers.${layer.id}.label`)

    return (
        <motion.div
            ref={ref}
            className="relative"
            style={{ y: yOffset }}
        >
            {/* Layer header */}
            <motion.div
                className="flex items-center gap-3 mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.15 }}
            >
                <div className={`h-px flex-1 max-w-12 bg-gradient-to-r ${layer.bgColor}`} />
                <div className={`flex items-center gap-2 ${layer.accentColor}`}>
                    <div className={`h-2 w-2 rounded-full bg-current`} />
                    <span className="text-sm font-semibold uppercase tracking-wider">{label}</span>
                </div>
                <div className={`h-px flex-1 bg-gradient-to-l ${layer.bgColor}`} />
            </motion.div>

            {/* Tech cards grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                {layer.items.map((item, i) => (
                    <TechCard
                        key={item.key}
                        layerId={layer.id}
                        item={item}
                        accentColor={layer.accentColor}
                        index={i}
                        isInView={isInView}
                    />
                ))}
            </div>

            {/* Bottom glow line */}
            <motion.div
                className={`mt-6 h-px bg-gradient-to-r from-transparent via-current to-transparent ${layer.accentColor} opacity-20`}
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: "easeOut" }}
            />
        </motion.div>
    )
}

export const TechnologyLayers: FC = () => {
    const { t } = useTranslation()
    const sectionRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

    // Scroll-driven parallax for layers
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"],
    })

    const y0 = useTransform(scrollYProgress, [0, 1], [40, -40])
    const y1 = useTransform(scrollYProgress, [0, 1], [20, -20])
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 0])

    const yOffsets = [y0, y1, y2]

    return (
        <section className="py-24 md:py-32 overflow-hidden" ref={sectionRef}>
            <LandingContainer>
                <div className="flex flex-col gap-16">
                    {/* Header */}
                    <motion.div
                        className="flex flex-col items-center gap-6 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <TypographyH2>{t('landing:architecture.layers.title')}</TypographyH2>
                        <TypographyLead className="max-w-2xl">
                            {t('landing:architecture.layers.subtitle')}
                        </TypographyLead>
                    </motion.div>

                    {/* Layers */}
                    <div className="flex flex-col gap-12 md:gap-16">
                        {LAYERS.map((layer, i) => (
                            <LayerRow
                                key={layer.id}
                                layer={layer}
                                index={i}
                                yOffset={yOffsets[i]}
                            />
                        ))}
                    </div>
                </div>
            </LandingContainer>
        </section>
    )
}
