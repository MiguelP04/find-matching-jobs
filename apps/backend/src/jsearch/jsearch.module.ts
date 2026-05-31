import { Module } from '@nestjs/common';
import { JsearchService } from './jsearch.service';

@Module({
  providers: [JsearchService],
  exports: [JsearchService],
})
export class JsearchModule { }
