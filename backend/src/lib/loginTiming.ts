import bcrypt from "bcryptjs";
import { getBcryptRounds } from "./env.js";

/** Hash fixo para `bcrypt.compare` quando o usuário não existe (mitigação de timing). */
export const LOGIN_TIMING_DUMMY_HASH = bcrypt.hashSync("@@faxxiner-login-timing@@", getBcryptRounds());
