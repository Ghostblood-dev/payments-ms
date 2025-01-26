import { Inject, Injectable, Logger } from '@nestjs/common';
import { envs, NAST_SERVICES } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDTO } from './dto';
import { Request, Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe(envs.stripeSecret)
    private readonly logger = new Logger('PaymentServices')

    constructor(
        @Inject(NAST_SERVICES) private readonly client: ClientProxy
    ) { }

    async createPaymentSession(paymentSessionDTO: PaymentSessionDTO) {

        const { currency, items, orderId } = paymentSessionDTO

        const lineItems = items.map(item => {
            return {
                price_data: {
                    currency: currency,
                    product_data: {
                        name: item.name
                    },
                    unit_amount: Math.round(item.price * 100), //20 dolares
                },
                quantity: item.quantity
            }
        })

        const session = await this.stripe.checkout.sessions.create({
            //Colocar aqui el ID de mi orden
            payment_intent_data: {
                metadata: {
                    orderId: orderId
                }
            },

            line_items: lineItems,
            mode: 'payment',
            success_url: envs.successUrl,
            cancel_url: envs.cancelUrl

        })
        // return session
        return {
            cancelUrl: envs.cancelUrl,
            successUrl: envs.successUrl,
            url: session.url
        }

    }

    async stripeWebhook(req: Request, res: Response) {

        const sig = req.headers['stripe-signature'];
        let event: Stripe.Event;
        const endpointSecret = envs.endpointSecretHoockdeck

        if (!sig) {
            return res.status(400).send('No stripe-signature header value was provided.');
        }

        try {
            event = this.stripe.webhooks.constructEvent(req['rawBody'], sig, endpointSecret);
        }
        catch (error) {
            res.status(400).send(`Webhook Error: ${error.message}`);
        }

        switch (event.type) {
            case 'charge.succeeded':
                const chargeSucceeded = event.data.object;
                const payload = {
                    stripePaymentId: chargeSucceeded.id,
                    orderId: chargeSucceeded.metadata.orderId,
                    receiptUrl: chargeSucceeded.receipt_url
                }
                this.client.emit('payment.succeeded', payload)
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
                res.status(400).json({ message: `Unhandled event type ${event.type}` })

        }
        res.status(200).json({ sig })


    }
}
