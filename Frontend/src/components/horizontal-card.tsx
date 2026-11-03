import type { ReactNode } from "react"

export interface InfoBlock {
    label: string
    value: ReactNode
}

export interface HorizontalCardProps {
    title: ReactNode
    subtitle?: ReactNode
    badge?: ReactNode
    infoBlocks?: InfoBlock[]
    leftBorderClass?: string
    onClick?: () => void
    children?: ReactNode
}

export function HorizontalCard({
    title,
    subtitle,
    badge,
    infoBlocks,
    leftBorderClass = "border-l-brand",
    onClick,
    children,
}: HorizontalCardProps) {
    const hasDetails = (infoBlocks && infoBlocks.length > 0) || children

    return (
        <div
            onClick={onClick}
            className={`flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white ${leftBorderClass} border-l-4 px-6 py-3.5 shadow-sm transition-all hover:shadow-md ${
                onClick ? "cursor-pointer" : ""
            }`}
        >
            {/* Coluna 1: Título e Subtítulo */}
            <div
                className={`flex flex-col justify-center min-w-0 pr-4 ${
                    hasDetails ? "w-60 sm:w-64 md:w-[280px] shrink-0" : "flex-1"
                }`}
            >
                {subtitle && (
                    typeof subtitle === "string" ? (
                        <span className="truncate text-xs font-medium text-gray-400" title={subtitle}>
                            {subtitle}
                        </span>
                    ) : (
                        subtitle
                    )
                )}
                {typeof title === "string" ? (
                    <h3 className="truncate text-sm font-bold text-gray-900" title={title}>
                        {title}
                    </h3>
                ) : (
                    title
                )}
            </div>

            {/* Coluna 2: Área Central (infoBlocks e/ou children) */}
            {hasDetails && (
                <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 items-center px-2">
                    {infoBlocks?.map((block, index) => (
                        <div key={index} className="min-w-0">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <span className="shrink-0 text-gray-400">{block.label}:</span>
                                <strong
                                    className="truncate font-semibold text-gray-800"
                                    title={
                                        typeof block.value === "string" || typeof block.value === "number"
                                            ? String(block.value)
                                            : undefined
                                    }
                                >
                                    {block.value}
                                </strong>
                            </div>
                        </div>
                    ))}

                    {children && (
                        <div
                            className={`${
                                !infoBlocks?.length
                                    ? "col-span-2 sm:col-span-3 md:col-span-4"
                                    : infoBlocks.length === 1
                                    ? "col-span-1 sm:col-span-2 md:col-span-3"
                                    : "col-span-2"
                            } flex items-center gap-2 min-w-0`}
                        >
                            {children}
                        </div>
                    )}
                </div>
            )}

            {/* Coluna 3: Badge de Status */}
            {badge && (
                <div className="w-28 sm:w-32 shrink-0 flex self-center items-center justify-end pl-2">
                    {badge}
                </div>
            )}
        </div>
    )
}