export const RoleNames = {
  Owner: 'Owner',
  Staff: 'Staff',
  PlatformAdmin: 'PlatformAdmin',
} as const;

export type RoleName = (typeof RoleNames)[keyof typeof RoleNames];
