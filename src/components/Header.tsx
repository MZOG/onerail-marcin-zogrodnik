import { Link } from "react-router-dom";
import Container from "./Container";
import { useAuthStore } from "../store/useAuthStore";
import UserAvatar from "./UserAvatar";

export default function Header() {
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="py-5">
      <Container className="flex justify-between items-center">
        <div>
          <Link className="text-sm font-semibold" to="/">
            FakeStore
          </Link>
        </div>

        <div className="text-sm flex gap-10 items-center">
          <Link to="/">Products</Link>

          {isAuthenticated ? (
            <>
              <Link to="/products/new">Add new product</Link>
              <UserAvatar />
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
