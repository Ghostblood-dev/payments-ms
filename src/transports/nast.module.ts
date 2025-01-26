import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs, NAST_SERVICES } from 'src/config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: NAST_SERVICES,
        transport: Transport.NATS,
        options: {
          servers: envs.natsServers
        }
      },
    ]),
  ],
  exports: [
    ClientsModule.register([
      {
        name: NAST_SERVICES,
        transport: Transport.NATS,
        options: {
          servers: envs.natsServers
        }
      },
    ]),
  ],
})
export class NastModule { }
