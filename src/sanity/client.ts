import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "./env";

/**
 * Read-only client for published content, served from Sanity's CDN.
 *
 * No token is required for public datasets. If draft previews / live
 * content are added later, create a separate client with
 * `token: process.env.SANITY_API_READ_TOKEN` and `useCdn: false`.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});
