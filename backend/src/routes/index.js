import { Router } from 'express'
import { router as authRouter } from './auth.routes.js'
import { router as productRouter } from './product.routes.js'
import { router as categoryRouter } from './category.routes.js'
import { router as reviewRouter } from './review.routes.js'
import { router as cartRouter } from './cart.routes.js'
import { router as wishlistRouter } from './wishlist.routes.js'
import { router as orderRouter } from './order.routes.js'
import { router as userRouter } from './user.routes.js'
import { router as paymentRouter } from './payment.routes.js'
import { router as adminRouter } from './admin.routes.js'
import { router as mediaRouter } from './media.routes.js'
import { router as notificationRouter } from './notification.routes.js'

export const router = Router()
router.use('/auth', authRouter)
router.use('/products', productRouter)
router.use('/categories', categoryRouter)
router.use('/', reviewRouter)
router.use('/cart', cartRouter)
router.use('/wishlist', wishlistRouter)
router.use('/orders', orderRouter)
router.use('/users', userRouter)
router.use('/payments', paymentRouter)
router.use('/admin', adminRouter)
router.use('/media', mediaRouter)
router.use('/notifications', notificationRouter)
