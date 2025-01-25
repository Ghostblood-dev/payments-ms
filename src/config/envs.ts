

import 'dotenv/config'
import * as joi from 'joi'

interface EnvVars {
    PORT: number;
    STRIPE_SECRET: string
    ENDPOINT_SECRET_HOOKDECK: string
    SUCCESS_URL: string,
    CANCEL_URL: string,
}

const envsSchema = joi.object({
    PORT: joi.number().required(),
    STRIPE_SECRET: joi.string().required(),
    ENDPOINT_SECRET_HOOKDECK: joi.string().required(),
    SUCCESS_URL: joi.string().required(),
    CANCEL_URL: joi.string().required(),
}).unknown(true)

const { error, value } = envsSchema.validate(process.env)

if (error) {
    throw new Error(`Config validation error ${error.message}`)
}

const envsVars: EnvVars = value

export const envs = {
    port: envsVars.PORT,
    stripeSecret: envsVars.STRIPE_SECRET,
    endpointSecretHoockdeck: envsVars.ENDPOINT_SECRET_HOOKDECK,
    successUrl: envsVars.SUCCESS_URL,
    cancelUrl: envsVars.CANCEL_URL,
}