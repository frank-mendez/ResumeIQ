import { rootRoute } from './routes/__root'
import { indexRoute } from './routes/index'
import { loginRoute } from './routes/login'
import { signupRoute } from './routes/signup'
import { pricingRoute } from './routes/pricing'

export const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  pricingRoute,
])
