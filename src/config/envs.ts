import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  API_PREFIX:string
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    API_PREFIX:joi.string().required(),

  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  apiPrefix:envVars.API_PREFIX
};
