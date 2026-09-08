import {
    Module,
} from '@nestjs/common';

import {
    RacksController,
} from './racks.controller.js';

import {
    RacksService,
} from './racks.service.js';


@Module({
    controllers: [
        RacksController,
    ],

    providers: [
        RacksService,
    ],

    exports: [
        RacksService,
    ],
})
export class RacksModule {}