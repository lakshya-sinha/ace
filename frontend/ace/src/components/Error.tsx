
"use client";

import { Link, useCanGoBack, useRouter  } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  Home,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  code?: string;
  title?: string;
  message: string;
  showHomeButton?: boolean;
}

export default function ErrorPage({
  code = "ERROR",
  title = "Something went wrong",
  message,
  showHomeButton = true,
}: ErrorPageProps) {
    const router = useRouter()
    const canGoBack = useCanGoBack();
  return (
    <main className="flex  items-center justify-center bg-background ">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border bg-muted">
          <CircleAlert className="h-8 w-8 text-destructive" />
        </div>

        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-destructive">
          {code}
        </p>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>

        <p
          role="alert"
          className="mt-4 text-base leading-7 text-muted-foreground"
        >
          {message}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {showHomeButton && (
            <Button  className="gap-2">
              <Link to="/" className="flex gap-2">
                <Home className="h-4 w-10" />
                Back to home
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.history.back()}
            disabled={!canGoBack}
          >
            <ArrowLeft className="h-4 w-6" />
            Go back
          </Button>
        </div>
      </div>
    </main>
  );
}
