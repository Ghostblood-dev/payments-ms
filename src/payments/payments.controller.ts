import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
// import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';
import { PaymentSessionDTO } from './dto';
import { Request, Response } from 'express';
import { MessagePattern, Payload } from '@nestjs/microservices';


@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post()
  @MessagePattern('create.payment.session')
  createPaymentSession(@Payload() paymentSessionDTO: PaymentSessionDTO) {
    return this.paymentsService.createPaymentSession(paymentSessionDTO)
  }

  @MessagePattern('success')
  success() {
    return {
      ok: true,
      message: 'Payment successful'
    }
  }

  @MessagePattern('cancel')
  cancel() {
    return {
      ok: true,
      message: 'Payment cancelled'
    }
  }

  @Post('webhook')
  async stripeWebhook(@Req() req: Request, @Res() res: Response) {
    return this.paymentsService.stripeWebhook(req, res)
  }
}
