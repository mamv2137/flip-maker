import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.MAGIC_LINK_SECRET || 'dev-secret-change-in-production',
)

type MagicLinkPayload = {
  grantId: string
  bookId: string
  email: string
}

export async function createMagicLinkToken(
  payload: MagicLinkPayload,
): Promise<string> {
  return new SignJWT({
    grantId: payload.grantId,
    bookId: payload.bookId,
    email: payload.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('flipbooks')
    .sign(secret)
}

export async function verifyMagicLinkToken(
  token: string,
): Promise<MagicLinkPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'flipbooks',
    })
    return {
      grantId: payload.grantId as string,
      bookId: payload.bookId as string,
      email: payload.email as string,
    }
  } catch {
    return null
  }
}
