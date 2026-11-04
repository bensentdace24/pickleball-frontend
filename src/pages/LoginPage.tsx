import { useRef, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Alert } from "../components/Feedback";
import { authApi } from "../services/api";
import { getToken, saveAuth } from "../services/auth";
import { Card, Input, Field } from "../components";
import { Badge } from "../components/Badge";
import { Page, Container, Flex } from "../components/layout/Page";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);

  if (getToken()) return <Navigate to="/admin" replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      const { token, user } = await authApi.login(email.trim(), password);
      saveAuth(token, user);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <Page withBackground className="min-h-screen">
      <div className="page-hero fixed inset-0 z-0" aria-hidden="true" />
      <Container size="sm" className="py-12 relative z-10">
        <Flex direction="col" align="center" className="w-full">
          <Card variant="elevated" className="w-full max-w-sm p-6 sm:p-8 animate-modal-in">
            <div className="text-center mb-6 sm:mb-8">
              <Badge variant="primary" dot className="mb-3 text-label animate-count-up">
                Pickleball Queue
              </Badge>
              <h1 className="text-h2 font-bold text-text-primary">Staff Login</h1>
              <p className="mt-1 text-body text-text-secondary">Front desk access</p>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-4">
              <Field label="Email" required>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                  placeholder="staff@club.com"
                  autoFocus
                />
              </Field>

              <Field label="Password" required>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                />
              </Field>

              {error && <Alert type="error" className="animate-modal-in">{error}</Alert>}

              <Button
                type="submit"
                className="w-full hover-lift"
                disabled={busy || !email || !password}
              >
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </Card>
          <p className="mt-6 text-center text-label text-text-tertiary">
            MJ Pickle Hub · Club Management
          </p>
        </Flex>
      </Container>
    </Page>
  );
}