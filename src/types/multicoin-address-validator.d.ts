declare module 'multicoin-address-validator' {
  interface WAValidator {
    validate(address: string, currency: string): boolean;
  }
  
  const validator: WAValidator;
  export default validator;
}
