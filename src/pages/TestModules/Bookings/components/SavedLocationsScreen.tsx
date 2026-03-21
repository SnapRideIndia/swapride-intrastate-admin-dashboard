import { useState, useEffect } from "react";
import { ChevronLeft, Plus, Pencil, Trash2, Home as HomeIcon, Building2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { SavedLocation } from "../api/saved-locations";
import { savedLocationsApi } from "../api/saved-locations";
import { cn } from "@/lib/utils";

interface SavedLocationsScreenProps {
  refreshTrigger?: number;
  onBack: () => void;
  onAddLocation: () => void;
  onEditLocation: (loc: SavedLocation) => void;
}

function getIconForLabel(label: string) {
  const n = (label || "").toLowerCase();
  if (n === "home") return <HomeIcon className="h-5 w-5 text-blue-600" />;
  if (n === "work" || n === "office") return <Building2 className="h-5 w-5 text-amber-600" />;
  return <MapPin className="h-5 w-5 text-slate-500" />;
}

export function SavedLocationsScreen({
  refreshTrigger = 0,
  onBack,
  onAddLocation,
  onEditLocation,
}: SavedLocationsScreenProps) {
  const [list, setList] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<SavedLocation | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await savedLocationsApi.listAll();
      setList(data);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [refreshTrigger]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await savedLocationsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      await fetchList();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-full">
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-slate-100 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onBack}>
          <ChevronLeft className="h-5 w-5 text-slate-900" />
        </Button>
        <h2 className="text-[17px] font-black text-slate-900 tracking-tight">Saved Locations</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={onAddLocation}
          title="Add location"
        >
          <Plus className="h-5 w-5 text-slate-900" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-500 mb-2">No saved locations yet</p>
            <p className="text-xs text-slate-400 mb-6">Add places you use often for quick pickup or dropoff</p>
            <Button
              onClick={onAddLocation}
              className="rounded-2xl gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((loc) => (
              <div
                key={loc.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4"
              >
                <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                  {getIconForLabel(loc.label)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{loc.label || "Saved place"}</p>
                  <p className="text-xs text-slate-500 truncate">{loc.address}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl"
                    onClick={() => onEditLocation(loc)}
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4 text-slate-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setDeleteTarget(loc)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {list.length > 0 && (
          <Button
            onClick={onAddLocation}
            variant="outline"
            className="w-full mt-6 rounded-2xl gap-2 border-dashed"
          >
            <Plus className="h-4 w-4" />
            Add Location
          </Button>
        )}
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="rounded-3xl max-w-[340px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Delete Saved Location?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete {deleteTarget?.label || "this location"} from your saved locations?
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
