/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as aiUsage from "../aiUsage.js";
import type * as assets from "../assets.js";
import type * as auth from "../auth.js";
import type * as blogs from "../blogs.js";
import type * as branding from "../branding.js";
import type * as collections from "../collections.js";
import type * as crons from "../crons.js";
import type * as generations from "../generations.js";
import type * as http from "../http.js";
import type * as metaApiTest from "../metaApiTest.js";
import type * as payments from "../payments.js";
import type * as posts from "../posts.js";
import type * as publishing from "../publishing.js";
import type * as reviewAccess from "../reviewAccess.js";
import type * as schedulePatterns from "../schedulePatterns.js";
import type * as seedAll from "../seedAll.js";
import type * as socialAccounts from "../socialAccounts.js";
import type * as socialAuth from "../socialAuth.js";
import type * as subscriptions from "../subscriptions.js";
import type * as threadsAuth from "../threadsAuth.js";
import type * as tokenRefresh from "../tokenRefresh.js";
import type * as twitterAuth from "../twitterAuth.js";
import type * as users from "../users.js";
import type * as webhooks from "../webhooks.js";
import type * as websiteCrawls from "../websiteCrawls.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  aiUsage: typeof aiUsage;
  assets: typeof assets;
  auth: typeof auth;
  blogs: typeof blogs;
  branding: typeof branding;
  collections: typeof collections;
  crons: typeof crons;
  generations: typeof generations;
  http: typeof http;
  metaApiTest: typeof metaApiTest;
  payments: typeof payments;
  posts: typeof posts;
  publishing: typeof publishing;
  reviewAccess: typeof reviewAccess;
  schedulePatterns: typeof schedulePatterns;
  seedAll: typeof seedAll;
  socialAccounts: typeof socialAccounts;
  socialAuth: typeof socialAuth;
  subscriptions: typeof subscriptions;
  threadsAuth: typeof threadsAuth;
  tokenRefresh: typeof tokenRefresh;
  twitterAuth: typeof twitterAuth;
  users: typeof users;
  webhooks: typeof webhooks;
  websiteCrawls: typeof websiteCrawls;
  workspaces: typeof workspaces;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
