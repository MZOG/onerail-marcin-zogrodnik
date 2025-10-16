import { cn } from "../lib/utils";

type ContainerProps = {
  type?: "section" | "div";
  children: React.ReactNode;
  className?: string;
};

export default function Container({
  type = "div",
  children,
  className,
}: ContainerProps) {
  if (type === "section") {
    return (
      <section className={cn("px-5 mx-auto max-w-5xl", className)}>
        {children}
      </section>
    );
  }

  return (
    <div className={cn("px-5 mx-auto max-w-5xl", className)}>{children}</div>
  );
}
