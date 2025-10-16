import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { registerUser, type RegisterProps } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import Container from "@/components/Container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SEO from "@/components/SEO";

interface ApiErrorResponse {
  message?: string;
}

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  avatar: z.string().url("Invalid avatar URL"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    avatar:
      "https://fastly.picsum.photos/id/375/200/200.jpg?hmac=A1gXQqzqNEhroMUd97Taqu13iN0muhMXBAeJOzBTASI",
  });

  const mutation = useMutation<
    RegisterProps,
    AxiosError<ApiErrorResponse>,
    RegisterFormData
  >({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("Account created successfully!");
      setFormData({
        name: "",
        email: "",
        password: "",
        avatar:
          "https://fastly.picsum.photos/id/375/200/200.jpg?hmac=A1gXQqzqNEhroMUd97Taqu13iN0muhMXBAeJOzBTASI",
      });
      navigate("/login");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = registerSchema.safeParse(formData);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid input";
      toast.error(message);
      return;
    }

    mutation.mutate(parsed.data);
  };

  return (
    <>
      <SEO title="Create an Account" />
      <Container className="flex justify-center mt-10">
        <Card className="min-w-sm shadow-none">
          <CardHeader>Create an Account</CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                />
              </div>

              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Registering..." : "Register"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
