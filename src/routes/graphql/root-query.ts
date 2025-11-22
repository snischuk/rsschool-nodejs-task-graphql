import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { Post } from './types/post.js';
import { User } from './types/user.js';
import { MemberType } from './types/member-type.js';
import { Profile } from './types/profile.js';
import { UUIDType } from './types/uuid.js';
import { MemberTypeId } from './types/member-type-id.js';
import { parseResolveInfo } from 'graphql-parse-resolve-info';
import DataLoader from 'dataloader';

export const rootQuery = new GraphQLObjectType({
  name: 'rootQuery',
  fields: () => ({
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberType))),
      resolve: async (_, _args, ctx) => {
        return await ctx.prisma.memberType.findMany();
      },
    },
    memberType: {
      type: MemberType,
      args: {
        id: {
          type: new GraphQLNonNull(MemberTypeId),
        },
      },
      resolve: async (_, args, ctx) => {
        return await ctx.prisma.memberType.findUnique({
          where: {
            id: args.id,
          },
        });
      },
    },
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (_, _args, ctx, info) => {
        const parsedResolveInfo = parseResolveInfo(info);

        const isIncludeSubscriptions = Object.keys(
          parsedResolveInfo?.fieldsByTypeName?.User || {},
        ).includes('userSubscribedTo');

        const isIncludeSubscribers = Object.keys(
          parsedResolveInfo?.fieldsByTypeName.User || {},
        ).includes('subscribedToUser');

        const users = await ctx.prisma.user.findMany({
          include: {
            userSubscribedTo: isIncludeSubscriptions,
            subscribedToUser: isIncludeSubscribers,
          },
        });

        if (isIncludeSubscriptions) {
          if (!ctx.dataLoaders.dlUserSubscribedTo) {
            ctx.dataLoaders.dlUserSubscribedTo = new DataLoader(
              async (_ids: readonly String[]) => {
                return [];
              },
            );
          }
          users.forEach((subscriber) => {
            const authorIds = subscriber.userSubscribedTo.map(
              (author) => author.authorId,
            );
            ctx.dataLoaders.dlUserSubscribedTo.prime(
              subscriber.id,
              users.filter((user) => authorIds.includes(user.id)),
            );
          });
        }

        if (isIncludeSubscribers) {
          if (!ctx.dataLoaders.dlSubscribedToUser) {
            ctx.dataLoaders.dlSubscribedToUser = new DataLoader(
              async (ids: readonly String[]) => {
                return [];
              },
            );
          }

          users.forEach((author) => {
            const subscriberIds = author.subscribedToUser.map(
              (subscriber) => subscriber.subscriberId,
            );
            ctx.dataLoaders.dlSubscribedToUser.prime(
              author.id,
              users.filter((user) => subscriberIds.includes(user.id)),
            );
          });
        }

        return users;
      },
    },
    user: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, args, ctx) => {
        return await ctx.prisma.user.findUnique({
          where: {
            id: args.id,
          },
        });
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
      resolve: async (_, args, ctx) => {
        return await ctx.prisma.post.findMany();
      },
    },
    post: {
      type: Post,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, args, ctx) => {
        return await ctx.prisma.post.findUnique({
          where: {
            id: args.id,
          },
        });
      },
    },
    profiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Profile))),
      resolve: async (_, _args, ctx) => {
        return await ctx.prisma.profile.findMany();
      },
    },
    profile: {
      type: Profile,
      args: {
        id: {
          type: new GraphQLNonNull(UUIDType),
        },
      },
      resolve: async (_, args, ctx) => {
        return await ctx.prisma.profile.findUnique({
          where: {
            id: args.id,
          },
        });
      },
    },
  }),
});
