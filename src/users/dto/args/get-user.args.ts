import { IsNotEmpty } from 'class-validator';

export class GetUserArgs {
  @IsNotEmpty()
  userId: number;

}
