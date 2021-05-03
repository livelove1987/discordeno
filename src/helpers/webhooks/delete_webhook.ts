import { rest } from "../../rest/rest.ts";
import { endpoints } from "../../util/constants.ts";
import { requireBotChannelPermissions } from "../../util/permissions.ts";

/** Delete a webhook permanently. Requires the `MANAGE_WEBHOOKS` permission. Returns a undefined on success */
export async function deleteWebhook(channelId: bigint, webhookId: bigint) {
  await requireBotChannelPermissions(channelId, ["MANAGE_WEBHOOKS"]);

  return await rest.runMethod<undefined>(
    "delete",
    endpoints.WEBHOOK_ID(webhookId),
  );
}
