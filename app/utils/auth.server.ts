import { createServerFn } from '@tanstack/start/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '~/lib/supabase.server'
import { setCookie } from 'vinxi/http'

// Schema for sign up
const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

// Schema for sign in
const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// Server function to sign up
export const signUp = createServerFn()
  .validator(signUpSchema)
  .handler(async ({ data, request }) => {
    const headers = request.headers
    const supabase = createSupabaseServerClient(headers)

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (error) {
      throw new Error(error.message)
    }

    // Set auth cookies
    if (authData.session) {
      setCookie('sb-access-token', authData.session.access_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      setCookie('sb-refresh-token', authData.session.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }

    return { user: authData.user, session: authData.session }
  })

// Server function to sign in
export const signIn = createServerFn()
  .validator(signInSchema)
  .handler(async ({ data, request }) => {
    const headers = request.headers
    const supabase = createSupabaseServerClient(headers)

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      throw new Error(error.message)
    }

    // Set auth cookies
    if (authData.session) {
      setCookie('sb-access-token', authData.session.access_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      setCookie('sb-refresh-token', authData.session.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }

    return { user: authData.user, session: authData.session }
  })

// Server function to sign out
export const signOut = createServerFn().handler(
  async ({ request }) => {
    const headers = request.headers
    const supabase = createSupabaseServerClient(headers)

    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }

    // Clear auth cookies
    setCookie('sb-access-token', '', {
      path: '/',
      maxAge: 0,
    })

    setCookie('sb-refresh-token', '', {
      path: '/',
      maxAge: 0,
    })

    return { success: true }
  }
)

// Server function to get current user
export const getCurrentUser = createServerFn().handler(
  async ({ request }) => {
    const headers = request.headers
    const supabase = createSupabaseServerClient(headers)

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  }
)
