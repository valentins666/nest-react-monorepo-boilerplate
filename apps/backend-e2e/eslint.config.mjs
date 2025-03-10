import eslintPrettierRecommended from 'eslint-plugin-prettier/recommended';
import baseConfig from '../../eslint.config.mjs';

export default [...baseConfig, eslintPrettierRecommended];
