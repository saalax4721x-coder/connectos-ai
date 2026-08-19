import type {PrivateDataAccess} from './private-data';
export const allowPrivateAccess=(x:PrivateDataAccess)=>x.authorized&&Boolean(x.purpose);
