import { GraphQLBoolean, GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { UUIDType } from './uuid.js';
import { MemberType } from './member-type.js';
import { MemberTypeId } from './member-type-id.js';

export const Profile = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    isMale: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    yearOfBirth: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    memberType: {
      type: new GraphQLNonNull(MemberType),
      resolve: async (profile, _args, ctx) => {
        return await ctx.memberType.findUnique({
          where: {
            id: profile.memberTypeId,
          },
        });
      },
    },
    userId: {
      type: new GraphQLNonNull(UUIDType),
    },
    memberTypeId: {
      type: new GraphQLNonNull(MemberTypeId),
    },
  }),
});
