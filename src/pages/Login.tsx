import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import Container from "@/components/Container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      setError("Ops, something went wrong.");
    }
  };

  return (
    <Container className="flex justify-center mt-10">
      <Card className="min-w-sm shadow-none">
        <CardHeader>Login</CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <Input
              type="text"
              placeholder="Email"
              className="border p-2 rounded"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              className="border p-2 rounded"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit">Sign In</Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
