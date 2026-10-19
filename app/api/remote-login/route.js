import {login} from './login.mjs';
export const runtime='nodejs';
export async function POST(request){return login(request)}
