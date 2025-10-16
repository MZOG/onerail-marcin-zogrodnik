import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <Container className="max-w-2xl bg-gray-50 border flex flex-col justify-center items-center py-10 rounded-2xl mt-5 md:mt-10">
      <h1 className="text-6xl font-bold text-gray-500">404</h1>
      <p className="mb-4">Page not found</p>
      <Button asChild variant="outline">
        <Link to="/">Go back home</Link>
      </Button>
    </Container>
  );
}
