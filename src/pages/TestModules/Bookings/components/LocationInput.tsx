import { useState, useEffect, useRef } from "react";
import { Search, Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { searchApi } from "@/features/search/api/search-api";
import { Location } from "../../types";

interface LocationInputProps {
  label: string;
  value: string;
  onChange: (val: string, loc?: Location) => void;
  placeholder: string;
  icon: string;
}

export function LocationInput({ label, value, onChange, placeholder, icon: IconClassName }: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const results = await searchApi.getPlaceSuggestions(input);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    const timeoutId = setTimeout(() => fetchSuggestions(val), 500);
    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="flex gap-4 items-start relative border-b border-border pb-2 group" ref={containerRef}>
      <div
        className={cn(
          "h-4 w-4 rounded-full mt-1 shrink-0 z-10 border-2 border-background shadow-sm transition-transform group-focus-within:scale-110",
          IconClassName,
        )}
      />
      <div className="flex-1">
        <label className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground block mb-0.5">
          {label}
        </label>
        <Input
          value={value}
          onChange={handleInputChange}
          onFocus={() => value.length >= 3 && setShowSuggestions(true)}
          className="border-none p-0 h-auto text-sm font-bold shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70 bg-transparent text-foreground"
          placeholder={placeholder}
        />
      </div>

      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <Card className="absolute left-8 right-0 top-full mt-1 z-[100] shadow-md border border-border p-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
              <Loader2 className="h-3 w-3 animate-spin" />
              Searching locations...
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto scrollbar-hide">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 p-3 hover:bg-secondary rounded-lg transition-colors text-left group/item"
                  onClick={() => {
                    onChange(s.text, { text: s.text, lat: s.lat, lng: s.lng });
                    setShowSuggestions(false);
                  }}
                >
                  <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center shrink-0 group-hover/item:bg-primary/10 transition-colors">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{s.mainText || s.text}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{s.text}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
