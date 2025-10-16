import { useEffect, useState } from "react";
import Container from "../components/Container";
import { useAuthStore } from "../store/useAuthStore";
import type { User } from "../types/User";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/axios";

// Define Zod schema for user validation
const UserValidation = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name is too long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password should have minimum length of 8" })
    .regex(/^(?=.*[A-Z]).{8,}$/, {
      message:
        "Password must contain at least one uppercase letter and have a minimum length of 8 characters",
    })
    .optional(), // Password is optional for updates
});

// Define input type for updates (excluding fields like id, updatedAt)
type UserUpdateInput = z.infer<typeof UserValidation>;

const fetchUser = async () => {
  const { data } = await api.get("auth/profile");
  return data as User;
};

export default function Settings() {
  const { logout } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
  });

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  // Handle update user
  const handleUpdate = async () => {
    if (!user) {
      toast.error("No user data available to update");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = UserValidation.safeParse({
        name: user.name,
        email: user.email,
        password: user.password || undefined, // Handle empty password
      });

      if (!result.success) {
        result.error.issues.forEach((issue) => toast.error(issue.message));
        return;
      }

      const { data } = await api.put(`users/${user.id}`, result.data);

      setUser((prev) => ({ ...prev!, ...data })); // Update local state with new data
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "An error occurred while updating your profile"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof UserUpdateInput, value: string) => {
    setUser((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  if (isLoading) {
    return (
      <Container className="flex justify-center mt-10">
        <Spinner />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <p>No user data found</p>
      </Container>
    );
  }

  return (
    <Container className="max-w-3xl">
      <div className="bg-gray-50 p-10 rounded-xl space-y-5">
        <div className="grid w-full max-w-sm items-center gap-3">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            value={user.name}
            className="bg-white shadow-none"
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>

        <div className="grid w-full max-w-sm items-center gap-3">
          <Label htmlFor="email">E-mail</Label>
          <Input
            type="email"
            id="email"
            value={user.email}
            className="bg-white shadow-none"
            onChange={(e) => updateField("email", e.target.value)}
          />
        </div>

        <div className="grid w-full max-w-sm items-center gap-3">
          <Label htmlFor="password">
            Password (leave blank to keep unchanged)
          </Label>
          <Input
            type="password"
            id="password"
            value={user.password || ""}
            className="bg-white shadow-none"
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="Enter new password"
          />
        </div>

        <div className="grid w-full max-w-sm items-center gap-3">
          <Label>
            Last updated: {new Date(user.updatedAt).toLocaleString()}
          </Label>
        </div>
      </div>

      <div className="mt-10">
        <Button onClick={handleUpdate} size="sm" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : "Save"}
        </Button>
      </div>

      <div className="mt-10">
        <Button variant="destructive" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </Container>
  );
}
