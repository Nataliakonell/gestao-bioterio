import React from 'react'

export interface TimelineDoseItem {
    stepNumber?: number | string;
    dateText: string;
    badgeText?: string;
    isActive?: boolean;
    isCompleted?: boolean;
    isOverdue?: boolean;
}

interface TimelineDosesProps {
    items: TimelineDoseItem[]
    orientation?: "vertical" | "horizontal"
    maxVisible?: number
}

export function TimelineDoses({ items, orientation = "vertical", maxVisible }: TimelineDosesProps) {
    if (!items || items.length === 0) return null;

    const visibleItems = maxVisible ? items.slice(0, maxVisible) : items
    const hasOverflow = maxVisible ? items.length > maxVisible : false

    if (orientation === "horizontal") {
        return (
            <div className="relative">
                {visibleItems.length > 1 && (
                    <div className="absolute left-4 right-4 top-[13px] h-[2px] bg-gray-200" />
                )}
                <div className="relative flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {visibleItems.map((item, i) => {
                        let circleClasses = "bg-blue-700 text-white";
                        if (item.isCompleted) circleClasses = "bg-green-600 text-white";
                        else if (item.isOverdue) circleClasses = "bg-red-600 text-white";
                        else if (item.isActive) circleClasses = "bg-blue-600 text-white ring-2 ring-blue-200 ring-offset-1";
                        else circleClasses = "bg-gray-300 text-white";

                        return (
                            <div key={i} className="flex flex-col items-center gap-1.5 min-w-[72px] shrink-0">
                                <span className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shrink-0 ${circleClasses}`}>
                                    {item.stepNumber ?? (i + 1)}
                                </span>
                                <span className="text-[10px] text-gray-600 text-center leading-tight whitespace-nowrap">
                                    {item.dateText}
                                </span>
                                {item.badgeText && (
                                    <span className="text-[9px] font-medium text-gray-500 whitespace-nowrap">
                                        {item.badgeText}
                                    </span>
                                )}
                            </div>
                        )
                    })}
                    {hasOverflow && (
                        <div className="flex flex-col items-center gap-1.5 min-w-[72px] shrink-0">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 text-[11px] font-bold border border-gray-200">
                                +{items.length - (maxVisible ?? 0)}
                            </span>
                            <span className="text-[10px] text-gray-400">mais</span>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="relative space-y-3">
            {visibleItems.length > 1 && (
                <div className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-gray-200" />
            )}

            {visibleItems.map((item, i) => {
                let badgeClasses = "bg-blue-50 text-blue-700";
                let circleClasses = "bg-blue-700 text-white";
                
                if (item.isCompleted) {
                    badgeClasses = "bg-green-50 text-green-700";
                    circleClasses = "bg-green-600 text-white";
                } else if (item.isOverdue) {
                    badgeClasses = "bg-red-50 text-red-700";
                    circleClasses = "bg-red-600 text-white";
                } else if (item.isActive) {
                    badgeClasses = "bg-blue-100 text-blue-800 border-blue-200 border";
                    circleClasses = "bg-blue-600 text-white ring-2 ring-blue-200 ring-offset-1";
                } else {
                    badgeClasses = "bg-gray-100 text-gray-700";
                    circleClasses = "bg-gray-400 text-white";
                }

                return (
                    <div key={i} className="relative flex items-center gap-3">
                        <span className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0 ${circleClasses}`}>
                            {item.stepNumber ?? (i + 1)}
                        </span>
                        <div className="flex-1 flex justify-between items-center px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-xs text-gray-700 shadow-sm">
                            <span className="capitalize">{item.dateText}</span>
                            {item.badgeText && (
                                <span className={`font-medium px-2 py-0.5 rounded text-[10px] ${badgeClasses}`}>
                                    {item.badgeText}
                                </span>
                            )}
                        </div>
                    </div>
                )
            })}
            {hasOverflow && (
                <div className="text-center text-xs text-gray-400 pt-1">+{items.length - (maxVisible ?? 0)} doses ocultas</div>
            )}
        </div>
    )
}
