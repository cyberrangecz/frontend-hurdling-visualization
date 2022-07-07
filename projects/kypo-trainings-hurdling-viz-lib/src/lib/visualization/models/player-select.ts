import { User } from '@sentinel/auth';


export interface PlayerSelect {
    player: User;
    selected: boolean;
    active: boolean;
}
