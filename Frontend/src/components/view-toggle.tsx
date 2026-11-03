import { LayoutGrid, List } from "lucide-react"

interface ViewToggleProps {
    value: "cards" | "list"
    onChange: (mode: "cards" | "list") => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
    return (
        <div className="flex items-center rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
            <button
                onClick={() => onChange("cards")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${value === "cards"
                    ? "bg-blue-800 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
            >
                <LayoutGrid className="h-4 w-4" />
                Cards
            </button>
            <button
                onClick={() => onChange("list")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${value === "list"
                    ? "bg-blue-800 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
            >
                <List className="h-4 w-4" />
                Linhas
            </button>
        </div>
    )
}
