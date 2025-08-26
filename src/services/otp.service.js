import ApiError from '../utils/ApiError.js';
import cache from '../utils/cache.js';
import crypto from 'crypto'
import emailService from './email.service.js';
class OTP {
    constructor() {
        this.MAX_OTP_ATTEMPTS = 5;
        this.OTP_SECRET = process.env.OTP_SECRET
        this.OTP_EXPIRY = 600

    }

    createOtp() {
        const otp = crypto.randomInt(100000,1000000)
        return otp
    }

    async sendOtp(email) {
        const key = `OTP_${email}`
        const attemptKey = `OTP_ATTEMPT_${email}`

        const otp = this.createOtp();
        const hashedOtp = this.hashOtp(otp);

        await cache.set(key, hashedOtp, this.OTP_EXPIRY)
        await cache.set(attemptKey,0,this.OTP_EXPIRY)
        
        await emailService.sendOtp(email,otp)

    }

    async verifyOtp(email, otp) {
        
        const key = `OTP_${email}`
        const attemptKey = `OTP_ATTEMPT_${email}`

          
        const hashedOtp = this.hashOtp(otp);
        const trueOtp = await cache.get(key);

        if (!trueOtp) throw new ApiError(403, "Otp expired or not found . Please Retry");

        if (!crypto.timingSafeEqual(Buffer.from(trueOtp), Buffer.from(hashedOtp))) {
            const attempted = Number(await cache.get(attemptKey)) || 0
            const remainingAttempts = this.MAX_OTP_ATTEMPTS - (attempted + 1);
            if (remainingAttempts <= 0) {
                throw new ApiError(403, "Maximum Attempts reached . Try again later")
            }

          await  cache.inc(attemptKey)
            throw new ApiError(400, `Invalid Otp : ${remainingAttempts} attempts remaining`);
        }
        
       await cache.del(key);
       await cache.del(attemptKey);

       return true

    }

    hashOtp(otp) {
        const hashedOtp = crypto.createHash("sha256").update(otp + this.OTP_SECRET).digest("hex")
        return hashedOtp
    }
}
export default new OTP();