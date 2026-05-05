import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({ src, name, className, fallbackClassName }: UserAvatarProps) {
  return (
    <Avatar className={cn("h-10 w-10 border border-border shadow-sm", className)}>
      <AvatarImage src={src || ""} className="object-cover" />
      <AvatarFallback className={cn("bg-primary/10 text-primary font-medium", fallbackClassName)}>
        {name ? (
          name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
        ) : (
          <User className="h-1/2 w-1/2 opacity-50" />
        )}
      </AvatarFallback>
    </Avatar>
  );
}
