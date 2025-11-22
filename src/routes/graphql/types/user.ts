import {
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { Profile } from './profile.js';
import { Post } from './post.js';
import DataLoader from 'dataloader';

export const User = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    balance: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    profile: {
      type: Profile,
      resolve: async (user, _args, ctx, _info) => {
        let dl = ctx.dataLoaders.dlProfiles;
        if (!dl) {
          dl = new DataLoader(async (ids: readonly String[]) => {
            const profiles = await ctx.prisma.profile.findMany({
              where: {
                userId: {
                  in: ids,
                },
              },
            });
            return ids.map((id) => profiles.find((profile) => profile.userId == id));
          });
          ctx.dataLoaders.dlProfiles = dl;
        }
        return await dl.load(user.id);
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
      resolve: async (user, _args, ctx, _info) => {
        let dl = ctx.dataLoaders.dlPost;
        if (!dl) {
          dl = new DataLoader(async (ids: readonly String[]) => {
            const posts = await ctx.prisma.post.findMany({
              where: {
                authorId: {
                  in: ids,
                },
              },
            });
            return ids.map((id) => posts.filter((post) => post.authorId == id));
          });
          ctx.dataLoaders.dlPost = dl;
        }
        return await dl.load(user.id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (user, _args, ctx, _info) => {
        let dl = ctx.dataLoaders.dlUserSubscribedTo;
        if (!dl) {
          dl = new DataLoader(async (ids: readonly String[]) => {
            const users = await ctx.prisma.user.findMany({
              where: {
                subscribedToUser: {
                  some: {
                    subscriberId: { in: ids as String[] },
                  },
                },
              },
              include: { subscribedToUser: true },
            });
            return ids.map((id) =>
              users.filter((user) =>
                user.subscribedToUser.some(
                  (subscriber) => subscriber.subscriberId === id,
                ),
              ),
            );
          });
          ctx.dataLoaders.dlUserSubscribedTo = dl;
        }
        return await dl.load(user.id);
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (user, _args, ctx, _info) => {
        let dl = ctx.dataLoaders.dlSubscribedToUser;
        if (!dl) {
          dl = new DataLoader(async (ids: readonly String[]) => {
            const users = await ctx.prisma.user.findMany({
              where: {
                userSubscribedTo: {
                  some: {
                    authorId: { in: ids },
                  },
                },
              },
              include: { userSubscribedTo: true },
            });
            return ids.map((id) =>
              users.filter((user) =>
                user.userSubscribedTo.some((author) => author.authorId === id),
              ),
            );
          });
          ctx.dataLoaders.dlSubscribedToUser = dl;
        }
        return await dl.load(user.id);
      },
    },
  }),
});

export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  }),
});

export const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }),
});
