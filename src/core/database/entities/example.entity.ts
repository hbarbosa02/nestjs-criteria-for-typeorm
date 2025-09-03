import {
  Column
} from 'typeorm';
import { Base } from './base.entity';

export class Example extends Base {
    @Column()
    name: string;
}