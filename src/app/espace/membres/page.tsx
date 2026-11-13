"use client";

import { useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import { Avatar, Badge, Field, FormActions, Grid2, ListRow, PageHead, Panel, Paragraph, RowMain, Stack } from "@/components/ui/Primitives";
import { useWorkspace } from "@/context/WorkspaceContext";

export default function MembersPage() {
  const { state, invite, acceptInvite, declineInvite } = useWorkspace();
  const [email, setEmail] = useState("kofi@example.com");
  const [role, setRole] = useState("Contribuer");

  return (
    <>
      <PageHead crumb="PROJET / MEMBRES" title="Membres et invitations" description="Le propriétaire choisit qui peut consulter ou contribuer." />
      <Tabs />
      <Grid2>
        <Panel
          as="form"
          onSubmit={(e) => {
            e.preventDefault();
            invite(email, role);
          }}
        >
          <h2>Inviter un collaborateur</h2>
          <Paragraph>Une invitation donne accès au projet selon le droit choisi.</Paragraph>
          <Stack>
            <Field label="Adresse e-mail" htmlFor="inviteEmail">
              <input id="inviteEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Field label="Droit d’accès" htmlFor="inviteRole">
              <select id="inviteRole" value={role} onChange={(e) => setRole(e.target.value)}>
                <option>Contribuer</option>
                <option>Consulter</option>
              </select>
            </Field>
          </Stack>
          <FormActions>
            <Button variant="primary" type="submit">
              Envoyer l’invitation <LuArrowRight />
            </Button>
          </FormActions>
        </Panel>

        <Panel>
          <h2>Membres du projet</h2>
          <ListRow>
            <Avatar initials="AM" />
            <RowMain title="Aïcha Mensah" sub="Propriétaire" />
            <Badge>Propriétaire</Badge>
          </ListRow>
          {state.invited ? (
            <ListRow>
              <Avatar initials="KD" />
              <RowMain title="Kofi Diallo" sub={`${state.inviteRole} · ${state.inviteAccepted ? "Membre" : "Invitation envoyée"}`} />
              {state.inviteAccepted ? (
                <Badge>Acceptée</Badge>
              ) : (
                <>
                  <Button variant="primary" size="sm" onClick={acceptInvite}>
                    Accepter
                  </Button>
                  <Button variant="outline" size="sm" onClick={declineInvite}>
                    Refuser
                  </Button>
                </>
              )}
            </ListRow>
          ) : (
            <Paragraph>Aucun collaborateur invité pour le moment.</Paragraph>
          )}
        </Panel>
      </Grid2>
    </>
  );
}
