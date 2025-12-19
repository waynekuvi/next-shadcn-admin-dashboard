"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { mutate } from "swr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  image: z.string().optional().or(z.literal("")),
});

export function AccountProfile({ user }: { user: any }) {
  const router = useRouter();
  const { refetch } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(user.image || null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      image: user.image || "",
    },
    mode: "onChange",
  });

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    setIsLoading(true);
    try {
      console.log("Submitting profile update:", values);
      
      const res = await fetch(`/api/user/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          image: values.image || null,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        console.error("Profile update failed:", data);
        throw new Error(data.error || "Failed to update profile");
      }

      console.log("Profile updated successfully:", data);
      toast.success("Profile updated successfully");
      
      // Update image preview if image was changed
      if (values.image) {
        setImagePreview(values.image);
      } else if (!values.image) {
        setImagePreview(null);
      }
      
      // Refresh session to reflect changes immediately
      await refetch();
      
      // Invalidate SWR caches to refresh data across the app
      // Messages cache - will refetch with updated sender names/images
      mutate((key) => typeof key === "string" && key.startsWith("/api/messages"));
      
      // Channels cache - in case user info is displayed there
      mutate("/api/channels");
      
      // Activity feed cache if it exists
      mutate((key) => typeof key === "string" && key.startsWith("/api/activity"));
      
      // Refresh the page to ensure all components update
      router.refresh();
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error?.message || "Error updating profile");
    } finally {
      setIsLoading(false);
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to upload image");
      }

      const fileUrl = data.url as string;
      setImagePreview(fileUrl);
      form.setValue("image", fileUrl, { shouldDirty: true });
      toast.success("Image uploaded");
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast.error(error?.message || "Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    form.setValue("image", "");
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle>My Profile</CardTitle>
        <CardDescription>
          Manage your personal information and profile picture.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.error("Form validation errors:", errors);
              toast.error("Please fix the form errors before submitting");
            })} 
            className="space-y-8"
          >
            {/* Profile Picture Section */}
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 border-2">
                <AvatarImage src={imagePreview || undefined} />
                <AvatarFallback className="text-lg">
                  {getInitials(form.watch("name") || user.name || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 flex-1">
                <FormLabel>Profile Picture</FormLabel>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingImage}
                    onClick={() => document.getElementById("image-upload")?.click()}
                  >
                    {uploadingImage ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {uploadingImage ? "Uploading..." : "Change Image"}
                  </Button>
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveImage}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove Image
                    </Button>
                  )}
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <p className="text-[0.8rem] text-muted-foreground">
                  We support PNGs, JPEGs and GIFs under 2MB.
                </p>
              </div>
            </div>

            <Separator />

            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your full name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input {...field} type="hidden" />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading || uploadingImage}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

