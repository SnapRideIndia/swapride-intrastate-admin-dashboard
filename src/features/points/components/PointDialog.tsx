import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Plus, Image as ImageIcon, Navigation, Upload, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { routeService } from "@/features/routes/api/route.service";
import {
  useCreatePoint,
  useUpdatePoint,
  useAddPointImage,
  useRemovePointImage,
} from "@/features/routes/hooks/useRouteQueries";

const pointFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().length(6, "Pincode must be exactly 6 digits").regex(/^\d+$/, "Pincode must contain only numbers"),
  address: z.string().min(5, "Full address is required"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  images: z.array(z.any()).default([]),
});

type PointFormData = z.infer<typeof pointFormSchema>;

interface PointDialogProps {
  initialData?: any;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PointDialog({ initialData, onSuccess, open: controlledOpen, onOpenChange }: PointDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isEditing = !!initialData;
  const createPointMutation = useCreatePoint();
  const updatePointMutation = useUpdatePoint();
  const addPointImageMutation = useAddPointImage();
  const removePointImageMutation = useRemovePointImage();
  const isPending = createPointMutation.isPending || updatePointMutation.isPending || addPointImageMutation.isPending;

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const form = useForm<PointFormData>({
    resolver: zodResolver(pointFormSchema),
    defaultValues: {
      name: "",
      city: "",
      state: "",
      pincode: "",
      address: "",
      latitude: "",
      longitude: "",
      images: [],
    },
  });

  // Reset form when initialData changes or dialog opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name || "",
          city: initialData.city || "",
          state: initialData.state || "",
          pincode: initialData.pincode || "",
          address: initialData.address || "",
          latitude: initialData.latitude?.toString() || "",
          longitude: initialData.longitude?.toString() || "",
          images:
            initialData.images?.map((img: any) => ({
              id: img.id,
              imageUrl: img.imageUrl,
              caption: img.caption || "",
              isPrimary: img.isPrimary,
              displayOrder: img.displayOrder,
              isUploaded: true,
            })) || [],
        });
      } else {
        form.reset({
          name: "",
          city: "",
          state: "",
          pincode: "",
          address: "",
          latitude: "",
          longitude: "",
          images: [],
        });
      }
    }
  }, [initialData, open, form]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentImages = form.getValues("images");
    const newFiles = Array.from(files);

    // If editing, we can upload immediately
    if (isEditing) {
      for (const file of newFiles) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("isPrimary", (currentImages.length === 0).toString());
        formData.append("displayOrder", currentImages.length.toString());

        try {
          const result = await addPointImageMutation.mutateAsync({
            pointId: initialData.id,
            imageData: formData,
          });

          const updatedImages = form.getValues("images");
          form.setValue("images", [
            ...updatedImages,
            {
              ...result,
              isUploaded: true,
            },
          ]);
        } catch (error: any) {
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}: ${error.message}`,
            variant: "destructive",
          });
        }
      }
    } else {
      // If creating, just add to local state
      const localImages = newFiles.map((file, idx) => ({
        file,
        localUrl: URL.createObjectURL(file), // For preview
        caption: "",
        isPrimary: currentImages.length + idx === 0,
        displayOrder: currentImages.length + idx,
        isUploaded: false,
      }));

      form.setValue("images", [...currentImages, ...localImages]);
    }

    // Reset input
    e.target.value = "";
  };

  const removeImageField = async (index: number) => {
    const currentImages = form.getValues("images");
    const imageToRemove = currentImages[index];

    if (imageToRemove.isUploaded && isEditing && initialData) {
      if (window.confirm("Remove this image permanently from the gallery?")) {
        try {
          await removePointImageMutation.mutateAsync({
            pointId: initialData.id,
            imageId: imageToRemove.id,
          });
          const newImages = currentImages.filter((_, i) => i !== index);
          form.setValue("images", newImages);
        } catch (error: any) {
          toast({
            title: "Adjustment Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      }
      return;
    }

    // Local removal
    const newImages = currentImages.filter((_, i) => i !== index);
    if (newImages.length > 0 && !newImages.some((img) => img.isPrimary)) {
      newImages[0].isPrimary = true;
    }
    newImages.forEach((img, i) => (img.displayOrder = i));
    form.setValue("images", newImages);
  };

  const setPrimaryImage = (index: number) => {
    const currentImages = form.getValues("images");
    const newImages = currentImages.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    form.setValue("images", newImages);
  };

  const onSubmit = async (data: PointFormData) => {
    try {
      const payload = {
        ...data,
        latitude: data.latitude ? parseFloat(data.latitude) : undefined,
        longitude: data.longitude ? parseFloat(data.longitude) : undefined,
        images: data.images
          .filter((img) => img.isUploaded)
          .map(({ imageUrl, caption, isPrimary, displayOrder }) => ({
            imageUrl,
            caption,
            isPrimary,
            displayOrder,
          })),
      };

      let result;
      if (isEditing) {
        result = await updatePointMutation.mutateAsync({ id: initialData.id, pointData: payload });
      } else {
        // Create point metadata first
        result = await createPointMutation.mutateAsync(payload);

        // Upload pending images
        const pendingImages = data.images.filter((img) => !img.isUploaded && img.file);
        for (const img of pendingImages) {
          const formData = new FormData();
          formData.append("image", img.file);
          formData.append("isPrimary", img.isPrimary.toString());
          formData.append("displayOrder", img.displayOrder.toString());
          formData.append("caption", img.caption || "");

          await routeService.addPointImage(result.id, formData);
        }
      }

      toast({
        title: isEditing ? "Point Updated" : "Point Created",
        description: `${data.name} has been ${isEditing ? "updated" : "created"} successfully.`,
      });
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <FullPageLoader show={isPending} label={isEditing ? "Updating point..." : "Creating point..."} />
      <Dialog open={open} onOpenChange={setOpen}>
        {controlledOpen === undefined && (
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Point
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex-row items-center gap-4 space-y-0 text-left">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <DialogTitle className="text-2xl font-bold leading-none mb-1">
                {isEditing ? "Edit Point" : "Create New Point"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Define a precise location for pick-ups and drop-offs.
              </DialogDescription>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Point Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. JBS Bus Stand" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Hyderabad" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Telangana" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 500003" maxLength={6} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Complete address with landmark..."
                            className="min-h-[80px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Navigation className="h-3 w-3" /> Latitude
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 17.3850" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Navigation className="h-3 w-3" /> Longitude
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 78.4867" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <FormLabel className="flex items-center gap-2 text-base font-semibold">
                      <ImageIcon className="h-4 w-4" /> Point Images
                    </FormLabel>
                    <div className="relative">
                      <Button type="button" variant="outline" size="sm" className="relative overflow-hidden">
                        <Upload className="h-4 w-4 mr-1" /> Upload Image
                        <Input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                          multiple
                          onChange={handleFileSelect}
                        />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {form.watch("images")?.map((img, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors space-y-3 relative group"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 text-muted-foreground hover:text-destructive h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImageField(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>

                        <div className="flex gap-4 items-start">
                          <div
                            className="h-24 w-24 rounded-lg bg-muted overflow-hidden shrink-0 cursor-pointer relative"
                            onClick={() => {
                              setPreviewUrl(img.isUploaded ? img.imageUrl : img.localUrl);
                              setIsPreviewOpen(true);
                            }}
                          >
                            <img
                              src={img.isUploaded ? img.imageUrl : img.localUrl}
                              alt="preview"
                              className="h-full w-full object-cover"
                            />
                            {!img.isUploaded && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="text-[10px] text-white font-bold uppercase">Pending</span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 space-y-3">
                            <FormField
                              control={form.control}
                              name={`images.${index}.caption`}
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormLabel className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                                    Caption
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. Main Entrance" className="h-8 text-sm" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex items-center justify-between">
                              <FormField
                                control={form.control}
                                name={`images.${index}.isPrimary`}
                                render={({ field }) => (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      id={`primary-${index}`}
                                      checked={field.value}
                                      onChange={() => setPrimaryImage(index)}
                                      className="h-4 w-4 text-primary accent-primary cursor-pointer"
                                    />
                                    <label
                                      htmlFor={`primary-${index}`}
                                      className="text-xs font-medium cursor-pointer text-muted-foreground"
                                    >
                                      Set as Primary
                                    </label>
                                  </div>
                                )}
                              />

                              <div className="flex items-center gap-2">
                                {img.isUploaded ? (
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] bg-green-50 text-green-700 border-green-200"
                                  >
                                    <Check className="h-2 w-2 mr-1" /> S3 Stored
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] bg-amber-50 text-amber-700 border-amber-200"
                                  >
                                    Local
                                  </Badge>
                                )}
                                <span className="text-[10px] text-muted-foreground font-mono">#{index}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {(!form.watch("images") || form.watch("images").length === 0) && (
                      <div className="py-8 border border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
                        <ImageIcon className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-sm">No images added yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t font-layout">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{isEditing ? "Save Changes" : "Create Point"}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none bg-transparent shadow-none">
          <div className="relative w-full aspect-video bg-black/10 flex items-center justify-center">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Full Preview"
                className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg"
              />
            )}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm"
              onClick={() => setIsPreviewOpen(false)}
            >
              <Plus className="h-5 w-5 rotate-45" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
