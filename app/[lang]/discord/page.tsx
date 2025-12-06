import { redirect } from "next/navigation";

// Force dynamic rendering since we're using redirect()
export const dynamic = 'force-dynamic';

export default function DiscordRedirect() {
  redirect("https://discord.com/invite/makcu");
}

