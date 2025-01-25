import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDTO } from './dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe(envs.stripeSecret)

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
            success_url: 'http://localhost:3000/payments/success',
            cancel_url: 'http://localhost:3000/payments/cancel'

        })
        return session

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
                console.log(
                    {
                        metadata: chargeSucceeded.metadata
                    }
                )
                res.status(200).json(event)
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
                res.status(400).json({ message: `Unhandled event type ${event.type}` })

        }

    }
}
