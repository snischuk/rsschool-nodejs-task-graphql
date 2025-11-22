import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { ChangeUserInput, CreateUserInput, User } from './types/user.js';
import { ChangeProfileInput, CreateProfileInput, Profile } from './types/profile.js';
import { ChangePostInput, CreatePostInput, Post } from './types/post.js';
import { UUIDType } from './types/uuid.js';

export const rootMutation = new GraphQLObjectType({
  name: 'rootMutation',
  fields: () => ({
    createUser: {
      type: new GraphQLNonNull(User),
      args: { dto: { type: new GraphQLNonNull(CreateUserInput) } },
      resolve: async (_, args, ctx) => {
        return await ctx.user.create({ data: args.dto });
      },
    },
    createProfile: {
      type: new GraphQLNonNull(Profile),
      args: { dto: { type: new GraphQLNonNull(CreateProfileInput) } },
      resolve: async (_, args, ctx) => {
        return await ctx.profile.create({ data: args.dto });
      },
    },
    createPost: {
      type: new GraphQLNonNull(Post),
      args: { dto: { type: new GraphQLNonNull(CreatePostInput) } },
      resolve: async (_, args, ctx) => {
        return await ctx.post.create({ data: args.dto });
      },
    },
    changePost: {
      type: new GraphQLNonNull(Post),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangePostInput) },
      },
      resolve: async (_, args, ctx) => {
        return await ctx.post.update({
          where: {
            id: args.id,
          },
          data: args.dto,
        });
      },
    },
    changeProfile: {
      type: new GraphQLNonNull(Profile),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInput) },
      },
      resolve: async (_, args, ctx) => {
        return await ctx.profile.update({
          where: {
            id: args.id,
          },
          data: args.dto,
        });
      },
    },
    changeUser: {
      type: new GraphQLNonNull(User),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInput) },
      },
      resolve: async (_, args, ctx) => {
        return await ctx.user.update({
          where: {
            id: args.id,
          },
          data: args.dto,
        });
      },
    },
    deleteUser: {
      type: new GraphQLNonNull(GraphQLString),
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, args, ctx) => {
        await ctx.user.delete({
          where: {
            id: args.id,
          },
        });
        return '';
      },
    },
    deletePost: {
      type: new GraphQLNonNull(GraphQLString),
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, args, ctx) => {
        await ctx.post.delete({
          where: {
            id: args.id,
          },
        });
        return '';
      },
    },
    deleteProfile: {
      type: new GraphQLNonNull(GraphQLString),
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, args, ctx) => {
        await ctx.profile.delete({
          where: {
            id: args.id,
          },
        });
        return '';
      },
    },
    subscribeTo: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, args, ctx) => {
        await ctx.subscribersOnAuthors.create({
          data: {
            subscriberId: args.userId,
            authorId: args.authorId,
          },
        });
        return '';
      },
    },
    unsubscribeFrom: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, args, ctx) => {
        await ctx.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: args.userId,
              authorId: args.authorId,
            },
          },
        });
        return '';
      },
    },
  }),
});
