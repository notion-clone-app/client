import { type FC, useState, useCallback, useRef, useEffect } from "react"
import { motion, useInView } from "motion/react"
import { LandingContainer } from "../container"
import { TypographyH2, TypographyLead } from "@/shared/ui/typography"
import { useTranslation } from "@/shared/model/localization"
import {
    Globe, Shield, Users, FileText, Radio, Search,
    Database, HardDrive, MessageSquare, MousePointerClick
} from "lucide-react"

// --- Data ---

type NodeId = "spa" | "gateway" | "auth" | "user" | "document" | "realtime" | "search" | "postgres" | "redis" | "kafka"

interface ArchNode {
    id: NodeId
    icon: FC<{ className?: string }>
    tier: "client" | "gateway" | "service" | "data"
    accentColor: string
    glowColor: string
}

const NODES: ArchNode[] = [
    { id: "spa",       icon: Globe,          tier: "client",  accentColor: "text-blue-400",   glowColor: "shadow-blue-500/20" },
    { id: "gateway",   icon: Shield,         tier: "gateway", accentColor: "text-violet-400", glowColor: "shadow-violet-500/20" },
    { id: "auth",      icon: Shield,         tier: "service", accentColor: "text-amber-400",  glowColor: "shadow-amber-500/20" },
    { id: "user",      icon: Users,          tier: "service", accentColor: "text-emerald-400",glowColor: "shadow-emerald-500/20" },
    { id: "document",  icon: FileText,       tier: "service", accentColor: "text-cyan-400",   glowColor: "shadow-cyan-500/20" },
    { id: "realtime",  icon: Radio,          tier: "service", accentColor: "text-pink-400",   glowColor: "shadow-pink-500/20" },
    { id: "search",    icon: Search,         tier: "service", accentColor: "text-orange-400", glowColor: "shadow-orange-500/20" },
    { id: "postgres",  icon: Database,       tier: "data",    accentColor: "text-blue-300",   glowColor: "shadow-blue-400/20" },
    { id: "redis",     icon: HardDrive,      tier: "data",    accentColor: "text-red-400",    glowColor: "shadow-red-500/20" },
    { id: "kafka",     icon: MessageSquare,  tier: "data",    accentColor: "text-teal-400",   glowColor: "shadow-teal-500/20" },
]

// Connections: [from, to]
const CONNECTIONS: [NodeId, NodeId][] = [
    ["spa", "gateway"],
    ["gateway", "auth"],
    ["gateway", "user"],
    ["gateway", "document"],
    ["gateway", "realtime"],
    ["gateway", "search"],
    ["auth", "redis"],
    ["user", "postgres"],
    ["document", "postgres"],
    ["document", "kafka"],
    ["realtime", "redis"],
    ["search", "postgres"],
    ["kafka", "search"],
    ["kafka", "realtime"],
]

// --- Positioning ---
// Each node has a position in a relative coordinate system (percentage-based)
const NODE_POSITIONS: Record<NodeId, { x: number; y: number }> = {
    spa:      { x: 50, y: 5 },
    gateway:  { x: 50, y: 22 },
    auth:     { x: 12, y: 44 },
    user:     { x: 31, y: 44 },
    document: { x: 50, y: 44 },
    realtime: { x: 69, y: 44 },
    search:   { x: 88, y: 44 },
    postgres: { x: 28, y: 72 },
    redis:    { x: 50, y: 72 },
    kafka:    { x: 72, y: 72 },
}

// --- Components ---

const DiagramNode: FC<{
    node: ArchNode
    label: string
    description: string
    isHighlighted: boolean
    isSelected: boolean
    isDimmed: boolean
    onHover: (id: NodeId | null) => void
    onClick: (id: NodeId) => void
    position: { x: number; y: number }
    index: number
}> = ({ node, label, description, isHighlighted, isSelected, isDimmed, onHover, onClick, position, index }) => {
    const Icon = node.icon

    return (
        <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.06, duration: 0.5, ease: "easeOut" }}
        >
            <motion.button
                className={`
                    group relative flex flex-col items-center gap-1.5 cursor-pointer
                    transition-all duration-300
                    ${isDimmed ? "opacity-30" : "opacity-100"}
                `}
                onMouseEnter={() => onHover(node.id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onClick(node.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
            >
                {/* Card */}
                <div className={`
                    relative flex items-center justify-center
                    w-14 h-14 md:w-16 md:h-16 rounded-2xl
                    border transition-all duration-300
                    ${isHighlighted || isSelected
                        ? `border-current bg-secondary/80 dark:bg-white/10 shadow-lg ${node.glowColor} ${node.accentColor}`
                        : "border-border/60 bg-secondary/50 dark:bg-white/5 text-muted-foreground"
                    }
                    backdrop-blur-sm
                `}>
                    <Icon className={`h-6 w-6 md:h-7 md:w-7 transition-colors duration-300 ${isHighlighted || isSelected ? node.accentColor : ""}`} />

                    {/* Pulse ring on hover */}
                    {(isHighlighted || isSelected) && (
                        <motion.div
                            className={`absolute inset-0 rounded-2xl border ${node.accentColor} opacity-40`}
                            initial={{ scale: 1, opacity: 0.4 }}
                            animate={{ scale: 1.3, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                        />
                    )}
                </div>

                {/* Label */}
                <span className={`
                    text-xs md:text-sm font-medium whitespace-nowrap transition-colors duration-300
                    ${isHighlighted || isSelected ? "text-foreground" : "text-muted-foreground"}
                `}>
                    {label}
                </span>
            </motion.button>

            {/* Description tooltip - shown on selected */}
            {isSelected && (
                <motion.div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 z-20"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="rounded-xl border border-border/60 bg-card/95 dark:bg-gray-900/95 p-4 shadow-xl backdrop-blur-md">
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}

// SVG connection line with animated gradient
const ConnectionLine: FC<{
    from: { x: number; y: number }
    to: { x: number; y: number }
    isHighlighted: boolean
    isDimmed: boolean
    index: number
}> = ({ from, to, isHighlighted, isDimmed, index }) => {
    // Calculate control points for a curved path
    const midY = (from.y + to.y) / 2
    const dx = Math.abs(to.x - from.x)
    const curvature = dx > 20 ? 12 : 6

    const d = `M ${from.x} ${from.y} C ${from.x} ${midY + curvature}, ${to.x} ${midY - curvature}, ${to.x} ${to.y}`

    return (
        <motion.path
            d={d}
            fill="none"
            strokeWidth={isHighlighted ? 2 : 1}
            className={`transition-all duration-300 ${
                isDimmed
                    ? "stroke-border/20 dark:stroke-white/5"
                    : isHighlighted
                        ? "stroke-foreground/50 dark:stroke-white/40"
                        : "stroke-border/50 dark:stroke-white/10"
            }`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.04, duration: 0.8, ease: "easeInOut" }}
        />
    )
}

// Animated particle moving along a path
const AnimatedParticle: FC<{
    from: { x: number; y: number }
    to: { x: number; y: number }
    delay: number
    color: string
}> = ({ from, to, delay, color }) => {
    const midY = (from.y + to.y) / 2
    const dx = Math.abs(to.x - from.x)
    const curvature = dx > 20 ? 12 : 6

    const points = []
    for (let t = 0; t <= 1; t += 0.05) {
        const mt = 1 - t
        const x = mt * mt * mt * from.x + 3 * mt * mt * t * from.x + 3 * mt * t * t * to.x + t * t * t * to.x
        const y = mt * mt * mt * from.y + 3 * mt * mt * t * (midY + curvature) + 3 * mt * t * t * (midY - curvature) + t * t * t * to.y
        points.push({ x, y })
    }

    return (
        <motion.circle
            r="2"
            className={color}
            fill="currentColor"
            initial={{ opacity: 0 }}
            animate={{
                cx: points.map(p => p.x),
                cy: points.map(p => p.y),
                opacity: [0, 0.8, 0.8, 0],
            }}
            transition={{
                repeat: Infinity,
                duration: 3,
                delay: delay,
                ease: "linear",
                repeatDelay: 1,
            }}
        />
    )
}

export const ArchitectureDiagram: FC = () => {
    const { t } = useTranslation()
    const [hoveredNode, setHoveredNode] = useState<NodeId | null>(null)
    const [selectedNode, setSelectedNode] = useState<NodeId | null>(null)
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    const handleHover = useCallback((id: NodeId | null) => {
        setHoveredNode(id)
    }, [])

    const handleClick = useCallback((id: NodeId) => {
        setSelectedNode(prev => prev === id ? null : id)
    }, [])

    // Close tooltip when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setSelectedNode(null)
            }
        }
        document.addEventListener("click", handleClickOutside)
        return () => document.removeEventListener("click", handleClickOutside)
    }, [])

    const activeNode = hoveredNode || selectedNode

    const getConnectedNodes = (nodeId: NodeId): Set<NodeId> => {
        const connected = new Set<NodeId>()
        connected.add(nodeId)
        for (const [from, to] of CONNECTIONS) {
            if (from === nodeId) connected.add(to)
            if (to === nodeId) connected.add(from)
        }
        return connected
    }

    const connectedNodes = activeNode ? getConnectedNodes(activeNode) : null

    const isConnectionHighlighted = (from: NodeId, to: NodeId): boolean => {
        if (!activeNode) return false
        return (from === activeNode || to === activeNode)
    }

    const isConnectionDimmed = (from: NodeId, to: NodeId): boolean => {
        if (!activeNode) return false
        return !isConnectionHighlighted(from, to)
    }

    return (
        <section className="py-24 md:py-32 overflow-hidden" ref={ref}>
            <LandingContainer>
                <div className="flex flex-col gap-16">
                    {/* Header */}
                    <motion.div
                        className="flex flex-col items-center gap-6 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <TypographyH2>{t('landing:architecture.diagram.title')}</TypographyH2>
                        <TypographyLead className="max-w-2xl">
                            {t('landing:architecture.diagram.subtitle')}
                        </TypographyLead>
                    </motion.div>

                    {/* Diagram */}
                    <div className="relative w-full" style={{ paddingBottom: "85%" }}>
                        <div className="absolute inset-0">
                            {/* SVG Connections layer */}
                            <svg
                                className="absolute inset-0 w-full h-full"
                                viewBox="0 0 100 85"
                                preserveAspectRatio="xMidYMid meet"
                            >
                                {/* Connection lines */}
                                {isInView && CONNECTIONS.map(([from, to], i) => (
                                    <ConnectionLine
                                        key={`${from}-${to}`}
                                        from={NODE_POSITIONS[from]}
                                        to={NODE_POSITIONS[to]}
                                        isHighlighted={isConnectionHighlighted(from, to)}
                                        isDimmed={isConnectionDimmed(from, to)}
                                        index={i}
                                    />
                                ))}

                                {/* Animated particles (only when idle — no hover) */}
                                {isInView && !activeNode && CONNECTIONS.map(([from, to], i) => (
                                    <AnimatedParticle
                                        key={`particle-${from}-${to}`}
                                        from={NODE_POSITIONS[from]}
                                        to={NODE_POSITIONS[to]}
                                        delay={i * 0.7}
                                        color="text-muted-foreground/60"
                                    />
                                ))}
                            </svg>

                            {/* Nodes layer */}
                            {NODES.map((node, i) => (
                                <DiagramNode
                                    key={node.id}
                                    node={node}
                                    label={t(`landing:architecture.diagram.nodes.${node.id}.label`)}
                                    description={t(`landing:architecture.diagram.nodes.${node.id}.description`)}
                                    isHighlighted={connectedNodes?.has(node.id) ?? false}
                                    isSelected={selectedNode === node.id}
                                    isDimmed={!!activeNode && !(connectedNodes?.has(node.id) ?? false)}
                                    onHover={handleHover}
                                    onClick={handleClick}
                                    position={NODE_POSITIONS[node.id]}
                                    index={i}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Hint */}
                    <motion.div
                        className="flex items-center justify-center gap-2 text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ delay: 1.2, duration: 0.6 }}
                    >
                        <MousePointerClick className="h-4 w-4" />
                        <span className="text-sm">{t('landing:architecture.diagram.hint')}</span>
                    </motion.div>

                    {/* Tier labels */}
                    <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                        {(["client", "gateway", "service", "data"] as const).map(tier => (
                            <div key={tier} className="flex items-center gap-2">
                                <div className={`h-2.5 w-2.5 rounded-full ${
                                    tier === "client" ? "bg-blue-400" :
                                    tier === "gateway" ? "bg-violet-400" :
                                    tier === "service" ? "bg-emerald-400" :
                                    "bg-amber-400"
                                }`} />
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {tier}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </LandingContainer>
        </section>
    )
}
