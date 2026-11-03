import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { JoinForm } from "../components/player/JoinForm";
import { queueApi } from "../services/api";
import type { MatchType, SkillLevel } from "../types";
import { Page, Container, Grid, Flex, Card, Badge } from "../components";

export default function PlayerView() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function handleJoin(data: {
    name: string;
    phone?: string;
    skill_level?: SkillLevel;
    match_type: MatchType;
  }) {
    setBusy(true);
    try {
      const entry = await queueApi.selfRegister(data);
      const token = entry.player?.qr_token;
      if (token) navigate(`/status/${token}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page withBackground>
      <Container size="xl" className="py-8 sm:py-14">
        <Grid cols={2} gap={8} className="items-center lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <section className="px-1 sm:px-4">
            <Badge variant="primary" dot dotColor="var(--color-primary-500)" className="text-xs">
              Pickleball · Queue check-in
            </Badge>
            <h1 className="mt-5 max-w-lg text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
              Get in line.
              <span className="block text-primary-600 dark:text-primary-400">Get on court.</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-text-secondary">
              Join the queue and keep your spot handy. The front desk will confirm your registration, then your player page will show your place and match updates.
            </p>
            <Grid cols={2} gap={3} className="mt-7 max-w-md">
              <Card variant="bordered" className="p-4">
                <p className="text-sm font-bold text-text-primary">Choose your format</p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">Singles, doubles, or either format.</p>
              </Card>
              <Card variant="bordered" className="p-4">
                <p className="text-sm font-bold text-text-primary">Track your turn</p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">Follow your queue position and upcoming match.</p>
              </Card>
            </Grid>
          </section>
          <section>
            <Flex direction="col" gap={1} className="mb-3 px-1">
              <p className="text-sm font-semibold text-text-primary">Join the queue</p>
              <p className="text-xs text-text-secondary">A few details help staff confirm your spot.</p>
            </Flex>
            <JoinForm busy={busy} onJoin={handleJoin} />
          </section>
        </Grid>
      </Container>
    </Page>
  );
}