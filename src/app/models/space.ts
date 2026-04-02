export interface Space {
  spaceId: string;
  name: string;
  type: 'personal' | 'shared';
  ownerId: string;
  role: string;
}
