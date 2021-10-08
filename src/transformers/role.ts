import { Bot } from "../bot.ts";
import { Role } from "../types/mod.ts";

export function transformRole(
  bot: Bot,
  payload: { role: Role } & {
    guildId: bigint;
  }
) {
  return {
    // UNTRANSFORMED STUFF HERE
    name: payload.role.name,
    guildId: payload.guildId,
    position: payload.role.position,
    color: payload.role.color,
    bitfield:
      (payload.role.hoist ? 1n : 0n) |
      (payload.role.managed ? 2n : 0n) |
      (payload.role.mentionable ? 4n : 0n) |
      (payload.role.tags?.premiumSubscriber ? 8n : 0n),

    // TRANSFORMED STUFF BELOW
    id: bot.transformers.snowflake(payload.role.id),
    botId: payload.role.tags?.botId ? bot.transformers.snowflake(payload.role.tags.botId) : undefined,
    integrationId: payload.role.tags?.integrationId
      ? bot.transformers.snowflake(payload.role.tags.integrationId)
      : undefined,
    permissions: payload.role.permissions ? bot.transformers.snowflake(payload.role.permissions) : undefined,
  };
}

export interface DiscordenoRole extends Omit<Role, "tags" | "id" | "permissions"> {
  /** The role id */
  id: bigint;
  /** The bot id that is associated with this role. */
  botId?: bigint;
  /** If this role is the nitro boost role. */
  isNitroBoostRole: boolean;
  /** The integration id that is associated with this role */
  integrationId: bigint;
  /** The roles guildId */
  guildId: bigint;
  /** Permission bit set */
  permissions: bigint;
  /** Holds all the boolean toggles. */
  bitfield: bigint;
}
