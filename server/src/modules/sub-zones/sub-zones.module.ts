import {
    Module,
} from '@nestjs/common';

import {
    SubZonesController,
} from './sub-zones.controller.js';

import {
    SubZonesService,
} from './sub-zones.service.js';


@Module({
    controllers: [
        SubZonesController,
    ],

    providers: [
        SubZonesService,
    ],

    exports: [
        SubZonesService,
    ],
})
export class SubZonesModule {}