import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { z } from "zod"

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate request body
    const validatedData = registerSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validatedData.error.format() },
        { status: 400 }
      )
    }

    const { firstName, lastName, email, password } = validatedData.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      )
    }

    // Hash the password using Node built-in crypto (PBKDF2) — no external deps
    const hashedPassword = hashPassword(password)

    // Create the user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
      },
    })

    // Strip the password from the response
    const userWithoutPassword = { ...user }
    // @ts-expect-error - removing password property
    delete userWithoutPassword.password

    return NextResponse.json(
      { message: "User registered successfully", user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error: unknown) {
    // Log the full error for debugging
    console.error("Registration error:", error)

    // In development, expose the actual error message so we can debug it
    const isDev = process.env.NODE_ENV === "development"
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        error: "Something went wrong during registration",
        ...(isDev && { debug: message }),
      },
      { status: 500 }
    )
  }
}
