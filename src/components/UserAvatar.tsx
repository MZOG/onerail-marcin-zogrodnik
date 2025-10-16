import { useEffect, useState } from "react";
import { fetchWithAuth } from "../lib/auth-fetch";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";
import type { User } from "../types/User";

export default function UserAvatar() {
  const [user, setUser] = useState<Pick<User, "avatar" | "name">>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchWithAuth("auth/profile", { method: "GET" });
        setUser(response);
      } catch (err) {
        console.error("oops", err);
      }
    };

    fetchData();
  }, []);

  if (!user) return;

  return (
    <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
      <img src={user.avatar} alt={user.name} className="size-6 rounded-full" />
      <p>Hi, {user.name}</p>
      <Settings size={16} />
    </Link>
  );
}
