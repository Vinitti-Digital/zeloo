"use client";

import { useActionState } from "react";

import { createUserGroupAction, type ActionState } from "@/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = {};

export function CreateUserGroupForm() {
  const [state, formAction, pending] = useActionState(
    createUserGroupAction,
    initialState,
  );

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>Create a user group</CardTitle>
        <CardDescription>
          You become OWNER automatically. Invite members later.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state.error ? (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Home Mateus & Micka"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="Optional short description"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={pending}>
            {pending ? "Creating..." : "Create group"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
