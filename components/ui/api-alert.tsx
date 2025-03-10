"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Server } from "lucide-react";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "./button";
import toast from "react-hot-toast";
type BadgeProps = React.ComponentProps<typeof Badge>;
interface ApiAlertProps {
    title: string;
    description: string;
    variant: "Public" | "Admin";
};

const textMap: Record<ApiAlertProps["variant"], string> = {
    Public: "Public",
    Admin: "Admin"
};

const varainMap: Record<ApiAlertProps["variant"], string> = {
    Public: "secondary",
    Admin: "destructive"
};

export const ApiAlert:React.FC<ApiAlertProps> = ({
    title,
    description,
    variant = "Public"
}) => {

    const onCopy = () => {
        navigator.clipboard.writeText(description);
        toast.success("API Route copied to the clipboard");
    }
    return(
        <Alert>
            <Server className="h-4 w-4"/>
            <AlertTitle className="flex items-center gap-x-2">
                {title}
                <Badge>
                    {textMap[variant]}
                </Badge>
            </AlertTitle>
            <AlertDescription className="mt-4 flex items-center justify-between">
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                    {description}
                </code>
                <Button variant="outline" size="sm" onClick={onCopy}>
                    <Copy className="h-4 w-4"/>
                </Button>
            </AlertDescription>
        </Alert>
    )
}