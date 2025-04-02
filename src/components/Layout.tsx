
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeProvider } from "@/context/ThemeContext";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <header className="border-b border-border">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                DenoiseDreamer
              </span>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <main className="container px-4 py-8">{children}</main>
        <footer className="border-t border-border py-6">
          <div className="container px-4 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} DenoiseDreamer. All rights reserved.
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
