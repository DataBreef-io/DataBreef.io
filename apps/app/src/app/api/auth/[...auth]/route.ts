/**
 * Auth.js v5 dynamic route handler.
 * Maps Auth.js callbacks to Next.js API routes.
 *
 * Endpoint: /api/auth/*
 * Handles: signin, signout, session, callback, csrf, providers
 */

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
