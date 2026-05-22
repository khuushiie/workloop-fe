/** Subscription tiers used across org billing and license APIs. */
export enum SubscriptionPlan {
  STARTER = "STARTER",
  GROWTH = "GROWTH",
  ENTERPRISE = "ENTERPRISE",
}

export function isSubscriptionPlan(
  value: string | undefined | null,
): value is SubscriptionPlan {
  if (value == null || value === "") return false;
  return (Object.values(SubscriptionPlan) as string[]).includes(value);
}
