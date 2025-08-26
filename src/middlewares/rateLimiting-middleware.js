import { rateLimit ,ipKeyGenerator} from "express-rate-limit";


const strictRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many attempts from this IP. Please try again in 15 minutes.',
        errors: [{
            field: 'rateLimit',
            message: 'Request limit exceeded'
        }]
    },
    skip: (req) => req.user?.role === "ADMIN",
    keyGenerator: (req) => {
        if (req.user) return `user_${req.user.id}_${req.method}_${req.route?.path || req.path}`; 
        else if (req.body?.email && (req.path.includes('/login') || req.path.includes('/register')))
            return `auth_${ipKeyGenerator(req)}_${req.body.email}`
        else return `ip_${ipKeyGenerator(req)}_${req.method}_${req.path}`;

    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many attempts from this IP. Please try again in 15 minutes.',
            errors: [{
                field: 'rateLimit',
                message: 'Request limit exceeded'
            }]
        })
    },
    skipSuccessfulRequests: true,
   

})

const moderateRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    skip: (req) => req.user?.role === "ADMIN",
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        if (req.user) return `user_${req.user.id}_${req.method}_${req.route?.path || req.path}`; 
        else return `ip_${ipKeyGenerator(req)}_${req.method}_${req.path}`;
    },
    message: {
        success: false,
        message: 'Too many requests. Please slow down.',
        errors: [{
            field: 'rateLimit',
            message: 'Request rate too high'
        }]
    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests. Please slow down.',
            errors: [{
                field: 'rateLimit',
                message: 'Request rate too high'
            }]
        })
    },
    skipSuccessfulRequests: true,
   

})

const gentleRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    skip: (req) => req.user?.role === "ADMIN",
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        if (req.user) return `user_${req.user.id}_${req.method}_${req.route?.path || req.path}`;  
        else return `ip_${ipKeyGenerator(req)}_${req.method}_${req.path}`;
    },
    message: {
        success: false,
        message: 'Request limit exceeded for public endpoints.',
        errors: [{
            field: 'rateLimit',
            message: 'Too many requests from this IP'
        }]
    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Request limit exceeded for public endpoints.',
            errors: [{
                field: 'rateLimit',
                message: 'Too many requests from this IP'
            }]
        })
    },
    skipSuccessfulRequests: true
})

export { strictRateLimit, moderateRateLimit, gentleRateLimit }