import { productHandlers } from './products'
import { orderHandlers } from './orders'
import { promotionHandlers } from './promotions'
import { miscHandlers } from './misc'

export const handlers = [...productHandlers, ...orderHandlers, ...promotionHandlers, ...miscHandlers]
