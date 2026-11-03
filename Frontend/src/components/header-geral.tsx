import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "react-router-dom";
import {
    SidebarTrigger,
} from "@/components/ui/sidebar";
interface HeaderGeralProps {
    title?: string;
    breadcrumbTitle?: string;
    breadcrumbUrl?: string;
    children?: React.ReactNode;
}

export default function HeaderGeral({ title, breadcrumbTitle = "Plantel", breadcrumbUrl = "/", children }: HeaderGeralProps) {
    const location = useLocation();
    const path = location.pathname;

    const routeNames: Record<string, string> = {
        "/perfis-e-usuarios/usuario": "Usuários",
        "/plantel/visao-geral": "Visão Geral",
        "/plantel/locais-origem": "Locais de Origem",
        "/plantel/especies": "Espécies cadastradas",
        "/plantel/cadastro": "Cadastro de Animal",
        "/plantel/ficha-animal": "Ficha do Animal",
        "/alimentacao/visao-geral": "Visão Geral",
        "/alimentacao/registro-alimentacao": "Registro de Alimentação",
        "/instalacoes": "Instalações",
        "/eventos": "Eventos",
    };

    const pageName = title || routeNames[path] || (path.startsWith("/plantel/animal/") ? "Ficha do Animal" : "");
    return (
        <div className="flex items-center justify-between w-full h-16">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                    <BreadcrumbList className="text-lg">
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to={breadcrumbUrl}>{breadcrumbTitle}</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{pageName}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            {children && (
                <div className="flex items-center pr-4">
                    {children}
                </div>
            )}
        </div>
    )
}
