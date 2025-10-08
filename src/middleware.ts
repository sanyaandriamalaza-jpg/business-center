import { NextRequest, NextResponse } from 'next/server'
import { Company } from './lib/type'
import { baseUrl } from './lib/utils'

export async function middleware(request: NextRequest) {
  if (request.headers.get('x-no-middleware') === 'true') {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl
  const method = request.method
  const nextUrl = request.nextUrl.clone()


  if (method === 'OPTIONS') {
    const response = new Response(null, { status: 204 })
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  }

  const pathParts = pathname.split('/').filter(Boolean)
  const knownPaths = ['api', 'home', 'about', 'docs', 'login', 'admin', 'super-admin', 'dashboard', 'domiciliation', 'uploads']

  if (pathParts.length >= 1) {
    const slug = pathParts[0]

    if (!knownPaths.includes(slug)) {
      try {
        const res = await fetch(`${baseUrl}/api/company?slug=${slug}`, {
          headers: {
            'Content-Type': 'application/json',
            'x-no-middleware': 'true',
          }
        })

        if (!res.ok) {
          throw new Error(`Échec de la requête: ${res.status}`)
        }

        const data = await res.json()

        if (data.success && data.count > 0) {
          const company: Company = data.data[0]
          const theme = company.theme

          if (pathParts.length === 1) {
            const redirectUrl = nextUrl.clone()

            if (company.reservationIsActive) {
              redirectUrl.pathname = `/${company.slug}/spaces`
            } else if (company.virtualOfficeIsActive) {
              redirectUrl.pathname = `/${company.slug}/business-address`
            } else {
              redirectUrl.pathname = '/'
            }
            const response = NextResponse.redirect(redirectUrl)
            if (theme) {
              response.cookies.set('backgroundColor', theme.backgroundColor, { path: '/', maxAge: 60 * 60 * 24 * 7 })
              response.cookies.set('primaryColor', theme.primaryColor, { path: '/', maxAge: 60 * 60 * 24 * 7 })
              response.cookies.set('primaryColorHover', theme.primaryColorHover, { path: '/', maxAge: 60 * 60 * 24 * 7 })
              response.cookies.set('foregroundColor', theme.foregroundColor, { path: '/', maxAge: 60 * 60 * 24 * 7 })
              response.cookies.set('standardColor', theme.standardColor, { path: '/', maxAge: 60 * 60 * 24 * 7 })
            }
            return response
          } else {

            const response = NextResponse.next()

            const maxAge = 60 * 60 * 24 * 7;
            if (pathParts.some(path => path === 'admin')) {
              response.cookies.set('backgroundColor', '255 255 255', { path: '/', maxAge });
              response.cookies.set('primaryColor', '67 44 215', { path: '/', maxAge });
              response.cookies.set('primaryColorHover', '97 95 255', { path: '/', maxAge });
              response.cookies.set('foregroundColor', '255 255 255', { path: '/', maxAge });
              response.cookies.set('standardColor', '37 38 38', { path: '/', maxAge });
            } else {
              if (theme) {
                response.cookies.set('backgroundColor', theme.backgroundColor, { path: '/', maxAge: 60 * 60 * 24 * 7 })
                response.cookies.set('primaryColor', theme.primaryColor, { path: '/', maxAge: 60 * 60 * 24 * 7 })
                response.cookies.set('primaryColorHover', theme.primaryColorHover, { path: '/', maxAge: 60 * 60 * 24 * 7 })
                response.cookies.set('foregroundColor', theme.foregroundColor, { path: '/', maxAge: 60 * 60 * 24 * 7 })
                response.cookies.set('standardColor', theme.standardColor, { path: '/', maxAge: 60 * 60 * 24 * 7 })
              }
            }

            return response
          }
        } else {
          console.log(`Company ${slug} n'existe pas, redirection vers l'accueil`)
          return NextResponse.redirect(new URL('/', request.url))
        }
      } catch (error) {
        console.error('Erreur dans le middleware de redirection :', error)
        return NextResponse.redirect(new URL('/', request.url))
      }
    } else {
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|images|assets|api).*)'],
}