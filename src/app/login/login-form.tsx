"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");

  const [error, setError] = useState<string | null>(callbackError);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await login(formData);

      if (result?.error) {
        setError(result.error);
      }
    } catch {
      setError("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="relative w-full max-w-md overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-primary-dark to-brand-primary" />
        <CardHeader className="pt-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-full.svg" alt="StrategAIze" className="mx-auto mb-2 h-12 w-auto" />
          <CardTitle className="text-2xl text-slate-900">Login</CardTitle>
          <CardDescription>
            Melden Sie sich mit Ihren Zugangsdaten an.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {callbackError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{callbackError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@unternehmen.de"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Passwort"
                required
                autoComplete="current-password"
              />
            </div>
            {error && !callbackError && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Anmelden..." : "Anmelden"}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-slate-400">
            Kein Account? Der Zugang erfolgt ausschließlich per Einladung.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
